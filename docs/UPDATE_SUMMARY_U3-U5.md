# Dear Giver — 업데이트 3~5 통합 적용 보고서

- **작성일**: 2026-08-11 · **작성**: 프론트엔드 (Poma)
- **라이브**: https://binding-minds.vercel.app · **레포**: rememberwe0105-star/binding-minds
- 상태: **업데이트 3·4·5 전 항목 프론트엔드 적용·배포 완료** (백엔드 의존 기능은 게이트 패턴으로 배선)

---

## 업데이트 3 (7/27 + 7/21) — 브랜드 톤 확립 + 회계 기능 착수

### 디자인/카피
- 워드마크 "Dear Giver" 두 단어·어두운 단일색 (헤더/푸터)
- 홈 히어로: 저채도 딥 틸 배경 + 신규 카피("Where generosity meets good work" 등),
  "Why give" 카드 4개를 히어로 아래 행으로 재배치
- About/Projects/Charities 헤더 카피·강조·딥 틸 밴드 통일
- **유려함 강화 패스**: Fraunces 세리프 헤드라인(+이탤릭 골드 강조), radial 광원·필름
  그레인·동심원 링, 아치형 이미지(쿠바스트리트 벽화 + 틸 스크림 + 플로팅 칩),
  카드 스태거 리빌·액센트 라인

### 기능
- **Accounting 탭** (Growth 전용 데모): Xero 연결 → 계정 매핑 → payout summary
  (기부총액−카드수수료−플랫폼수수료±환불조정=입금액) → Send to Xero → sync history
- 방식 확정: Zapier 대신 **Xero API 직접 단방향 sync** (Donorfy/Keela 패턴)
- 환불/chargeback: 플랫폼 환불 기능 미제공(기관이 Stripe에서 직접), webhook 기록만

## 업데이트 4 (8/9) — 카피 전면 개편 + 탐색성

- **"DearGiver" → "Dear Giver"** 사용자 노출 표기 전수 교체
- 홈: 칩 "Kindness, made visible.", 카드 4종 신규 카피, CTA "Explore Causes"
  (그라데이션 입체 버튼), generosity 골드 강조·서브카피 확대
- About: Mission/Vision/How We're Funded(3카드 재구성·Real Example 삭제)/
  What We Stand For 6카드/Thoughtful Features 6카드 — 제공 카피로 전면 교체
- About 타임라인 아이콘 초록→골드 그라데이션 + **편지 주고받는 라인아트 일러스트**
- **Charities 정렬**: Recently updated / Name A–Z / Claimed profiles first + 고지 문구
  (`Organization.lastUpdated` 신설, 시연용 claimed 3곳 시드)
- Claim 페이지 Plans 문구 + "Payment processing fees are handled separately." 고지
- Help Centre 하단 개편 ("Create Your Profile")

## 업데이트 4.5 — 백엔드 게이트 패턴 (전면 배선)

- 미구현 기능 전부가 **실제 엔드포인트를 먼저 호출** → 404/미기동이면
  "Backend integration pending" 다이얼로그(한/영 + `METHOD /path` + 요청서 번호)
  → 데모 폴백 → **엔드포인트가 응답하면 프론트 수정 없이 자동 실연동 전환**
- 공통 모듈: `lib/api.ts` `gatedFetch`/`BackendPendingError` + `BackendPendingDialog`

## 업데이트 5 (8/11) — 여정 완성 + P2P

- **홈 How Dear Giver Works**: 신규 카피, 01~06 번호·카드 사이 "›" 화살표 강조,
  **06 "Keep Giving"** 카드 추가 (5→6단계, 3×2 배열)
- **Claim 페이지 상단 밸런스**: 제목 축소 + 섹션 여백 확대
- **About 일러스트 개편**: 닫힌 봉투 → **열린 봉투 + 살짝 나온 편지("Dear Giver," 노출)**,
  텍스트에 더 가깝게 배치
- **푸터 "Support" 메뉴 신설**: Help Centre + **Donation Tax Credits 페이지**
  (`/donation-tax-credits`, 목차형 placeholder — 본문 확정 시 교체)
- Help Centre FAQ 2번 답변 교체 + Donation Tax Credits guide 링크
- **Claimed 기관 → 프로젝트 연결**: 프로젝트 섹션 노출 조건을 partnered → claimed 이상으로
  확대 + 히어로에 "View Projects (n)" 버튼 (질문 주신 동선 — 이제 연결됩니다)
- **P2P Supporter Fundraisers (Growth 데모)**:
  - 기관/프로젝트 페이지: Supporter Fundraisers 섹션 + **Start a fundraiser 모달**
    (Organisation/Project level, Public/Private visibility, 유효성 검증)
  - Growth 대시보드: **Supporter Fundraisers 탭** — 요약 통계·상태/레벨 필터·
    Approve/Decline (Community는 잠금)
  - 정책: Public은 기관 승인 후 게시 / Private은 링크만 — v8.4로 요청
- "DearGiver" 잔재 표기 최종 0건 확인

---

## 백엔드 게이트 지점 (최종 12곳)

| # | 화면/버튼 | 엔드포인트 | 요청서 |
|---|---|---|---|
| 1 | 결제 모달(비로그인) Pay | `POST /checkout/donations/guest` | v8.1 |
| 2 | Recurring Giving 로드 | `GET /me/subscriptions` | v7.0 |
| 3–5 | 구독 Pause/Resume·Change·Cancel | `PATCH /me/subscriptions/{id}` | v7.0 |
| 6 | 티어 Publish to checkout | `PUT /me/charity/donation-tiers` | v8.0 |
| 7 | Accounting payout 로드 | `GET /me/charity/payouts` | v8.3 |
| 8–9 | Connect to Xero / Send to Xero | `POST /me/charity/xero/*` | v8.3 |
| 10 | Start a fundraiser → Create | `POST /fundraisers` | v8.4 |
| 11 | Supporter Fundraisers 탭 로드 | `GET /me/charity/fundraisers` | v8.4 |
| 12 | Approve / Decline | `PATCH /me/charity/fundraisers/{id}` | v8.4 |

## 백엔드 전달 패키지 (최종)

1. **BACKEND_HANDOVER.pdf** — 인수인계 표지 (문서 체계 v6~v8.4 · 우선순위 6단계 ·
   게이트 12곳 · 접속/데모 정보) ← 이것부터
2. **v8.1** — 게스트 기부 + 팁 제거 정정
3. **v8.3** — Accounting/Xero + 기관 프로필 메타 + 게이트 작업 방식 + payouts 스키마
4. **v8.4** — P2P Supporter Fundraisers (신규)

- v8.0은 기전달·유효, v8.2는 폐기(v8.3이 대체)
- 우선순위: v8.0 P0 → v8.1 P1 → v7.0 구독 → 경량(P2·프로필 메타) → Growth 묶음(티어·Xero·P2P)

## 남은 항목 (콘텐츠/후속 대기)

- Donation Tax Credits 페이지 **본문** — 이번 주 문구 확정 시 placeholder 교체 (5분 작업)
- P2P 개인 모금 페이지(`/f/{slug}`) — 백엔드 share_slug 발급 후 다음 단계
- 신규 카테고리 대표 이미지 4종·콘텐츠 재분류 (기존 백로그)
- 백엔드 연동 시작 시: 게이트 지점부터 순서대로 자동 전환 확인
