---
name: deploy-checklist
description: Vercel 배포 전 체크리스트. 환경변수, API 키 노출 방지, OIDC 설정.
metadata:
  filePattern: ["**/vercel*", "**/deploy*", ".env*"]
  bashPattern: ["vercel", "deploy", "git push"]
---

# 배포 체크리스트

## 배포 전 필수 확인

- [ ] `.env.local`이 `.gitignore`에 포함
- [ ] `.env.example`에 실제 값 없음 (이름만)
- [ ] 코드에 API 키 하드코딩 없음
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트에서 접근 불가
- [ ] `npm run build` 성공
- [ ] `npm run lint` 에러 없음

## 환경변수 설정 순서

```bash
vercel link                    # 프로젝트 연결
vercel env pull                # OIDC 토큰 자동 프로비저닝
# Vercel 대시보드에서 Supabase 환경변수 추가
vercel deploy                  # 프리뷰
vercel --prod                  # 프로덕션
```

## API 키 보안 검사

```bash
# 커밋 전 검사
grep -r "eyJ" src/ --include="*.ts" --include="*.tsx"  # JWT 토큰 검출
grep -r "sk-" src/ --include="*.ts" --include="*.tsx"   # OpenAI 키 검출
grep -r "AQ\." src/ --include="*.ts" --include="*.tsx"  # Stitch 키 검출
```
