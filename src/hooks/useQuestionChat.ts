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

import { useState, useCallback, useEffect, useRef, type SetStateAction } from 'react';
import type {
  AnswerCheck,
  ChatMessage,
  ChatMode,
  ChatState,
  ParsedAiResponse,
} from '@/types/question.types';
import { parseAiResponse, stripAiMetadataTags } from '@/utils/parseAiTags';

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

function normalizeAnswerCheck(answerCheck: AnswerCheck | undefined, previousWrongCount: number): number {
  if (answerCheck === 'wrong') {
    return previousWrongCount + 1;
  }

  if (answerCheck === 'partial' || answerCheck === 'correct') {
    return 0;
  }

  return previousWrongCount;
}

function deriveNextChatState(
  prev: ChatState,
  parsed: ParsedAiResponse,
): Pick<ChatState, 'mode' | 'currentStep' | 'consecutiveWrong'> {
  const normalizedConsecutiveWrong = normalizeAnswerCheck(
    parsed.answerCheck,
    prev.consecutiveWrong,
  );
  let nextMode: ChatMode = prev.mode;
  let nextStep = prev.currentStep;
  const nextConsecutiveWrong = normalizedConsecutiveWrong;

  const canAdvanceByInferredSignal =
    parsed.answerCheckSource === 'inferred' &&
    parsed.answerCheck === 'correct' &&
    parsed.content.includes('?');

  if (prev.mode === 'grill-me' && normalizedConsecutiveWrong >= 3) {
    nextMode = 'guide-me';
  } else if (prev.mode === 'guide-me' && parsed.answerCheck === 'correct') {
    nextMode = 'grill-me';
  } else if (
    parsed.modeSwitch &&
    parsed.modeSwitch !== 'quick-me' &&
    parsed.modeSwitch !== prev.mode
  ) {
    nextMode = parsed.modeSwitch;
  }

  if (
    prev.mode === 'grill-me' &&
    parsed.answerCheck &&
    (parsed.hasExplicitAnswerCheck || canAdvanceByInferredSignal) &&
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
  const sessionIdRef = useRef<string | null>(null);
  const sessionKeyRef = useRef<string | null>(null);
  const sessionPromiseRef = useRef<Promise<string> | null>(null);
  const stateRef = useRef(state);

  const applyState = useCallback((updater: SetStateAction<ChatState>) => {
    setState((prev) => {
      const nextState =
        typeof updater === 'function'
          ? (updater as (prevState: ChatState) => ChatState)(prev)
          : updater;

      stateRef.current = nextState;
      sessionIdRef.current = nextState.sessionId;

      return nextState;
    });
  }, []);

  useEffect(() => {
    stateRef.current = state;
    sessionIdRef.current = state.sessionId;
  }, [state]);

  const syncSessionState = useCallback(
    async (
      sessionId: string,
      payload: {
        current_mode?: ChatMode;
        current_step?: number;
        consecutive_wrong?: number;
      },
    ) => {
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('[useQuestionChat] session sync 실패:', err);
      }
    },
    [],
  );

  const bootstrapSession = useCallback(async (): Promise<string> => {
    if (!lessonId || !studentId) {
      throw new Error('세션 생성에 필요한 정보가 없습니다.');
    }

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

    const nextSessionId = data.data.session.id as string;
    sessionIdRef.current = nextSessionId;

    applyState((prev) => ({
      ...prev,
      sessionId: nextSessionId,
      lessonId,
      lessonTitle,
      studentId,
    }));

    return nextSessionId;
  }, [applyState, lessonId, lessonTitle, studentId]);

  const ensureSessionId = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = bootstrapSession().finally(() => {
        sessionPromiseRef.current = null;
      });
    }

    return sessionPromiseRef.current;
  }, [bootstrapSession]);

  useEffect(() => {
    if (!lessonId || !studentId) return;

    const sessionKey = `${lessonId}:${studentId}`;
    if (sessionKeyRef.current !== sessionKey) {
      sessionKeyRef.current = sessionKey;
      sessionIdRef.current = null;
      sessionPromiseRef.current = null;

      applyState((prev) => ({
        ...prev,
        lessonId,
        lessonTitle,
        studentId,
        sessionId: null,
        mode: 'grill-me',
        currentStep: 1,
        consecutiveWrong: 0,
        messages: [],
        isStreaming: false,
      }));
    }

    void ensureSessionId().catch((err) => {
      console.error('[useQuestionChat] session bootstrap 실패:', err);
    });
  }, [applyState, ensureSessionId, lessonId, lessonTitle, studentId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (modeAlertTimerRef.current) {
        clearTimeout(modeAlertTimerRef.current);
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (input: { text: string; image?: File | null }) => {
      const trimmed = input.text.trim();
      const latestState = stateRef.current;
      if ((!trimmed && !input.image) || latestState.isStreaming) return;

      if (!latestState.studentId) {
        console.error('[useQuestionChat] student_id 없음');
        return;
      }

      const assistantId = generateId();

      try {
        applyState((prev) => ({ ...prev, isStreaming: true }));
        const ensuredSessionId = await ensureSessionId();
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
          step: latestState.currentStep,
          mode: latestState.mode,
          createdAt: new Date(),
        };

        // 2. user + assistant placeholder 한 번에 추가
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          step: latestState.currentStep,
          mode: latestState.mode,
          createdAt: new Date(),
        };

        applyState((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage, assistantMessage],
        }));

        // 3. POST /api/questions — 질문 저장 + 의도 분류
        const questionRes = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            student_id: latestState.studentId,
            session_id: ensuredSessionId,
            question_text: trimmed,
            image_url: uploadedImageUrl,
          }),
        });

        const questionData = await questionRes.json();
        if (!questionData.success) {
          throw new Error(questionData.error || '질문 저장 실패');
        }

        if (!questionData.data.question.session_id) {
          throw new Error('질문에 session_id가 연결되지 않았습니다.');
        }

        const questionId = questionData.data.question.id;

        // 4. POST /api/questions/[id]/respond — 스트리밍
        // 대화 히스토리 구성 (최근 메시지들)
        const historyMessages = [...latestState.messages, userMessage].map((m) => ({
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
            mode: latestState.mode,
            current_step: latestState.currentStep,
            consecutive_wrong: latestState.consecutiveWrong,
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
          const displayText = stripAiMetadataTags(fullText);
          applyState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === assistantId ? { ...m, content: displayText } : m,
            ),
          }));
        }

        // 6. 스트리밍 완료 → 태그 파싱
        const parsed = parseAiResponse(fullText);
        const previousState = stateRef.current;
        const nextTutorState = deriveNextChatState(previousState, parsed);

        if (nextTutorState.mode !== previousState.mode && nextTutorState.mode !== 'quick-me') {
          setModeAlert({
            show: true,
            from: previousState.mode,
            to: nextTutorState.mode,
          });
          if (modeAlertTimerRef.current) clearTimeout(modeAlertTimerRef.current);
          modeAlertTimerRef.current = setTimeout(() => setModeAlert(INITIAL_MODE_ALERT), 3000);
        }

        await syncSessionState(ensuredSessionId, {
          current_mode: nextTutorState.mode,
          current_step: nextTutorState.currentStep,
          consecutive_wrong: nextTutorState.consecutiveWrong,
        });

        applyState((prev) => ({
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
                  answerCheck: parsed.hasExplicitAnswerCheck ? parsed.answerCheck : undefined,
                  misconceptionType: parsed.misconceptionType,
                  mode: nextTutorState.mode,
                  step: nextTutorState.currentStep,
                }
              : m,
          ),
        }));
        abortRef.current = null;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[useQuestionChat] sendMessage 실패:', err);

        // 에러 시 assistant 메시지에 에러 표시
        applyState((prev) => ({
          ...prev,
          isStreaming: false,
          messages: prev.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: '죄송해요, 응답 중 오류가 발생했어요. 다시 질문해주세요.' }
              : m,
          ),
        }));
      } finally {
        abortRef.current = null;
      }
    },
    [applyState, ensureSessionId, lessonId, syncSessionState],
  );

  const handleModeChange = useCallback((mode: ChatMode) => {
    applyState((prev) => ({ ...prev, mode }));

    void ensureSessionId()
      .then((sessionId) => syncSessionState(sessionId, { current_mode: mode }))
      .catch((err) => {
        console.error('[useQuestionChat] mode sync 실패:', err);
      });
  }, [applyState, ensureSessionId, syncSessionState]);

  return { state, sendMessage, handleModeChange, modeAlert };
}
