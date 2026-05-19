# DearGiver — 백엔드 팀 API 연동 요청서

> **작성일**: 2026년 5월 19일  
> **문서 버전**: v4.0  
> **프론트엔드 주소**: https://binding-minds.vercel.app  
> **백엔드 API 주소**: http://libertron.iptime.org:8787  

---

## 안녕하세요, 백엔드 팀 여러분 👋

DearGiver 프론트엔드 팀입니다. 현재 UI/UX는 전 기능 완성된 상태입니다.  
아래 항목들이 해결되면 **바로 서비스를 시작**할 수 있습니다.

각 항목에는 **현재 상태**, **필요한 것**, **이유**를 명확하게 적어두었습니다.  
궁금하신 점이 있으면 언제든 연락해 주세요!

---

## 📋 요청 목록 한눈에 보기

| # | 요청 내용 | 긴급도 | 현재 상태 |
|---|-----------|--------|-----------|
| 1 | Stripe Secret Key 전달 | 🔴 긴급 | **미해결** |
| 2 | 결제 완료 후 이동 주소(URL) 수정 | 🔴 긴급 | **미해결** |
| 3 | 단체 가입 신청 API | 🔴 긴급 | **미해결** |
| 4 | 관리자: 신청 목록 조회 API | 🔴 긴급 | **미해결** |
| 5 | 관리자: 신청 승인/거절 API | 🔴 긴급 | **미해결** |
| 6 | 관리자 권한 방식 결정 | 🔴 긴급 | **답변 필요** |
| 7 | Stripe Connect 자동화 | 🟡 중요 | **미해결** |
| 8 | 기부 내역 한 번에 많이 가져오기 | 🟡 중요 | **미해결** |
| 9 | 단체별 Stripe 계정 발급 | 🟡 중요 | **미해결** |
| 10 | 기부 내역에 단체 등록번호 추가 | 🟢 보완 | **미해결** |
| 11 | 최소 기부금액 서버 검증 | 🟢 보완 | **미해결** |
| 12 | 사용자 역할(Role) 구분 시스템 | 🔴 긴급 | **미해결** |
| 13 | 단체별 기부 내역 조회 API | 🟡 중요 | **미해결** |
| 14 | 단체 프로필 수정 API | 🟡 중요 | **미해결** |
| 15 | 프로젝트/캠페인 CRUD API | 🟡 중요 | **미해결** |
| 16 | 플랫폼 관리자 통계 API | 🟢 보완 | **미해결** |

---

## 🔴 긴급 요청 (결제가 안 되는 상황)

### 요청 1: Stripe Secret Key를 알려주세요

**상황 설명**  
백엔드에서 Stripe 결제를 처리하려면 "Secret Key"가 서버에 설정되어 있어야 합니다.  
현재 이 키가 없어서 결제 요청을 백엔드가 처리할 수 없는 상태입니다.

> 참고: 프론트엔드용 Publishable Key (`pk_test_51TKd...`)는 방금 받아서 설정 완료했습니다.  
> 이제 백엔드용 Secret Key (`sk_test_...`)만 남았습니다.

**필요한 값**
```
STRIPE_SECRET_KEY=sk_test_여기에실제키를넣어주세요
```

**어디서 확인하나요?**  
Stripe 대시보드 → 상단 메뉴 "Developers" → "API Keys" → "Secret key" 항목

---

### 요청 2: 결제 완료 후 이동하는 주소(URL)를 고쳐주세요

**상황 설명**  
사용자가 결제를 완료하거나 취소하면, 백엔드가 특정 주소로 사용자를 이동시킵니다.  
지금은 `localhost:3000`(개발용 주소)으로 설정되어 있어서, 실제 서비스에서 결제하면 빈 화면이 나옵니다.

**요청 사항**  
백엔드 서버에 아래 환경 변수를 설정해 주세요:

```
PUBLIC_FRONTEND_URL=https://binding-minds.vercel.app
CHECKOUT_SUCCESS_URL=https://binding-minds.vercel.app/donation/success
CHECKOUT_CANCEL_URL=https://binding-minds.vercel.app/donation/cancel
```

---

## 🔴 긴급 요청 (단체 가입 시스템)

단체(Charity)가 플랫폼에 가입 신청할 수 있는 페이지(`/charity/apply`)를 만들었습니다.  
화면은 완성되어 있는데, **저장하는 API가 아직 없습니다.**  
아래 3개의 API를 만들어 주시면 됩니다.

---

### 요청 3: 단체 가입 신청 저장 API

단체 담당자가 신청 폼을 제출하면 그 내용을 저장하는 API입니다.

**API 정보**
- **주소**: `POST /api/v1/charities/apply`
- **로그인 불필요** (누구나 신청 가능)

**받아야 할 데이터 (예시)**
```json
{
  "legal_name": "Auckland City Mission Incorporated",
  "display_name": "Auckland City Mission",
  "cc_number": "CC20073",
  "category": "community",
  "website": "https://www.acmission.org.nz",
  "year_established": "1856",
  "mission": "노숙인과 취약계층에게 식사, 의료, 주거 서비스를 제공합니다.",
  "description": "1856년 설립된 Auckland City Mission은...",
  "impact_statement": "연간 20만 명 이상에게 서비스 제공 (선택사항)",
  "bank_account_name": "Auckland City Mission Incorporated",
  "bank_account_number": "12-3456-1234567-00",
  "ird_number": "123-456-789",
  "gst_registered": "yes",
  "gst_number": "123-456-789",
  "contact_name": "Sarah Thompson",
  "contact_title": "CEO",
  "contact_email": "sarah@acmission.org.nz",
  "contact_phone": "+64 9 303 9200",
  "address": "123 Queen Street",
  "city": "Auckland",
  "region": "Auckland"
}
```

**응답 (성공 시)**
```json
{
  "id": "app_xxxxxxxxxxxxxxxx",
  "status": "pending",
  "submitted_at": "2026-05-18T10:00:00Z",
  "message": "Application received. We will review and contact you within 3-5 business days."
}
```

**추가 요청**  
신청이 접수되면 `contact_email` 주소로 자동 확인 이메일을 보내주세요.  
이메일 내용은 이 문서 하단 "이메일 템플릿" 섹션을 참고해 주세요.

---

### 요청 4: 관리자 — 신청 목록 조회 API

DearGiver 관리자가 들어온 신청들을 목록으로 볼 수 있는 API입니다.

**API 정보**
- **주소**: `GET /api/v1/admin/charities`
- **로그인 필요** (관리자만 접근 가능, Firebase 토큰 사용)

**필터 옵션 (URL 파라미터)**
- `?status=pending` — 검토 대기 중인 것만 보기
- `?status=approved` — 승인된 것만 보기
- `?status=rejected` — 거절된 것만 보기
- `?status=consultation` — 상담이 필요한 것만 보기
- 파라미터 없으면 전체 목록

**응답 예시**
```json
{
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "items": [
    {
      "id": "app_xxxxxxxxxxxxxxxx",
      "display_name": "Auckland City Mission",
      "legal_name": "Auckland City Mission Incorporated",
      "cc_number": "CC20073",
      "category": "community",
      "contact_name": "Sarah Thompson",
      "contact_email": "sarah@acmission.org.nz",
      "contact_phone": "+64 9 303 9200",
      "city": "Auckland",
      "region": "Auckland",
      "status": "pending",
      "admin_note": null,
      "stripe_account_id": null,
      "stripe_onboarding_complete": false,
      "applied_at": "2026-05-15T08:30:00Z",
      "reviewed_at": null
    }
  ]
}
```

---

### 요청 5: 관리자 — 신청 승인/거절 API

관리자가 신청을 검토하고 결과를 처리하는 API입니다.

**API 정보**
- **주소**: `PATCH /api/v1/admin/charities/{id}/status`
- **로그인 필요** (관리자만)

**요청 데이터**
```json
{
  "status": "approved",
  "admin_note": "CC 번호 확인 완료. Stripe 온보딩 이메일 발송."
}
```

**status 값 설명**

| status 값 | 의미 | 자동 이메일 발송? |
|-----------|------|-----------------|
| `approved` | 승인 | ✅ 승인 알림 + Stripe 계좌 연동 링크 |
| `rejected` | 거절 | ✅ 거절 사유 포함 알림 |
| `consultation` | 상담 필요 | ✅ 담당자 연락 예정 안내 |
| `pending` | 재검토 대기 | ❌ 이메일 없음 |

**응답 예시**
```json
{
  "id": "app_xxxxxxxxxxxxxxxx",
  "status": "approved",
  "reviewed_at": "2026-05-18T15:30:00Z"
}
```

---

### 요청 6: 관리자 권한을 어떻게 확인할지 알려주세요

현재 프론트엔드에서 "이 사람이 관리자인지" 확인하는 방법이 없습니다.  
아래 두 가지 방법 중 어떤 걸 사용할지 알려주시면 프론트엔드에서 바로 적용하겠습니다.

**방법 A — Firebase Custom Claims (권장)**  
Firebase에서 직접 관리자 권한을 부여하는 방식입니다.
```javascript
// 백엔드에서 관리자 계정에 권한 설정
admin.auth().setCustomUserClaims(uid, { admin: true });

// 프론트엔드에서 권한 확인
const token = await user.getIdTokenResult();
if (token.claims.admin) {
  // 관리자 메뉴 표시
}
```

**방법 B — 이메일 화이트리스트**  
특정 이메일 주소만 관리자로 인정하는 방식입니다.
```
ADMIN_EMAILS=admin@deargiver.nz,team@deargiver.nz
```

> 어느 방법을 선택하셨는지 알려주시면 바로 적용하겠습니다.

---

## 🟡 중요 요청 (서비스 품질)

### 요청 7: 단체 승인 시 Stripe 계좌 연동을 자동화해주세요

관리자가 단체를 승인하면, 그 단체가 기부금을 실제로 받을 수 있어야 합니다.  
이를 위해 Stripe Connect 계정을 자동으로 만들고 이메일로 안내해 주는 흐름이 필요합니다.

**흐름 설명**

```
1. 관리자가 "승인" 처리
        ↓
2. 백엔드: 해당 단체용 Stripe Connect 계정 자동 생성
        ↓
3. 백엔드: Stripe 계좌 설정 링크 생성
        ↓
4. 단체 contact_email로 설정 링크 이메일 발송 (유효기간 7일)
        ↓
5. 단체가 계좌 설정 완료 → 플랫폼에 정식 게시
```

**추가로 필요한 API 2개**
- `GET /api/v1/admin/charities/{id}/stripe-status` — 계좌 설정 완료 여부 확인
- `POST /api/v1/admin/charities/{id}/resend-stripe-link` — 설정 링크 재발송

---

### 요청 8: 기부 내역을 한 번에 더 많이 가져올 수 있게 해주세요

**상황 설명**  
현재 기부 내역 API는 한 번에 최대 50건까지만 가져올 수 있습니다.  
연간 세금 환급 서류를 만들 때 전체 기부 내역이 한 번에 필요한데, 50건 이상이면 여러 번 요청해야 합니다.

**요청 사항**  
`GET /api/v1/me/donations?pageSize=500`처럼 최대 500건까지 한 번에 조회할 수 있게 해주세요.

---

### 요청 9: 각 단체에게 개별 Stripe 계정을 연결해주세요

**상황 설명**  
현재는 모든 기부금이 하나의 테스트 Stripe 계정으로만 들어갑니다.  
실제 서비스에서는 각 단체가 자신의 Stripe 계정을 가지고, 기부금이 직접 해당 단체에게 가야 합니다.

**요청 사항**  
각 단체 DB 레코드에 해당 단체의 Stripe Connect Account ID (`acct_...`)를 업데이트해 주세요.

---

## 🟢 보완 요청 (품질 개선)

### 요청 10: 기부 내역에 단체 등록번호를 포함해주세요

**이유**  
뉴질랜드 세금 환급을 위한 영수증에는 단체 등록번호(CC Number)가 법적으로 표시되어야 합니다.

**요청 사항**  
`GET /api/v1/me/donations` 응답에 아래 필드를 추가해 주세요:

```json
{
  "charity_display_name": "Auckland City Mission",
  "charity_registration_no": "CC12345",
  "donation_amount_minor": 5000
}
```

---

### 요청 11: 최소 기부금액(NZD $20)을 서버에서도 검증해주세요

**이유**  
프론트엔드에서 최소 금액($20)을 막고 있지만, 누군가 직접 API를 호출하면 우회할 수 있습니다.

**요청 사항**  
`POST /api/v1/checkout/donations`에서 `amount`가 20 미만이면 아래처럼 응답해 주세요:

```json
HTTP 400 Bad Request
{
  "error": "Minimum donation amount is NZD $20.00"
}
```

---

## 📧 이메일 템플릿 (참고용)

아래 내용을 참고해서 자동 발송 이메일을 만들어 주세요.

### 신청 접수 확인 이메일

```
제목: Your DearGiver charity application has been received — {display_name}

Dear {contact_name},

Thank you for applying to list {display_name} on DearGiver.

Our team will review your application and get back to you at this email
within 3–5 business days.

Application Reference: {application_id}
CC Number: {cc_number}

Questions? Email us at support@deargiver.nz

The DearGiver Team
```

### 승인 이메일

```
제목: 🎉 Your charity is approved on DearGiver — {display_name}

Dear {contact_name},

Great news! {display_name} has been approved on DearGiver.

To start receiving donations, please set up your payout account:
👉 {stripe_onboarding_link}
(This link expires in 7 days)

Once you complete the setup, your charity will be listed on the platform.

The DearGiver Team
```

### 거절 이메일

```
제목: Update on your DearGiver application — {display_name}

Dear {contact_name},

Thank you for your interest in DearGiver. 

After reviewing your application for {display_name}, 
we are unable to proceed at this time.

Reason: {admin_note}

For questions: support@deargiver.nz

The DearGiver Team
```

### 상담 요청 이메일

```
제목: DearGiver — We'd like to discuss your application

Dear {contact_name},

Thank you for applying. We've reviewed {display_name}'s application
and would like to have a brief chat about a few details.

We'll be in touch at {contact_email} or {contact_phone} very soon.

The DearGiver Team
```

---

## 🗄️ 데이터베이스 참고 (단체 신청 테이블)

```sql
CREATE TABLE charity_applications (
  id                         VARCHAR(32) PRIMARY KEY,
  -- 단체 기본 정보
  legal_name                 VARCHAR(200) NOT NULL,
  display_name               VARCHAR(100) NOT NULL,
  cc_number                  VARCHAR(20) NOT NULL,
  category                   VARCHAR(50) NOT NULL,
  website                    VARCHAR(255),
  year_established            VARCHAR(4),
  mission                    TEXT NOT NULL,
  description                TEXT NOT NULL,
  impact_statement            TEXT,
  -- 은행 및 세금 정보
  bank_account_name          VARCHAR(200) NOT NULL,
  bank_account_number        VARCHAR(30) NOT NULL,
  ird_number                 VARCHAR(20) NOT NULL,
  gst_registered             ENUM('yes', 'no', 'exempt') NOT NULL,
  gst_number                 VARCHAR(20),
  -- 담당자 연락처
  contact_name               VARCHAR(100) NOT NULL,
  contact_title              VARCHAR(100),
  contact_email              VARCHAR(255) NOT NULL,
  contact_phone              VARCHAR(30),
  address                    VARCHAR(255),
  city                       VARCHAR(100) NOT NULL,
  region                     VARCHAR(100) NOT NULL,
  -- 처리 상태
  status                     ENUM('pending','approved','rejected','consultation') DEFAULT 'pending',
  admin_note                 TEXT,
  -- Stripe 연동 정보
  stripe_account_id          VARCHAR(32),
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  -- 시간 기록
  applied_at                 TIMESTAMP DEFAULT NOW(),
  reviewed_at                TIMESTAMP
);
```

---

## ✅ 프론트엔드 현황 (참고용)

현재 아래 페이지들은 UI가 완성되어 있고, **API 연동만 되면 바로 작동**합니다.

| 페이지 | 주소 | 상태 |
|--------|------|------|
| 단체 가입 신청 폼 | `/charity/apply` | ✅ 화면 완성, API 연동 대기 |
| 관리자 승인 패널 | `/admin/charities` | ✅ 화면 완성, API 연동 대기 |
| 기부자 대시보드 | `/dashboard` | ✅ 연동 완료 (일부 제한) |
| Stripe 결제 모달 | `/projects` 상세 | ✅ Secret Key 설정 후 활성화 |
| 기부 완료 페이지 | `/donation/success` | ✅ 리다이렉트 URL 수정 후 활성화 |

---

## 📌 현재 환경 변수 현황

프론트엔드에 설정된 값입니다. 참고해 주세요.

| 변수명 | 상태 |
|--------|------|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ `http://libertron.iptime.org:8787` |
| `NEXT_PUBLIC_FIREBASE_*` | ✅ 설정 완료 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ `pk_test_51TKd...` (방금 설정) |
| `STRIPE_SECRET_KEY` | ❌ **백엔드 팀 제공 필요** |

---

## 🆕 추가 요청 (단체 대시보드 + 관리자 기능)

> 프론트엔드에서 단체(Charity) 대시보드 (`/charity/dashboard`)와 관리자 오버뷰 (`/admin`)를 새로 구현했습니다.
> 현재 Mock 데이터로 동작하며, 아래 API가 구현되면 실제 데이터로 교체됩니다.

### 요청 12: 사용자 역할(Role) 구분 시스템

| 항목 | 내용 |
|------|------|
| **현재 상태** | 모든 사용자가 동일한 권한 (donor만 존재) |
| **필요한 것** | `role` 필드 추가: `donor` / `charity_admin` / `platform_admin` |
| **방식 제안** | Firebase Custom Claims 또는 서비스 DB의 `users.role` 필드 |
| **프론트 사용** | 로그인 시 role을 확인하여 메뉴 및 페이지 접근 제어 |

### 요청 13: 단체별 기부 내역 조회 API

```
GET /api/v1/charities/{charityId}/donations?page=1&pageSize=20
Authorization: Bearer <firebase-id-token>

// Response
{
  "page": 1,
  "pageSize": 20,
  "total": 156,
  "items": [
    {
      "donation_amount_minor": 10000,
      "currency_code": "NZD",
      "donation_status": "succeeded",
      "donor_display_name": "Sarah K.",
      "project_name": "Emergency Housing Fund",
      "paid_at": "2026-05-19T06:30:00Z",
      "created_at": "2026-05-19T06:28:00Z"
    }
  ]
}
```

> 기부자 대시보드의 `/api/v1/me/donations`와 유사하지만, **단체 측 시점**이므로 `donor_display_name`과 `project_name`이 포함되어야 합니다.

### 요청 14: 단체 프로필 수정 API

```
PATCH /api/v1/charities/{charityId}
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "display_name": "Auckland City Mission",
  "mission": "...",
  "description": "...",
  "website": "https://...",
  "contact_email": "...",
  "contact_phone": "..."
}

// Response
{ "ok": true, "charity": { ... } }
```

### 요청 15: 프로젝트/캠페인 CRUD API

```
# 목록 조회
GET /api/v1/charities/{charityId}/projects

# 생성
POST /api/v1/charities/{charityId}/projects
{
  "name": "Emergency Housing Fund",
  "description": "...",
  "goal_amount_minor": 5000000,
  "category": "Community",
  "duration_days": 60,
  "cover_image_url": "https://..."
}

# 수정
PATCH /api/v1/charities/{charityId}/projects/{projectId}

# 종료 (soft delete)
DELETE /api/v1/charities/{charityId}/projects/{projectId}
```

> 현재 프로젝트 데이터가 `data/campaigns.ts`에 하드코딩되어 있습니다. 이 API가 구현되면 동적 데이터로 교체합니다.

### 요청 16: 플랫폼 관리자 통계 API

```
GET /api/v1/admin/stats
Authorization: Bearer <firebase-id-token>

// Response
{
  "total_donations_minor": 14835000,
  "active_charities": 12,
  "total_donors": 2847,
  "platform_revenue_minor": 148350,
  "pending_applications": 3,
  "recent_activity": [
    {
      "type": "donation",
      "message": "$200 donation — Restore Native Forest",
      "created_at": "2026-05-19T10:30:00Z"
    }
  ]
}
```

### 추가 요청 요약표

| # | 요청 내용 | 긴급도 | 관련 페이지 |
|---|-----------|--------|------------|
| 12 | 사용자 역할(Role) 구분 시스템 | 🔴 긴급 | 전체 (메뉴 제어) |
| 13 | 단체별 기부 내역 조회 API | 🟡 중요 | `/charity/dashboard` |
| 14 | 단체 프로필 수정 API | 🟡 중요 | `/charity/dashboard` |
| 15 | 프로젝트/캠페인 CRUD API | 🟡 중요 | `/charity/dashboard` |
| 16 | 플랫폼 관리자 통계 API | 🟢 보완 | `/admin` |

---

*문서 버전: v5.0 | 작성일: 2026-05-19 | 프론트엔드 팀 드림*
