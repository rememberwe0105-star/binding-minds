# DearGiver 컨셉 변경 적용 리포트

- **작업일**: 2026-07-20
- **근거 문서**: `bindingmind update.docx` (June/July 업데이트, 7월 8일 최종 수정)
- **백엔드 전달 문서**: `docs/BACKEND_API_REQUEST_V8.md`

---

## 1. 요청 항목 분류 결과

### ✅ 프론트엔드 적용 완료 (12건)

| # | 요청 | 적용 내용 |
|---|------|----------|
| 1 | Donate anonymously 옵션 | 결제 모달에 익명 기부 체크박스 추가 ("We won't display your name in any public feeds"). 확인 단계에 Anonymous 배지 표시, 백엔드로 `anonymous` 플래그 전송 |
| 2 | Donate as an Organization | 결제 모달에 Personal / As an Organisation 선택 추가. 회사명 입력(영수증 발급 명의 안내) + "회사 기부는 tax credit이 아닌 tax deduction 대상" 안내 문구 |
| 3 | 개인/회사 기부 구분 표시 | 대시보드 Donation History에 Personal/Organisation 필터 + 회사 기부 배지 추가 (백엔드 `donor_type` 필드 수신 대기, 필드 없으면 개인으로 간주) |
| 4 | 랜딩 히어로 중립화 | Spotlight Campaign 배지/카드 완전 제거 → "Why give through DearGiver?" 플랫폼 가치 카드로 교체 (특정 기관 노출 없음) |
| 5 | Explore Organisations 섹션 | Explore Causes 아래에 신규 섹션 추가 — 검증 기관 우선 8곳 카드 그리드 + View all |
| 6 | 최소 기부 금액 $5 | 모달 `MIN_AMOUNT` $10 → $5, 프리셋 $5/10/20/50/100으로 조정 (관리자 설정 기본값은 이미 $5) |
| 7 | 결제 시점 세액공제 비노출 | 모달 금액 선택/확인 단계의 "Est. tax refund", "You'll get $$" 전면 제거. 캠페인 상세 사이드바의 환급 힌트도 제거. 랜딩(TaxTeaser)·기부완료·대시보드 노출은 유지 |
| 8 | Monthly 중복 노출 제거 | Monthly Giving Benefits 배너에서 연간 세액공제 예상액 문구 삭제 — benefits만 표시 |
| 9 | 수수료 커버 질문 제거 | Stripe 수수료 커버 체크박스 + 기부자 부담 플랫폼 수수료(1%) 표시 제거 → 기부자는 선택 금액(+선택적 $2 팁)만 결제 |
| 10 | 금액별 티어 (유료 플랜) | `Campaign.donationTiers` 타입 + 모달 티어 카드 UI 구현. 데모: Restore Native Forest 캠페인에 4개 티어. 실데이터는 백엔드 API 필요 |
| 11 | Share 기능 | `ShareButton` 컴포넌트 신규 (링크 복사 + 클라이언트 생성 QR 코드) — 캠페인 상세/기관 상세에 배치. `qrcode` 패키지 추가 |
| 12 | 카테고리 확장 | `Health` → `Health & Wellbeing` 리네임(전 데이터 일괄), 신규 4종 추가: Children & Youth, Food & Housing, Disability, Māori Pasifika & Ethnic Communities (아이콘/컬러 포함) |
| 13 | My Rewards → My Journey | 대시보드 탭 및 헤더 메뉴 리네임. 기존 "My Causes & Journey" 탭은 "My Causes"로 정리 |
| 14 | GST 옵션 변경 | 신청 폼에서 `GST Exempt` 삭제 → `Not sure / To be confirmed`, `Registration in progress` 추가 (기본값 not_sure) |
| 15 | 요금제/전략 반영 | `/charity/apply`에 Plans & Pricing 섹션 신규: 무료 NZ$0/월+2.5%, 유료 NZ$119–129/월(연 $1,119–1,290)+2.0%, GST 15% 포함, 30일 트라이얼, Early Access 첫 $5,000 수수료 면제. About 페이지 수수료 설명을 새 모델로 갱신 (메인에서는 % 강조 노출 안 함) |
| 16 | 로고/워드마크 개선 | 헤더 워드마크를 Fraunces 디스플레이 세리프로 교체 — "Dear"(테라코타, 이탤릭) + "Giver"(딥 틸) 투톤 |

### ⚠️ 백엔드 변경이 선행되어야 완전 동작 (요청서 v8.0에 정리)

- 익명 기부 저장/공개 피드 비노출
- 회사 기부 필드 저장 + **회사 명의 영수증 발급** + `/me/donations` 응답 필드 추가
- 최소 금액 서버 검증 $5
- 수수료 모델 전환 (donor-side → charity-side 2.5%/2.0%), 유료 플랜 구독/트라이얼/Early Access 면제 로직
- GST enum(`not_sure`, `in_progress`) 수용
- 금액별 티어 API
- 카테고리 taxonomy 동기화

### ❌ 이번에 적용하지 않음 (사유)

| 요청 | 사유 |
|------|------|
| Stripe direct debit 선택 결제 | Stripe Checkout 세션 설정은 전적으로 백엔드 소관 — 백엔드 준비 후 프론트 작업 없이 노출 가능. 요청서 P3에 포함 |
| 유료 플랜 상세 기능 (기부자 세그먼트 필터, 팔로업 이메일 예약, P2P 개인 모금 페이지) | 백엔드 데이터/발송 인프라 필요한 중장기 기능 — 요금제 안내 문구에는 반영, 구현은 로드맵으로 |
| Stripe 수수료 커버의 "추가 기부금 회계 처리" | 회계 정책 사안 (프론트 코드 없음). 우선 "커버 의향을 묻지 않는 단순 결제"로 론칭하는 안을 채택해 커버 옵션 자체를 제거 — top-up 도입 시점에 재검토 |
| Founder Pilot 기관 선정/운영 | 운영 전략 (코드 아님). 요금제 문구와 백엔드 요청서에만 반영 |
| 참고 사이트 (Gift Five) 벤치마킹 | 정보성 — 별도 산출물 없음 |

---

## 2. 변경 파일 목록

### 신규
- `components/ExploreOrganisations.tsx` — 홈 기관 카드 섹션
- `components/ShareButton.tsx` — 링크 복사 + QR 공유
- `docs/BACKEND_API_REQUEST_V8.md` — 백엔드 요청서
- `docs/UPDATE_REPORT_2026-07-20.md` — 본 리포트

### 수정
- `components/DonationCheckoutModal.tsx` — 전면 개편 (익명/회사기부/최소$5/환급 비노출/수수료 제거/티어 UI)
- `components/Hero.tsx` — 중립적 히어로로 재작성
- `components/Header.tsx` — 워드마크 리디자인, My Journey 리네임
- `app/page.tsx` — ExploreOrganisations 섹션 삽입
- `app/dashboard/page.tsx` — 탭 리네임, 개인/회사 필터+배지
- `app/projects/[slug]/page.tsx` — 환급 힌트 제거, ShareButton 추가
- `app/charities/[slug]/page.tsx` — ShareButton 추가
- `app/charity/apply/page.tsx` — GST 옵션, 카테고리 목록, Plans & Pricing 섹션
- `app/about/page.tsx` — 수수료 설명 신모델 반영, CTA 문구 갱신
- `app/admin/settings/page.tsx` — 카테고리 목록 동기화
- `data/campaigns.ts` — Category 4종 추가, Health & Wellbeing 리네임, DonationTier 타입+데모
- `data/organizations.ts` — Health → Health & Wellbeing (17건)
- `data/categoryMeta.ts` — 신규 카테고리 아이콘/컬러
- `lib/api.ts` — checkout 파라미터(anonymous/donorType/organizationName), DonationItem 필드
- `next.config.ts` — `turbopack.root` 고정 (한글 상위 경로로 인한 Turbopack 빌드 패닉 수정)
- `package.json` — `qrcode`, `@types/qrcode` 추가

---

## 3. 검증

- `npm run build` 프로덕션 빌드 통과 (29개 라우트, TypeScript 클린)
- 로컬 dev 서버 실제 구동 확인:
  - 홈: 중립 히어로 + 플랫폼 가치 카드 + 새 워드마크 렌더링 확인
  - 캠페인 상세: 환급 힌트 제거·Share 버튼 확인, 기부 모달에서 Personal/Organisation
    전환, 티어 카드, Min $5, 익명 체크박스, 환급액·수수료 비노출, `Continue — $50`
    (선택 금액만 청구) 동작 확인
  - 기관 상세: Share 팝오버에서 QR 코드 + 링크 복사 UI 렌더링 확인
  - `/charity/apply`: Plans & Pricing 섹션(무료/유료/GST 포함가/트라이얼/Early Access) 확인
- 모달의 Badge-in-Text hydration 경고 발견 즉시 수정 (Group으로 분리)
- 참고: 기존 빌드가 Turbopack 워크스페이스 루트 오추론(한글 경로 포함)으로 실패하는 문제가
  있어 `next.config.ts`에 `turbopack.root`를 고정하여 해결함 (이번 변경과 무관한 환경 이슈)

## 4. 남은 작업 (다음 세션)

1. 백엔드 v8.0 응답 수신 시: 티어 API 연동, donor_type 실데이터 확인, 익명 처리 QA
2. Stripe 결제 E2E 테스트 (최소 $5, 회사 기부 메타데이터 전달 확인)
3. 신규 카테고리용 대표 이미지 제작 (`public/images/categories/`에 4종 추가)
4. Vercel 배포 후 모바일에서 Share QR/복사 동작 확인
