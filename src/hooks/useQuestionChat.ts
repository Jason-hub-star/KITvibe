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

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, ChatMode, ChatState, ParsedAiResponse } from '@/types/question.types';
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

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('이미지 data URL 생성 실패'));
    };
    reader.onerror = () => reject(new Error('이미지 data URL 생성 실패'));
    reader.readAsDataURL(file);
  });
}

function deriveNextChatState(
  prev: ChatState,
  parsed: ParsedAiResponse,
): Pick<ChatState, 'mode' | 'currentStep' | 'consecutiveWrong'> {
  let nextMode = prev.mode;
  let nextStep = prev.currentStep;
  let nextConsecutiveWrong = prev.consecutiveWrong;

  if (parsed.answerCheck === 'wrong') {
    nextConsecutiveWrong = prev.consecutiveWrong + 1;
  } else if (parsed.answerCheck === 'correct') {
    nextConsecutiveWrong = 0;
  }

  if (parsed.modeSwitch && parsed.modeSwitch !== 'quick-me' && parsed.modeSwitch !== prev.mode) {
    nextMode = parsed.modeSwitch;
  }

  if (
    prev.mode === 'grill-me' &&
    parsed.recommendation &&
    parsed.answerCheck !== 'wrong' &&
    nextStep < 4
  ) {
    nextStep = prev.currentStep + 1;
  }

  if (
    prev.mode === 'guide-me' &&
    parsed.answerCheck === 'correct' &&
    nextMode === 'grill-me' &&
    nextStep < 4
  ) {
    nextStep = prev.currentStep + 1;
  }

  return {
    mode: nextMode,
    currentStep: nextStep,
    consecutiveWrong: nextConsecutiveWrong,
  };
}

export function useQuestionChat(lessonId: string, lessonTitle: string, studentId: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    mode: 'grill-me',
    currentStep: 1,
    consecutiveWrong: 0,
    sessionId: null,
    isStreaming: false,
    lessonTitle,
    lessonId,
    studentId,
  });

  const [modeAlert, setModeAlert] = useState<ModeAlert>(INITIAL_MODE_ALERT);
  const abortRef = useRef<AbortController | null>(null);
  const modeAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionBootstrapRef = useRef<string | null>(null);

  const syncSessionState = useCallback(
    async (payload: {
      current_mode?: ChatMode;
      current_step?: number;
      consecutive_wrong?: number;
    }) => {
      if (!state.sessionId) return;

      try {
        await fetch(`/api/sessions/${state.sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('[useQuestionChat] session sync 실패:', err);
      }
    },
    [state.sessionId],
  );

  useEffect(() => {
    if (!studentId || studentId === state.studentId) return;
    setState((prev) => ({ ...prev, studentId }));
  }, [studentId, state.studentId]);

  useEffect(() => {
    if (!lessonId || !studentId) return;

    const sessionKey = `${lessonId}:${studentId}`;
    if (sessionBootstrapRef.current === sessionKey) return;

    sessionBootstrapRef.current = sessionKey;
    let cancelled = false;

    async function bootstrapSession() {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            student_id: studentId,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || '세션 생성 실패');
        }

        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            sessionId: data.data.session.id,
            studentId,
          }));
        }
      } catch (err) {
        sessionBootstrapRef.current = null;
        console.error('[useQuestionChat] session bootstrap 실패:', err);
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [lessonId, studentId]);

  const sendMessage = useCallback(
    async (input: { text: string; image?: File | null }) => {
      const trimmed = input.text.trim();
      if ((!trimmed && !input.image) || state.isStreaming) return;

      if (!state.studentId) {
        console.error('[useQuestionChat] student_id 없음');
        return;
      }

      const assistantId = generateId();

      try {
        let uploadedImageUrl: string | null = null;
        let imageDataUrl: string | undefined;

        if (input.image) {
          const formData = new FormData();
          formData.append('file', input.image);

          const uploadRes = await fetch('/api/questions/image', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadData.success) {
            throw new Error(uploadData.error || '질문 이미지 업로드 실패');
          }

          uploadedImageUrl = uploadData.data.image_url;
          imageDataUrl = await fileToDataUrl(input.image);
        }

        // 1. user 메시지 추가
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content: trimmed,
          imageUrl: imageDataUrl,
          step: state.currentStep,
          mode: state.mode,
          createdAt: new Date(),
        };

        // 2. user + assistant placeholder 한 번에 추가
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

        // 3. POST /api/questions — 질문 저장 + 의도 분류
        const questionRes = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            student_id: state.studentId,
            session_id: state.sessionId,
            question_text: trimmed,
            image_url: uploadedImageUrl,
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
          image_url: m.imageUrl,
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
          const displayText = fullText.replace(/\[(?:RECOMMENDATION|ANSWER_CHECK|MODE_SWITCH|MISCONCEPTION_TYPE|GROUNDED)[^\]]*\](?:\s*추천:\s*"[^"]*")?/g, '').trim();
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === assistantId ? { ...m, content: displayText } : m,
            ),
          }));
        }

        // 6. 스트리밍 완료 → 태그 파싱
        const parsed = parseAiResponse(fullText);
        const nextTutorState = deriveNextChatState(state, parsed);

        if (parsed.modeSwitch && parsed.modeSwitch !== state.mode && parsed.modeSwitch !== 'quick-me') {
          setModeAlert({
            show: true,
            from: state.mode,
            to: parsed.modeSwitch,
          });
          if (modeAlertTimerRef.current) clearTimeout(modeAlertTimerRef.current);
          modeAlertTimerRef.current = setTimeout(() => setModeAlert(INITIAL_MODE_ALERT), 3000);
        }

        await syncSessionState({
          current_mode: nextTutorState.mode,
          current_step: nextTutorState.currentStep,
          consecutive_wrong: nextTutorState.consecutiveWrong,
        });

        setState((prev) => {
          return {
            ...prev,
            mode: nextTutorState.mode,
            currentStep: nextTutorState.currentStep,
            consecutiveWrong: nextTutorState.consecutiveWrong,
            isStreaming: false,
            messages: prev.messages.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: parsed.content,
                    recommendation: parsed.recommendation,
                    grounded: parsed.grounded,
                    answerCheck: parsed.answerCheck,
                    misconceptionType: parsed.misconceptionType,
                    mode: nextTutorState.mode,
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
    [state, lessonId, syncSessionState],
  );

  const handleModeChange = useCallback((mode: ChatMode) => {
    setState((prev) => ({ ...prev, mode }));
    void syncSessionState({ current_mode: mode });
  }, [syncSessionState]);

  return { state, sendMessage, handleModeChange, modeAlert };
}
