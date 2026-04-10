/**
 * @file components/student/QuestionChat.tsx
 * @description 채팅 레이아웃 셸 — Stitch 에디토리얼 스타일
 *   - fixed header: 뒤로가기 + 수업명 + 질문 N/4 + 2px progress
 *   - main: 메시지 목록 (ScrollArea, auto-scroll)
 *   - fixed bottom: ModeSelector + ChatInput
 *   - 모드 전환 Alert
 * @domain question
 * @access client
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Home, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import MessageBubble from '@/components/student/MessageBubble';
import ChatInput from '@/components/student/ChatInput';
import ModeSelector from '@/components/student/ModeSelector';
import SessionStats from '@/components/student/SessionStats';
import { useQuestionChat } from '@/hooks/useQuestionChat';
import { useRole } from '@/components/layout/RoleProvider';
import { getChatStep } from '@/utils/chatSteps';

interface QuestionChatProps {
  lessonId: string;
  lessonTitle: string;
  topic: string;
}

const MODE_LABELS: Record<string, string> = {
  'grill-me': '질문을 통해 스스로 답을 찾아가는 모드예요',
  'guide-me': '어려운 부분을 단계별로 설명해줄게요',
  'quick-me': '바로 풀이를 보여드릴게요',
};

export default function QuestionChat({ lessonId, lessonTitle, topic }: QuestionChatProps) {
  const { userId } = useRole();
  const { state, sendMessage, handleModeChange, modeAlert } = useQuestionChat(lessonId, lessonTitle, userId ?? '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const currentStepInfo = getChatStep(state.currentStep);

  // 메시지 추가 시 자동 스크롤
  // - 새 메시지(length 증가): smooth
  // - 스트리밍 content 업데이트(length 동일): auto(instant) — 떨림 방지
  useEffect(() => {
    const isNewMessage = state.messages.length !== prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = state.messages.length;
    messagesEndRef.current?.scrollIntoView({ behavior: isNewMessage ? 'smooth' : 'auto' });
  }, [state.messages]);

  const progressPercent = (state.currentStep / 4) * 100;

  async function handleGenerateQuiz() {
    if (!state.sessionId) return;

    try {
      setIsQuizLoading(true);
      const response = await fetch(`/api/sessions/${state.sessionId}/quiz`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '미니퀴즈 생성 실패');
      }

      setQuizQuestion(data.data.quiz_question);
      setQuizFeedback(null);
      setQuizPassed(null);
    } catch (err) {
      console.error('[QuestionChat] quiz 생성 실패:', err);
    } finally {
      setIsQuizLoading(false);
    }
  }

  async function handleGradeQuiz() {
    if (!state.sessionId || !quizQuestion || !quizAnswer.trim()) return;

    try {
      setIsQuizLoading(true);
      const response = await fetch(`/api/sessions/${state.sessionId}/quiz/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: quizAnswer }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '미니퀴즈 채점 실패');
      }

      setQuizFeedback(data.data.feedback);
      setQuizPassed(data.data.passed);
    } catch (err) {
      console.error('[QuestionChat] quiz 채점 실패:', err);
    } finally {
      setIsQuizLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full bg-background border-b border-border z-50">
        <div className="flex justify-between items-center w-full px-3 md:px-4 h-16 max-w-4xl mx-auto gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link
              href="/student/ask"
              className="p-2 hover:bg-muted transition-colors"
             
              aria-label="수업 선택으로 돌아가기"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-sm md:text-base font-bold tracking-tight truncate">{lessonTitle}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link
              href="/"
              className="hidden sm:inline-flex p-2 hover:bg-muted transition-colors"
             
              aria-label="홈으로 이동"
            >
              <Home className="size-5" />
            </Link>
            <span className="ui-micro font-bold tracking-tight text-muted-foreground whitespace-nowrap">
              {currentStepInfo.label} · {state.currentStep}/4
            </span>
          </div>
        </div>
        {/* 2px Progress Bar */}
        <div className="w-full bg-muted h-[2px]">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-24 pb-48 flex flex-col gap-12">
        {/* 모드 전환 Alert */}
        {modeAlert.show && (
          <Alert className="border-primary">
            <Info className="size-4" />
            <AlertTitle>모드 전환</AlertTitle>
            <AlertDescription>
              {MODE_LABELS[modeAlert.to]}
            </AlertDescription>
          </Alert>
        )}

        {/* 초기 안내 (메시지 없을 때) */}
        {state.messages.length === 0 && (
          <section className="flex flex-col items-start max-w-2xl gap-4">
            <label className="ui-kicker text-muted-foreground">
              풀다 AI
            </label>
            <div
              className="bg-card border border-border p-8 w-full"
             
            >
              <p className="text-lg leading-relaxed text-foreground mb-2">
                <strong>{lessonTitle}</strong>에서 막힌 부분이 있나요?
              </p>
              <p className="ui-support text-muted-foreground">
                답을 바로 알려주지 않아요. 질문을 통해 스스로 찾을 수 있도록 도와줄게요.
              </p>
            </div>
            <p className="ui-micro text-muted-foreground">
              학생 화면은 질문과 복습 전용입니다. 수업 자료와 교사 데이터는 이 화면에서 수정할 수 없습니다.
            </p>

            {/* 예시 질문 버튼 */}
            <div className="flex flex-col gap-2 w-full">
              <label className="ui-kicker text-muted-foreground">
                이런 질문을 해보세요
              </label>
              {[
                '이 개념이 잘 이해가 안 돼요',
                '문제 풀다가 막혔어요, 힌트 주세요',
                '비슷한 문제를 더 풀어보고 싶어요',
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage({ text: question })}
                  disabled={state.isStreaming}
                  className="text-left px-6 py-4 border border-border bg-background hover:bg-muted transition-colors text-sm text-foreground disabled:opacity-50"
                 
                >
                  {question}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 메시지 목록 */}
        {state.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* 스트리밍 인디케이터 */}
        {state.isStreaming && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Stats Grid — 메시지가 있을 때만 */}
        {state.messages.length > 0 && (
          <SessionStats topic={topic} currentStep={state.currentStep} mode={state.mode} />
        )}

        {state.currentStep >= 4 && state.sessionId && (
          <section className="flex flex-col items-start max-w-2xl gap-2 w-full">
              <label className="ui-kicker text-muted-foreground">
                미니퀴즈
              </label>
            <div className="bg-card border border-border p-6 md:p-8 w-full space-y-4">
              {!quizQuestion ? (
                <>
                  <p className="ui-support text-muted-foreground">
                    마지막으로 핵심 개념을 직접 설명해보는 미니퀴즈 1문항을 풀어볼까요?
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={isQuizLoading}
                    className="px-4 py-3 bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {isQuizLoading ? '생성 중...' : '미니퀴즈 시작'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-foreground leading-relaxed">
                    {quizQuestion}
                  </p>
                  <textarea
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    placeholder="한두 문장으로 직접 설명해보세요."
                    className="w-full min-h-28 border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleGradeQuiz}
                      disabled={isQuizLoading || !quizAnswer.trim()}
                      className="px-4 py-3 bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                    >
                      {isQuizLoading ? '채점 중...' : '채점 받기'}
                    </button>
                    {quizPassed !== null && (
                      <Link
                        href={`/student/summary?session=${state.sessionId}`}
                        className="px-4 py-3 border border-border text-sm font-medium hover:bg-muted transition-colors"
                      >
                        세션 요약 보기
                      </Link>
                    )}
                  </div>
                  {quizFeedback && (
                    <div className="border border-border bg-muted p-4">
                      <p className="text-sm font-medium text-foreground">
                        {quizPassed ? '오개념 회복' : '한 번 더 점검해봐요'}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {quizFeedback}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 w-full bg-background border-t border-border z-50">
        <div className="max-w-4xl mx-auto px-3 py-2 md:p-6 flex flex-col gap-2 md:gap-4">
          <ModeSelector
            mode={state.mode}
            onModeChange={handleModeChange}
            disabled={state.isStreaming}
          />
          <ChatInput
            onSend={sendMessage}
            disabled={state.isStreaming}
          />
        </div>
      </nav>
    </div>
  );
}
