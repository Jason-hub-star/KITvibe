/**
 * @file hooks/useQuestionChat.ts
 * @description 채팅 비즈니스 로직 훅 — 메시지 전송, 스트리밍 수신, 모드 전환
 *   - POST /api/questions → 질문 저장 + 의도 분류
 *   - POST /api/questions/[id]/respond → 스트리밍 수신
 *   - parseAiResponse → 메타데이터 추출
 * @domain question
 * @access client
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatMode, ChatState } from '@/types/question.types';
import { parseAiResponse } from '@/utils/parseAiTags';

interface ModeAlert {
  show: boolean;
  from: ChatMode;
  to: ChatMode;
}

const INITIAL_MODE_ALERT: ModeAlert = { show: false, from: 'grill-me', to: 'grill-me' };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useQuestionChat(lessonId: string, lessonTitle: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    mode: 'grill-me',
    currentStep: 1,
    consecutiveWrong: 0,
    isStreaming: false,
    lessonTitle,
    lessonId,
    studentId: '',
  });

  const [modeAlert, setModeAlert] = useState<ModeAlert>(INITIAL_MODE_ALERT);
  const abortRef = useRef<AbortController | null>(null);

  // localStorage에서 student_id 읽기
  const getStudentId = useCallback((): string => {
    if (state.studentId) return state.studentId;
    if (typeof window === 'undefined') return '';
    const id = localStorage.getItem('pulda_user_id') ?? '';
    if (id) {
      setState((prev) => ({ ...prev, studentId: id }));
    }
    return id;
  }, [state.studentId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.isStreaming) return;

      const studentId = getStudentId();
      if (!studentId) {
        console.error('[useQuestionChat] student_id 없음');
        return;
      }

      // 1. user 메시지 추가
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        step: state.currentStep,
        mode: state.mode,
        createdAt: new Date(),
      };

      // 2. user + assistant placeholder 한 번에 추가
      const assistantId = generateId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        step: state.currentStep,
        mode: state.mode,
        createdAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isStreaming: true,
      }));

      try {
        // 3. POST /api/questions — 질문 저장 + 의도 분류
        const questionRes = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            student_id: studentId,
            question_text: trimmed,
          }),
        });

        const questionData = await questionRes.json();
        if (!questionData.success) {
          throw new Error(questionData.error || '질문 저장 실패');
        }

        const questionId = questionData.data.question.id;

        // 4. POST /api/questions/[id]/respond — 스트리밍
        // 대화 히스토리 구성 (최근 메시지들)
        const historyMessages = [...state.messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        abortRef.current = new AbortController();

        const streamRes = await fetch(`/api/questions/${questionId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            mode: state.mode,
            current_step: state.currentStep,
            consecutive_wrong: state.consecutiveWrong,
            messages: historyMessages,
          }),
          signal: abortRef.current.signal,
        });

        if (!streamRes.ok || !streamRes.body) {
          throw new Error('스트리밍 응답 실패');
        }

        // 5. 스트리밍 수신
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          // assistant 메시지 점진 업데이트 (태그는 실시간 필터링)
          const displayText = fullText.replace(/\[(?:RECOMMENDATION|MODE_SWITCH|MISCONCEPTION_TYPE|GROUNDED)[^\]]*\](?:\s*추천:\s*"[^"]*")?/g, '').trim();
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === assistantId ? { ...m, content: displayText } : m,
            ),
          }));
        }

        // 6. 스트리밍 완료 → 태그 파싱
        const parsed = parseAiResponse(fullText);

        setState((prev) => {
          let newMode = prev.mode;
          let newStep = prev.currentStep;
          const newConsecutiveWrong = prev.consecutiveWrong;

          // 모드 전환 감지
          if (parsed.modeSwitch && parsed.modeSwitch !== prev.mode) {
            setModeAlert({
              show: true,
              from: prev.mode,
              to: parsed.modeSwitch,
            });
            // 3초 후 Alert 숨기기
            setTimeout(() => setModeAlert(INITIAL_MODE_ALERT), 3000);
            newMode = parsed.modeSwitch;
          }

          // grill-me 모드에서 단계 진행 (간단한 휴리스틱: 추천이 있으면 다음 단계)
          if (prev.mode === 'grill-me' && parsed.recommendation && newStep < 4) {
            newStep = prev.currentStep + 1;
          }

          return {
            ...prev,
            mode: newMode,
            currentStep: newStep,
            consecutiveWrong: newConsecutiveWrong,
            isStreaming: false,
            messages: prev.messages.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: parsed.content,
                    recommendation: parsed.recommendation,
                    grounded: parsed.grounded,
                    misconceptionType: parsed.misconceptionType,
                    mode: newMode,
                    step: prev.currentStep,
                  }
                : m,
            ),
          };
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[useQuestionChat] sendMessage 실패:', err);

        // 에러 시 assistant 메시지에 에러 표시
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          messages: prev.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: '죄송해요, 응답 중 오류가 발생했어요. 다시 질문해주세요.' }
              : m,
          ),
        }));
      }
    },
    [state, lessonId, getStudentId],
  );

  const handleModeChange = useCallback((mode: ChatMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  return { state, sendMessage, handleModeChange, modeAlert };
}
