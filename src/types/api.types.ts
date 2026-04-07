/**
 * @file types/api.types.ts
 * @description API 응답 타입 — 통일 포맷
 * @domain shared
 * @access shared
 */

/** 통일 API 성공 응답 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

/** 통일 API 실패 응답 */
export interface ApiError {
  success: false;
  error: string;
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR' | 'UNAUTHORIZED';
}

/** 통일 API 응답 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
