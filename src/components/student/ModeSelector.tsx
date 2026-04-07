/**
 * @file components/student/ModeSelector.tsx
 * @description 모드 토글 — Stitch 스타일 텍스트 + underline
 *   - GRILL-ME / GUIDE-ME / QUICK-ME
 *   - active: border-b-2 border-primary
 * @domain question
 * @access client
 */

'use client';

import type { ChatMode } from '@/types/question.types';

interface ModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const MODES: { key: ChatMode; label: string; desc: string }[] = [
  { key: 'grill-me', label: '질문으로 풀기', desc: '스스로 생각하기' },
  { key: 'guide-me', label: '설명 받기', desc: '단계별 안내' },
  { key: 'quick-me', label: '바로 풀이', desc: '빠른 해결' },
];

export default function ModeSelector({ mode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="flex gap-4 items-center border-b border-border">
      {MODES.map(({ key, label, desc }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          disabled={disabled}
          className={`transition-colors pb-3 -mb-px flex flex-col items-start ${
            mode === key
              ? 'border-b-2 border-primary'
              : 'hover:opacity-80'
          } disabled:opacity-50`}
        >
          <span className={`text-xs font-bold ${
            mode === key ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {label}
          </span>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
            {desc}
          </span>
        </button>
      ))}
    </div>
  );
}
