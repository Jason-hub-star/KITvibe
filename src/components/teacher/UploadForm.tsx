/**
 * @file components/teacher/UploadForm.tsx
 * @description 교사 수업 자료 업로드 폼 — Stitch 에디토리얼 스타일
 *   - underline-only 입력 (border-b)
 *   - 10px uppercase 라벨
 *   - flat 파일 리스트 (border-b 구분)
 *   - 넓은 간격 (space-y-12)
 * @domain lesson
 * @access client
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { ArrowLeft, Upload, BookOpen, Link2, LayoutDashboard, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { createLesson } from '@/lib/actions/lessons';
import type { UploadFile, UploadStatus as UploadStatusType } from '@/types';

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md', '.markdown'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadFormProps {
  teacherId: string;
}

export default function UploadForm({ teacherId }: UploadFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedLessonId, setCompletedLessonId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      status: 'idle' as UploadStatusType,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        const msg = r.errors.map((e) => e.message).join(', ');
        toast.error(`${r.file.name}: ${msg}`);
      });
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileStatus = (index: number, status: UploadStatusType, error?: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status, error } : f)),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || files.length === 0) return;

    setIsSubmitting(true);

    try {
      const lessonResult = await createLesson({
        title: title.trim(),
        topic: topic.trim() || undefined,
        teacher_id: teacherId,
      });

      if (!lessonResult.success) {
        toast.error(lessonResult.error);
        setIsSubmitting(false);
        return;
      }

      const lessonId = lessonResult.data.id;

      for (let i = 0; i < files.length; i++) {
        updateFileStatus(i, 'uploading');

        try {
          const formData = new FormData();
          formData.set('file', files[i].file);
          formData.set('lesson_id', lessonId);

          updateFileStatus(i, 'processing');

          const response = await fetch('/api/materials/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            updateFileStatus(i, 'success');
          } else {
            updateFileStatus(i, 'error', result.error);
          }
        } catch {
          updateFileStatus(i, 'error', '업로드 중 오류가 발생했습니다.');
        }
      }

      setCompletedLessonId(lessonId);
      toast.success('지식베이스가 생성되었습니다!');
    } catch {
      toast.error('수업 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!completedLessonId) return;
    const link = `${window.location.origin}/student/ask?lesson=${completedLessonId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('학생 링크가 복사되었습니다!'))
      .catch(() => toast.error('링크 복사에 실패했습니다.'));
  };

  const canSubmit = title.trim().length > 0 && files.length > 0 && !isSubmitting;

  return (
    <div className="w-full space-y-12">
      {/* 돌아가기 */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span className="text-[10px] font-bold tracking-widest uppercase">돌아가기</span>
      </button>

      {/* 완료 Alert */}
      {completedLessonId && (
        <Alert style={{ borderRadius: 0 }}>
          <BookOpen className="h-4 w-4" />
          <AlertTitle>지식베이스 생성 완료!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">학생들이 이 수업에 대해 질문할 수 있습니다.</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/teacher/dashboard')}
                style={{ borderRadius: 0 }}
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                대시보드 보기
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyLink} style={{ borderRadius: 0 }}>
                <Link2 className="mr-1.5 h-4 w-4" />
                링크 복사
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 제목 입력 — Stitch underline 스타일 */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          제목
        </label>
        <input
          type="text"
          placeholder="예: 이차방정식의 근의 공식"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!!completedLessonId}
          className="w-full bg-transparent border-0 border-b border-border py-4 px-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:border-primary focus:border-b-2 transition-all outline-none disabled:opacity-50"
        />
      </div>

      {/* 주제 입력 — Stitch underline 스타일 */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          주제
        </label>
        <input
          type="text"
          placeholder="예: 근의 공식, 판별식"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={!!completedLessonId}
          className="w-full bg-transparent border-0 border-b border-border py-4 px-0 text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:border-primary focus:border-b-2 transition-all outline-none disabled:opacity-50"
        />
      </div>

      {/* 파일 업로드 — Stitch dashed 스타일 */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          파일 업로드
        </label>
        {!completedLessonId && (
          <div
            {...getRootProps()}
            className={`h-48 w-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors border border-dashed ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted'
            }`}
            style={{ borderRadius: 0 }}
          >
            <input {...getInputProps()} />
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? '파일을 놓으세요' : 'PDF/Markdown 지원'}
            </p>
          </div>
        )}
      </div>

      {/* 파일 목록 — Stitch flat list 스타일 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <label className="block text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            선택된 파일
          </label>
          <ul className="space-y-px">
            {files.map((uploadFile, index) => (
              <li
                key={`${uploadFile.file.name}-${index}`}
                className="flex items-center justify-between py-4 border-b border-border"
              >
                <div className="flex items-center gap-3">
                  {uploadFile.status === 'success' ? (
                    <Check className="size-4 text-primary" />
                  ) : uploadFile.status === 'error' ? (
                    <X className="size-4 text-destructive" />
                  ) : (
                    <div className={`size-4 border border-muted-foreground ${
                      uploadFile.status === 'uploading' || uploadFile.status === 'processing'
                        ? 'animate-pulse bg-muted-foreground/20'
                        : ''
                    }`} style={{ borderRadius: 0 }} />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {uploadFile.file.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </span>
                  {(uploadFile.status === 'idle' || uploadFile.status === 'error') &&
                    !completedLessonId &&
                    !isSubmitting && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="파일 제거"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
          {files.some((f) => f.error) && (
            <p className="text-xs text-destructive">
              {files.find((f) => f.error)?.error}
            </p>
          )}
        </div>
      )}

      {/* CTA 버튼 — Stitch 스타일 */}
      {!completedLessonId && (
        <div className="pt-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-primary text-primary-foreground font-bold py-6 px-8 tracking-widest hover:opacity-90 active:scale-[0.98] transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 0 }}
          >
            {isSubmitting ? '처리 중...' : '지식베이스 생성하기'}
          </button>
        </div>
      )}
    </div>
  );
}
