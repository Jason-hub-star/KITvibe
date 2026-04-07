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
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import MessageBubble from '@/components/student/MessageBubble';
import ChatInput from '@/components/student/ChatInput';
import ModeSelector from '@/components/student/ModeSelector';
import SessionStats from '@/components/student/SessionStats';
import { useQuestionChat } from '@/hooks/useQuestionChat';

interface QuestionChatProps {
  lessonId: string;
  lessonTitle: string;
  topic: string;
}

const MODE_LABELS: Record<string, string> = {
  'grill-me': 'Grill-Me: 질문으로 사고를 유도합니다',
  'guide-me': 'Guide-Me: 단계별 설명을 제공합니다',
  'quick-me': 'Quick-Me: 빠른 풀이를 보여줍니다',
};

export default function QuestionChat({ lessonId, lessonTitle, topic }: QuestionChatProps) {
  const { state, sendMessage, handleModeChange, modeAlert } = useQuestionChat(lessonId, lessonTitle);
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
        <div className="flex justify-between items-center w-full px-4 h-16 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/student/ask"
              className="p-2 hover:bg-muted transition-colors"
              style={{ borderRadius: 0 }}
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-base font-bold tracking-tight">{lessonTitle}</h1>
          </div>
          <div className="flex items-center">
            <span className="text-base font-bold tracking-tight text-muted-foreground">
              질문 {state.currentStep}/4
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
          <Alert className="border-primary" style={{ borderRadius: 0 }}>
            <Info className="size-4" />
            <AlertTitle>모드 전환</AlertTitle>
            <AlertDescription>
              {MODE_LABELS[modeAlert.to]}
            </AlertDescription>
          </Alert>
        )}

        {/* 초기 안내 (메시지 없을 때) */}
        {state.messages.length === 0 && (
          <section className="flex flex-col items-start max-w-2xl gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              풀다 AI
            </label>
            <div
              className="bg-card border border-border p-8 w-full"
              style={{ borderRadius: 0 }}
            >
              <p className="text-lg leading-relaxed text-foreground">
                안녕! <strong>{lessonTitle}</strong>에 대해 궁금한 점이 있으면 질문해줘.
                내가 질문을 통해 네가 스스로 답을 찾을 수 있도록 도와줄게. 💪
              </p>
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
        <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-4">
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
