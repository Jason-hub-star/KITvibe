/**
 * @file app/opengraph-image.tsx
 * @description 동적 OG 이미지 — Satori(next/og) 기반
 *   SNS 공유 시 1200×630 카드 자동 생성
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '풀다 AI — 막힘을 질문으로 풀다';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf9f7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* 좌측 강조 바 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: '100%',
            background: '#222222',
          }}
        />

        {/* 배지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#474747',
            marginBottom: 28,
          }}
        >
          AI 수업 보조 코치 · KIT 바이브코딩 2026
        </div>

        {/* 메인 헤드라인 */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: '#1a1c1b',
            lineHeight: 1.05,
            marginBottom: 36,
            letterSpacing: '-0.02em',
          }}
        >
          막힘을 질문으로 풀다.
        </div>

        {/* 서브 카피 */}
        <div
          style={{
            fontSize: 26,
            color: '#474747',
            maxWidth: 740,
            lineHeight: 1.55,
            marginBottom: 64,
          }}
        >
          선생님은 수업자료만 올리세요. AI가 학생에게{' '}
          <span style={{ color: '#1a1c1b', fontWeight: 700 }}>답 대신 질문</span>을 던져
          스스로 깨닫게 도와줘요.
        </div>

        {/* 피처 칩 3개 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 64 }}>
          {['Grill-Me 질문법', '수업자료 RAG', '오개념 히트맵'].map((tag) => (
            <div
              key={tag}
              style={{
                border: '1.5px solid #c6c6c6',
                background: '#f4f3f1',
                color: '#1a1c1b',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '8px 20px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 로고 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: '#222222',
            }}
          />
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#222222',
            }}
          >
            풀다 AI
          </span>
        </div>

        {/* 우하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 96,
            fontSize: 14,
            color: '#c6c6c6',
            letterSpacing: '0.04em',
          }}
        >
          vibecoding-two-jade.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
