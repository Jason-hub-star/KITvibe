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
    <div className="flex gap-4 items-end">
      <div className="flex-1 relative">
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
          className="w-full bg-background border border-border p-4 text-foreground focus:ring-0 focus:border-primary focus:outline-none resize-none min-h-[56px] placeholder:text-muted-foreground text-base disabled:opacity-50"
         
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="bg-primary text-primary-foreground h-14 w-14 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
       
        aria-label="전송"
      >
        <Send className="size-5" />
      </button>
    </div>
  );
}
