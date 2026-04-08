/**
 * @file components/student/ChatInput.tsx
 * @description 채팅 입력 영역 — Stitch 스타일 textarea + 전송 버튼
 *   - Enter → 전송, Shift+Enter → 줄바꿈
 *   - 블랙 정사각형 전송 버튼
 * @domain question
 * @access client
 */

'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="이곳에 답변을 입력하세요..."
        rows={1}
        className="w-full bg-background border border-border px-3 py-2.5 pr-16 md:p-4 md:pr-16 text-foreground focus:ring-0 focus:border-primary focus:outline-none resize-none min-h-11 md:min-h-[56px] placeholder:text-muted-foreground text-sm md:text-base disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="absolute right-1.5 bottom-1.5 bg-primary text-primary-foreground h-11 w-11 md:h-10 md:w-10 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
        aria-label="전송"
      >
        <Send className="size-4 md:size-4" />
      </button>
    </div>
  );
}
