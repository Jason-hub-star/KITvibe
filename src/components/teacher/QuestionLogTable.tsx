/**
 * @file components/teacher/QuestionLogTable.tsx
 * @description 질문 로그 테이블 — Stitch P004 스타일
 *   - 강조 헤더 행 + 4열 테이블
 *   - 4열: 학생, 질문, 의도, 시각
 * @domain misconception
 * @access client
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { QuestionLogRow } from '@/types';

interface Props {
  logs: QuestionLogRow[];
}

const INTENT_LABELS: Record<string, string> = {
  concept: '개념',
  hint: '힌트',
  review: '검토',
  similar: '유사',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export function QuestionLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="ui-kicker text-muted-foreground">
            질문 로그
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">아직 질문이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border overflow-x-auto">
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="ui-kicker text-muted-foreground">
          질문 로그
        </h3>
        <span className="ui-kicker text-muted-foreground">
          최신 질문 기준
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-highest hover:bg-surface-highest">
            <TableHead className="ui-micro text-foreground font-bold">학생</TableHead>
            <TableHead className="ui-micro text-foreground font-bold">질문</TableHead>
            <TableHead className="ui-micro text-foreground font-bold">의도</TableHead>
            <TableHead className="ui-micro text-foreground font-bold">시각</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, i) => (
            <TableRow key={i} className="border-b border-border">
              <TableCell className="font-medium text-sm">{log.studentName}</TableCell>
              <TableCell className="text-sm">{log.questionText}</TableCell>
              <TableCell className="text-sm">{INTENT_LABELS[log.intentType] ?? log.intentType}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatTime(log.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
