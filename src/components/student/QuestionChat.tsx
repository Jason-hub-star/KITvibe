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

import { useEffect, useRef } from 'react';
import { ArrowLeft, Home, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import MessageBubble from '@/components/student/MessageBubble';
import ChatInput from '@/components/student/ChatInput';
import ModeSelector from '@/components/student/ModeSelector';
import SessionStats from '@/components/student/SessionStats';
import { useQuestionChat } from '@/hooks/useQuestionChat';
import { useRole } from '@/components/layout/RoleProvider';

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

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const progressPercent = (state.currentStep / 4) * 100;

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
            <span className="text-[10px] md:text-xs font-bold tracking-tight text-muted-foreground whitespace-nowrap">
              {state.currentStep}/4단계
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              풀다 AI
            </label>
            <div
              className="bg-card border border-border p-8 w-full"
             
            >
              <p className="text-lg leading-relaxed text-foreground mb-2">
                <strong>{lessonTitle}</strong>에서 막힌 부분이 있나요?
              </p>
              <p className="text-sm text-muted-foreground">
                답을 바로 알려주지 않아요. 질문을 통해 스스로 찾을 수 있도록 도와줄게요.
              </p>
            </div>

            {/* 예시 질문 버튼 */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
          <SessionStats topic={topic} currentStep={state.currentStep} />
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
