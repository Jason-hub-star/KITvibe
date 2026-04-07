/**
 * @file components/student/MessageBubble.tsx
 * @description 채팅 메시지 버블 — Stitch 에디토리얼 스타일
 *   - AI: 좌측 정렬, bg-card, 라벨 "풀다 AI"
 *   - 학생: 우측 정렬, bg-primary, 라벨 "STUDENT"
 *   - KaTeX 수식, 추천 보기 Collapsible, 근거 Badge
 * @domain question
 * @access client
 */

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import type { ChatMessage } from '@/types/question.types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [recOpen, setRecOpen] = useState(false);
  const isAi = message.role === 'assistant';

  if (!isAi) {
    // 학생 메시지
    return (
      <section className="flex flex-col items-end self-end max-w-2xl gap-2 w-full">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Student
        </label>
        <div
          className="bg-primary text-primary-foreground p-8 w-full text-right"
         
        >
          <p className="text-lg leading-relaxed font-medium">{message.content}</p>
        </div>
      </section>
    );
  }

  // AI 메시지
  return (
    <section className="flex flex-col items-start max-w-2xl gap-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        풀다 AI
      </label>
      <div
        className="bg-card border border-border p-8 w-full"
       
      >
        {/* 단계 배지 */}
        {message.step && (
          <Badge variant="secondary" className="mb-4 rounded-none">
            질문 {message.step}/4
          </Badge>
        )}

        {/* 마크다운 + KaTeX */}
        <div className="prose prose-lg max-w-none text-foreground leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // 수식 블록을 Stitch 스타일 카드로 감싸기
              pre: ({ children }) => (
                <div
                  className="bg-muted border border-border p-6 flex justify-center items-center my-4 not-prose"
                 
                >
                  {children}
                </div>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* 근거 Badge — 수업자료 기반 응답일 때만 표시 */}
        {message.grounded && (
          <div className="mt-4">
            <Badge variant="secondary" className="rounded-none">
              📚 수업자료에서 찾았어요
            </Badge>
          </div>
        )}

        {/* 추천 보기 Collapsible */}
        {message.recommendation && (
          <Collapsible open={recOpen} onOpenChange={setRecOpen} className="mt-4">
            <CollapsibleTrigger className="flex items-center gap-2 group cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary group-hover:underline">
                💡 힌트 보기
              </span>
              {recOpen ? (
                <ChevronUp className="size-3.5 text-primary" />
              ) : (
                <ChevronDown className="size-3.5 text-primary" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-4 bg-muted border border-border">
              <p className="text-base text-foreground leading-relaxed">
                {message.recommendation}
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </section>
  );
}
