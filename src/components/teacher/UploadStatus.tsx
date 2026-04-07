/**
 * @file components/teacher/UploadStatus.tsx
 * @description 개별 파일 업로드/처리 상태 표시
 * @domain lesson
 * @access client
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ImageIcon, X } from 'lucide-react';
import type { UploadFile } from '@/types';

interface UploadStatusProps {
  uploadFile: UploadFile;
  onRemove?: () => void;
}

const STATUS_CONFIG = {
  idle: { label: '대기', variant: 'outline' as const },
  uploading: { label: '업로드 중', variant: 'secondary' as const },
  processing: { label: '처리 중', variant: 'secondary' as const },
  success: { label: '완료', variant: 'default' as const },
  error: { label: '실패', variant: 'destructive' as const },
} as const;

function getFileIcon(fileName: string) {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  }
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadStatus({ uploadFile, onRemove }: UploadStatusProps) {
  const { file, status, error } = uploadFile;
  const config = STATUS_CONFIG[status];
  const isActive = status === 'uploading' || status === 'processing';

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {getFileIcon(file.name)}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>

        {isActive && (
          <Progress value={status === 'uploading' ? 50 : 80} className="mt-1.5 h-1.5" />
        )}

        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>

      <Badge variant={config.variant}>{config.label}</Badge>

      {(status === 'idle' || status === 'error') && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="파일 제거"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
