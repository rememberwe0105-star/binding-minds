# DearGiver — 세션 인수인계 문서

> **최종 업데이트**: 2026년 5월 18일 23:42 (KST)
> **프론트엔드 배포**: https://binding-minds.vercel.app
> **문서 버전**: v4.0

---

## 1. 프로젝트 개요

**DearGiver** — 뉴질랜드·호주 타겟 기부 중개 플랫폼
- 기부자(Donor)와 자선단체(Charity)를 연결
- Firebase(인증) + Stripe(결제) 기반
- 프론트엔드: Next.js 14 / Mantine UI / Vercel 배포
- 백엔드: 별도 팀 운영 중 (API 연동 진행 중)

---

## 2. 현재 플랫폼 상태 (프론트엔드 완료 현황)

### ✅ 완전히 완성된 기능

| 기능 | 주요 파일 |
|------|----------|
| 홈, About, 캠페인, 단체 페이지 | `app/page.tsx`, `app/about/page.tsx`, `app/projects/`, `app/charities/` |
| Firebase 로그인/회원가입 | `app/auth/page.tsx`, `contexts/AuthContext.tsx` |
| 기부자 대시보드 (기부 내역, 영수증, 세금 요약) | `app/dashboard/page.tsx` |
| PDF 다운로드 (영수증, 연간 세금 요약) | `app/dashboard/page.tsx` (downloadReceiptPdf, downloadTaxSummaryPdf) |
| 모바일 PDF 안내 모달 | `app/dashboard/page.tsx` (MobilePdfNotice) |
| Stripe 결제 모달 | `components/DonationCheckoutModal.tsx` |
| **$1 수수료 투명성** | `components/DonationCheckoutModal.tsx` + `app/about/page.tsx` |
| **단체 등록 신청 폼 (5단계)** | `app/charity/apply/page.tsx` |
| **관리자 승인 패널** | `app/admin/charities/page.tsx` |
| **홈페이지 단체 모집 배너** | `components/CharityBanner.tsx` |
| Footer "For Organisations" 열 | `components/Footer.tsx` |
| About 페이지 듀얼 CTA | `app/about/page.tsx` |
| GiveBack Rewards 시스템 | `hooks/useRewards.ts`, `components/RewardsTab.tsx`, `data/rewards.ts` |
| 배지 언락 축하 애니메이션 | `components/BadgeUnlockCelebration.tsx` |
| 헤더 아바타 등급 링 | `components/Header.tsx` |

---

## 3. 이번 세션 (5월 18일) 주요 작업

### 3-1. 모바일 UX 개선
- iOS Safari 등 모바일 환경에서 PDF 다운로드 시 안내 모달 표시
- `ReceiptVaultTab`, `TaxSummaryTab`에 `useMediaQuery` 기반 모바일 감지 적용

### 3-2. 수수료 투명성 강화
- **결제 모달**: 금액 선택 + 확인 단계에서 $1 플랫폼 수수료 및 Stripe 수수료 명시
- **About 페이지**: "How We're Funded" 섹션 추가 — 100% 기부 전달 + $1 수수료 + Stripe 수수료 구조 설명
- **수수료 모델 확정**: "$50 기부 시 $1 별도 청구 → 단체에 $50 전액 전달" 방식 유지

### 3-3. 단체 온보딩 시스템 구축 (이번 세션 핵심)

#### `/charity/apply` — 단체 등록 신청 폼
- **5단계 멀티스텝 폼**:
  1. Charity Info (법인명, CC번호, 분야)
  2. Mission & Introduction (미션, 소개, 임팩트)
  3. Banking & Tax (NZ 계좌, IRD 번호, GST 등록)
  4. Contact Information (담당자, 이메일, 지역)
  5. Review & Submit (전체 확인 + 약관 동의)
- 현재: UI 완성, 백엔드 API 연동 대기 (Demo 모드)

#### `/admin/charities` — 관리자 승인 패널
- 신청 통계 카드 (대기/승인/상담/거절)
- 탭 필터 + 테이블 목록
- 상세 모달 → 승인/거절/상담 버튼 + 메모 입력
- 현재: Mock 데이터, 백엔드 API 연동 대기

#### 단체 진입 동선 4곳 추가
- **홈페이지 하단**: `CharityBanner` 컴포넌트 (TaxTeaser 다음 위치)
- **Footer**: "For Organisations" 열 — List Your Charity 링크
- **About 페이지**: 기부자/단체 듀얼 CTA 버튼
- **Support 페이지**: Contact Us 하단에 "Want to List Your Charity" 섹션 추가

### 3-4. 홈페이지 개선 (Impact Stories)
- 홈페이지의 `ImpactStories` 컴포넌트 하드코딩 데이터를 실제 `data/blog.ts` 데이터로 연동
- 카드 클릭 시 `/blog/{slug}` 상세 페이지로 올바르게 이동하도록 Link 컴포넌트 추가

---

## 4. 수수료 정책 (확정)

```
기부자가 $50 기부 원할 때:
  └─ DearGiver 결제: $50 (기부금) + $1 (플랫폼 수수료) = 총 $51 청구
  └─ Stripe 수수료: Stripe가 $51 중에서 처리
  └─ 단체 수령: $50 전액 (보장)
  └─ DearGiver 수익: $1 고정

→ "내 기부금 $50는 100% 단체로 갑니다"라는 기부자 신뢰 확보
```

---

## 5. 파일 구조 (주요 신규/변경 파일)

```
binding-minds/
├── app/
│   ├── charity/
│   │   └── apply/
│   │       ├── page.tsx          ✅ 신규 — 단체 신청 폼 (5단계)
│   │       └── page.module.css   ✅ 신규
│   ├── admin/
│   │   └── charities/
│   │       ├── page.tsx          ✅ 신규 — 관리자 승인 패널
│   │       └── page.module.css   ✅ 신규
│   ├── about/
│   │   └── page.tsx              ✅ 수정 — 수수료 섹션 + 듀얼 CTA
│   ├── dashboard/
│   │   └── page.tsx              ✅ 수정 — 모바일 PDF 안내 모달
│   └── page.tsx                  ✅ 수정 — CharityBanner 추가
├── components/
│   ├── DonationCheckoutModal.tsx  ✅ 수정 — $1 수수료 표시
│   ├── CharityBanner.tsx         ✅ 신규 — 홈 단체 모집 배너
│   ├── CharityBanner.module.css  ✅ 신규
│   └── Footer.tsx                ✅ 수정 — For Organisations 열
└── docs/
    ├── BACKEND_REQUEST_FINAL.md  ✅ 신규 — 통합 최종 요청서
    ├── BACKEND_REQUEST_FINAL.pdf ✅ 신규
    ├── BACKEND_REQUEST_KO.md     (구버전 참고용)
    └── CHARITY_ONBOARDING_BACKEND_REQUEST.md (구버전 참고용)
```

---

## 6. 백엔드 대기 항목 (전달 문서: `docs/BACKEND_REQUEST_FINAL.pdf`)

### 🔴 긴급 (서비스 차단)
1. **Stripe Publishable Key** 제공 → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 등록
2. **결제 리다이렉트 URL** 수정 → `PUBLIC_FRONTEND_URL=https://binding-minds.vercel.app`
3. **단체 신청 API** `POST /api/v1/charities/apply`
4. **단체 목록 API** `GET /api/v1/admin/charities`
5. **단체 상태 변경 API** `PATCH /api/v1/admin/charities/{id}/status`
6. **관리자 권한 방식 확정** (Firebase Custom Claims 권장)

### 🟡 중요
7. **Stripe Connect 온보딩 자동화** — 승인 시 이메일 + 온보딩 링크 발송
8. **API pageSize 제한 완화** (50 → 500건 이상)
9. **단체별 Stripe Connect Account ID** 발급 및 DB 업데이트
10. **이메일 자동 발송** — 접수/승인/거절/상담 4종 템플릿

### 🟢 보완
11. 기부 내역 응답에 `charity_registration_no` 필드 추가
12. 서버 사이드 최소 기부금액 검증 ($20)

---

## 7. 다음 세션 시작 시 우선 작업

백엔드팀으로부터 아래 항목을 수신하면 즉시 연동 가능:

1. **Stripe Publishable Key** 수신 시
   ```
   작업: .env.local에 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 등록
   소요: 5분
   ```

2. **단체 신청 API 완성** 수신 시
   ```
   작업: app/charity/apply/page.tsx handleSubmit() 함수 연동
   소요: 30분
   ```

3. **관리자 API 완성** 수신 시
   ```
   작업: app/admin/charities/page.tsx Mock 데이터 → 실데이터 교체
   소요: 1시간
   ```

4. **관리자 권한 방식 확정** 수신 시
   ```
   작업: /admin/charities 페이지 접근 보호 로직 추가
   소요: 30분
   ```

---

## 8. 알려진 이슈 및 주의사항

| 이슈 | 상태 | 비고 |
|------|------|------|
| `/admin/charities` 인증 없이 접근 가능 | ⚠️ 임시 | 관리자 권한 방식 확정 후 즉시 보호 예정 |
| 단체 신청 폼 — 실제 데이터 저장 안 됨 | ⚠️ Demo | 백엔드 API 대기 중 |
| 관리자 패널 — Mock 데이터 표시 | ⚠️ Demo | 백엔드 API 대기 중 |
| Stripe 결제 — Publishable Key 미설정 | 🔴 차단 | 백엔드팀 키 전달 대기 |

---

*다음 세션에서 이 문서를 먼저 확인해 주세요. 수고하셨습니다! 🎉*
