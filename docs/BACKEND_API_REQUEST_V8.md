# DearGiver — Backend API 변경 요청서 (v8.0)

- **작성일**: 2026-07-20
- **대상**: 백엔드 팀
- **참조**: 이전 요청서 `backend_api_requirements.md` (v7.0, 6월 3일)
- **프론트엔드**: https://binding-minds.vercel.app
- **백엔드 API**: http://libertron.iptime.org:8787

> 6~7월 사용자 피드백을 반영한 서비스 컨셉 변경입니다.
> 프론트엔드 변경은 **모두 배포 준비 완료** 상태이며, 아래 백엔드 변경이 선행되어야
> 완전하게 동작하는 항목에는 ⚠️ 표시를 했습니다.

---

## ⛔ 철회 안내 — Gift Donation (v7.0 P1)

v7.0 요청서의 **[P1] Gift Donation Metadata (선물 기부)** 항목은 **법적 검토 결과 구현 불가로
판단되어 전면 철회**합니다. 프론트엔드에서 관련 UI/데이터 전송을 모두 제거했습니다 (2026-07-20).
백엔드에 이미 구현된 부분이 있다면 제거하거나 비활성화해 주세요.
`gift_*` 관련 DB 필드/API는 더 이상 필요하지 않습니다.

---

## 요청 요약

| 순위 | 항목 | 난이도 | 상태 |
|:---:|------|:-----:|------|
| P0 | 수수료 모델 전면 변경 (donor-side → charity-side) | 높음 | ⚠️ 필수 |
| P0 | 최소 기부금액 검증 $10 → $5 | 낮음 | ⚠️ 필수 |
| P1 | 익명 기부 (`anonymous`) 플래그 | 낮음 | ⚠️ FE 전송 중 |
| P1 | 회사(Organisation) 기부 + 회사 명의 영수증 | 중간 | ⚠️ FE 전송 중 |
| P2 | GST 등록 상태 enum 변경 | 낮음 | ⚠️ FE 전송 중 |
| P2 | 카테고리 taxonomy 변경 | 낮음 | 권장 |
| P3 | 금액별 기부 티어 API (유료 플랜 기능) | 중간 | FE는 로컬 데이터로 동작 중 |
| P3 | Stripe Direct Debit 결제 수단 추가 | 중간 | 준비되면 |

---

## [P0-1] 수수료 모델 전면 변경

### 변경 배경
기부자 결제 시점의 수수료·세금환급 노출을 최소화하는 방향으로 UX가 바뀌었습니다.
**기부자는 선택한 금액(+선택적 팁)만 결제**하고, 플랫폼 서비스 비용은 단체 측에서
차감하는 구조로 전환합니다.

### 이전 (v7.0) vs 현재 (v8.0)

| 항목 | v7.0 | v8.0 |
|------|------|------|
| 플랫폼 수수료 부과 대상 | 기부자 (결제액에 가산) | **단체 (정산액에서 차감)** |
| 무료 플랜 | Starter 2.5% | **NZ$0/월 + 2.5%/건** |
| 유료 플랜 | Growth $49/월 + 1.0% | **NZ$119~129/월 (또는 $1,119~1,290/년) + 2.0%/건** |
| 가격 표기 | — | **GST 15% 포함가** |
| Stripe 수수료 커버 옵션 | 기부자 선택 (coverStripeFee) | **제거 — 묻지 않음** |
| 자발적 플랫폼 팁 ($2) | addSupport | 유지 |
| 최소 기부금액 | $10 | **$5** |

### 백엔드 작업

1. **`POST /api/v1/checkout/donations`**
   - `coverStripeFee` 파라미터: 프론트가 더 이상 전송하지 않음 → 무시 처리 (하위 호환)
   - Checkout Session 금액 = `amount` (+ `addSupport` 팁 $2)만 청구
   - 플랫폼 수수료는 Stripe Connect `application_fee_amount`로 단체 정산액에서 차감:
     - 무료 플랜 단체: 기부금의 **2.5%**
     - 유료 플랜 단체: 기부금의 **2.0%**
   - 최소 금액 검증: **$5** (기존 $10)

2. **플랜 관리** (신규)
   - charity 테이블에 `plan` 필드: `free` | `paid` (+ `founder_pilot` | `early_access` 그룹 구분)
   - 유료 플랜 구독 결제: Stripe Billing (NZ$119~129/월 또는 연간), 30일 무료 트라이얼 **1회/기관**
     (트라이얼 중에는 %수수료만 청구)
   - **Founder Pilot** (직접 선정 3~5개 기관): 3개월 완전 무료 + 이후 Founder 할인
   - **Early Access** (첫 3개월 내 관심 표시 → 승인 기관): 첫 **NZ$5,000 처리액**까지
     플랫폼 수수료 면제 (2.5% 기준 약 $125) → 누적 처리액 트래킹 필요

3. **회계 처리 방침** (참고)
   - Stripe 수수료 커버는 당분간 도입하지 않음. 향후 top-up 옵션 도입 시
     "추가 기부금"으로 인식하여 처리하는 방향 (기부 영수증 금액에 포함)

---

## [P0-2] 최소 기부금액 $5

- NZ donation tax credit 최소 기준액($5)에 맞춤
- `POST /api/v1/checkout/donations` 서버 검증: `amount >= 5`
- 관리자 설정 기본값 `min_donation_minor: 500` 유지

---

## [P1-1] 익명 기부 (Donate Anonymously)

프론트가 checkout 요청에 이미 전송 중:

```json
{
  "amount": 50,
  "currency": "NZD",
  "charityAccountId": "acct_xxx",
  "charityName": "Trees That Count",
  "addSupport": false,
  "recurring": false,
  "anonymous": true
}
```

### 백엔드 작업
- donations 테이블에 `is_anonymous BOOLEAN` 저장
- **공개 피드/실시간 알림/서포터 목록 등 모든 public surface에서 기부자 이름 비노출**
  (예: "Someone donated $50" 처리)
- 본인 대시보드(`GET /me/donations`)에서는 정상 표시
- 단체 대시보드에서는 이름 비노출 (금액/시각만)

---

## [P1-2] 회사(Organisation) 기부 + 회사 명의 영수증

개인/회사 기부를 구분하고, 회사 기부는 **정식 회사 이름으로 영수증 발급**이 필요합니다.

프론트가 checkout 요청에 이미 전송 중:

```json
{
  "amount": 500,
  "currency": "NZD",
  "charityAccountId": "acct_xxx",
  "donorType": "organization",
  "organizationName": "OSOPRO Ltd"
}
```

### 백엔드 작업
1. donations 테이블에 `donor_type` (`individual` | `organization`), `organization_name` 저장
2. **영수증(이메일 + PDF)의 수취인 명의를 `organization_name`으로 발급**
   - 회사 기부는 33.33% donation tax credit 대상이 아니라 **법인 소득공제(tax deduction)**
     대상 — 영수증 문구에서 tax credit 안내 제외 필요
3. `GET /me/donations` 응답 항목에 `donor_type`, `organization_name` 필드 추가
   → 프론트 대시보드가 개인/회사 기부를 구분 표시 (필터 UI 구현 완료, 필드 대기 중)
4. 연간 세금 요약(tax summary)에서 회사 기부 금액은 **제외** (개인 tax credit 계산에서)

---

## [P2-1] GST 등록 상태 enum 변경

`POST /api/v1/charities/apply`의 `gst_registered` 값 변경:

| 이전 | 현재 |
|------|------|
| `yes` | `yes` (유지) |
| `no` | `no` (유지) |
| `exempt` | **삭제** |
| — | `not_sure` (Not sure / To be confirmed) |
| — | `in_progress` (Registration in progress) |

기존 `exempt` 데이터는 `not_sure`로 마이그레이션 권장.

---

## [P2-2] 카테고리 taxonomy 변경

프론트 전체 적용 완료. 백엔드 저장값/검색 필터도 동기화 필요:

- `Health` → **`Health & Wellbeing`** (정신 건강 포함 프레이밍)
- 신규 추가: **`Children & Youth`**, **`Food & Housing`**, **`Disability`**,
  **`Māori, Pasifika & Ethnic Communities`**

---

## [P3-1] 금액별 기부 티어 API (유료 플랜 기능)

유료 플랜 단체가 기부 금액 프리셋별 설명(+사진)을 직접 설정하는 기능.
프론트 모달은 `donationTiers` 데이터가 있으면 티어 카드 UI로 렌더링하도록 구현 완료
(현재는 로컬 데모 데이터).

### 요청 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/charities/{id}/donation-tiers` | 공개 조회 |
| PUT | `/api/v1/me/charity/donation-tiers` | 단체 관리자 설정 (유료 플랜만) |

```json
{
  "tiers": [
    { "amount": 25, "title": "Plant 5 native seedlings", "description": "...", "imageUrl": "..." }
  ]
}
```

- 이미지는 기존 이미지 업로드 API 재사용
- 무료 플랜 단체가 설정 시도 시 403 + 업그레이드 안내

---

## [P3-2] Stripe Direct Debit 결제 수단

카드 외 direct debit 선택 결제 요청 (준비되면):

- Stripe Checkout `payment_method_types`에 NZ BECS/direct debit 계열 추가 검토
- Direct debit은 정산 지연(수일)이 있으므로 `donation_status`에 `processing` 상태 필요 여부 확인
- 정기 기부(subscription)와의 호환성 확인

> 프론트는 Stripe Checkout 리다이렉트 방식이므로 백엔드 세션 설정만으로 노출 가능 —
> 프론트 추가 작업 불필요.

---

## 프론트엔드에서 이미 반영된 사항 (참고)

- 결제 모달: 세액공제 예상액("You'll get $$") 전면 비노출, Monthly는 benefits만 표시
- 랜딩 히어로: 특정 기관 스포트라이트 제거 → 플랫폼 중립 테마 + Explore Organisations 섹션
- 대시보드: "My Rewards" → "My Journey" 리네임, 개인/회사 기부 필터
- 기관/캠페인 상세: Share 기능 (링크 복사 + QR 코드, 클라이언트 생성)
- 서비스 비용 안내는 메인 페이지에서 제거하고 `/charity/apply` 요금제 섹션에서만 상세 설명
