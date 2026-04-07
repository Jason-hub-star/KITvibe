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

const MODES: { key: ChatMode; label: string }[] = [
  { key: 'grill-me', label: 'GRILL-ME' },
  { key: 'guide-me', label: 'GUIDE-ME' },
  { key: 'quick-me', label: 'QUICK-ME' },
];

export default function ModeSelector({ mode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="flex gap-6 items-center border-b border-border pb-4">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          disabled={disabled}
          className={`text-[10px] font-bold uppercase tracking-widest transition-colors pb-1 ${
            mode === key
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          } disabled:opacity-50`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
