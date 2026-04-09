/**
 * @file components/student/ChatInput.tsx
 * @description 채팅 입력 영역 — 입력 셸 내부 버튼 정렬
 *   - Enter → 전송, Shift+Enter → 줄바꿈
 *   - 이미지 버튼/전송 버튼이 동일 입력 박스 안에 배치
 * @domain question
 * @access client
 */

'use client';

import { useState, useRef, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { ImagePlus, Send, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (input: { text: string; image?: File | null }) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if ((!trimmed && !imageFile) || disabled) return;
    onSend({ text: trimmed, image: imageFile });
    setValue('');
    setImageFile(null);
    setPreviewUrl(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value, imageFile, disabled, onSend]);

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

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {previewUrl && (
        <div className="border border-border bg-card p-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-border">
              <Image
                src={previewUrl}
                alt="질문 이미지 미리보기"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{imageFile?.name}</p>
              <p className="text-xs text-muted-foreground">이미지 1장이 함께 전송됩니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="p-2 hover:bg-muted transition-colors"
            aria-label="첨부 이미지 제거"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleImageChange}
          disabled={disabled}
        />
        <div className="flex items-end gap-2 border border-border bg-background p-2 md:p-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="질문 이미지 추가"
          >
            <ImagePlus className="size-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="질문을 입력하거나 이미지를 함께 보내보세요..."
            rows={1}
            className="min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground md:min-h-[44px] md:text-base"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (!value.trim() && !imageFile)}
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-all active:scale-95 disabled:opacity-50"
            aria-label="전송"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
