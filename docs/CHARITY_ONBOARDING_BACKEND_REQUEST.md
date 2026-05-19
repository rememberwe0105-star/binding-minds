# 단체 온보딩 시스템 — 백엔드 API 요청서

> **발행일**: 2026년 5월 18일
> **프론트엔드 배포**: https://binding-minds.vercel.app
> **관련 페이지**: `/charity/apply` (신청 폼), `/admin/charities` (관리자 패널)

프론트엔드 UI가 완성되어 있습니다. 백엔드 API 연동을 위해 아래 항목들을 요청드립니다.

---

## 📊 시스템 흐름도

```
[단체 담당자]          [프론트엔드]                [백엔드 API]             [관리자]
     │                      │                           │                      │
     ├─ 신청 폼 작성 ───────► POST /charities/apply ───► DB 저장               │
     │                      │    ← 201 Created          │                      │
     │◄── 접수 확인 이메일 ──│◄── 이메일 발송 ──────────┤                      │
     │                      │                           │                      │
     │                      │       GET /admin/charities?status=pending ───────►│
     │                      │                           │◄─────────────────────┤
     │                      │                           │    PATCH /{id}/status │
     │◄── 결과 알림 이메일 ──│◄── 이메일 발송 ──────────│◄─────────────────────┤
     │                      │                           │                      │
     │  (승인 시) Stripe Connect 온보딩 이메일 수신      │                      │
```

---

## 🔴 [필수] API 엔드포인트 요청

### 1. 단체 신청 접수

**엔드포인트**: `POST /api/v1/charities/apply`
**인증**: 불필요 (공개 엔드포인트)

**요청 Body**:
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
  "impact_statement": "연간 20만 명 이상에게 서비스 제공",
  "contact_name": "Sarah Thompson",
  "contact_title": "CEO",
  "contact_email": "sarah@acmission.org.nz",
  "contact_phone": "+64 9 303 9200",
  "address": "123 Queen Street",
  "city": "Auckland",
  "region": "Auckland"
}
```

**성공 응답** (201 Created):
```json
{
  "id": "app_xxxxxxxxxxxxxxxx",
  "status": "pending",
  "submitted_at": "2026-05-18T10:00:00Z",
  "message": "Application received. We will review and contact you within 3-5 business days."
}
```

**이메일 자동 발송 요청**:
- `contact_email` 주소로 접수 확인 이메일 발송
- 발신자: `noreply@deargiver.nz`
- 내용: 접수 완료 안내 + 처리 예상 기간 (3~5 영업일)

---

### 2. 관리자: 신청 목록 조회

**엔드포인트**: `GET /api/v1/admin/charities`
**인증**: Firebase ID Token (관리자 권한)
**Query Parameters**:
- `status`: `pending` | `approved` | `rejected` | `consultation` | (생략 시 전체)
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 페이지 크기 (기본값: 20)

**응답** (200 OK):
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
      "mission": "...",
      "description": "...",
      "website": "https://www.acmission.org.nz",
      "year_established": "1856",
      "status": "pending",
      "admin_note": null,
      "applied_at": "2026-05-15T08:30:00Z",
      "reviewed_at": null
    }
  ]
}
```

---

### 3. 관리자: 신청 상태 변경

**엔드포인트**: `PATCH /api/v1/admin/charities/{id}/status`
**인증**: Firebase ID Token (관리자 권한)

**요청 Body**:
```json
{
  "status": "approved",
  "admin_note": "CC 번호 확인 완료. Stripe Connect 온보딩 이메일 발송."
}
```

**status 값**:
| 값 | 의미 | 이메일 발송 |
|----|------|------------|
| `approved` | 승인 | ✅ 승인 알림 + Stripe Connect 온보딩 링크 |
| `rejected` | 거절 | ✅ 거절 사유 포함 |
| `consultation` | 상담 요청 | ✅ 담당자가 연락 예정 안내 |
| `pending` | 대기 (재검토) | ❌ |

**성공 응답** (200 OK):
```json
{
  "id": "app_xxxxxxxxxxxxxxxx",
  "status": "approved",
  "reviewed_at": "2026-05-18T15:30:00Z"
}
```

---

### 4. 관리자: 신청 상세 조회

**엔드포인트**: `GET /api/v1/admin/charities/{id}`
**인증**: Firebase ID Token (관리자 권한)

**응답**: 위 목록 조회의 단일 item 객체와 동일한 형태

---

## 🟡 [중요] 관리자 권한 설계

### 방법 A (권장): Firebase Custom Claims
```
// 백엔드에서 특정 UID에 관리자 권한 부여
admin.auth().setCustomUserClaims(uid, { admin: true });

// 프론트엔드에서 확인
const token = await user.getIdTokenResult();
if (token.claims.admin) { /* 관리자 메뉴 표시 */ }
```

### 방법 B: 이메일 화이트리스트
```
// 환경 변수로 관리자 이메일 목록 관리
ADMIN_EMAILS=admin@deargiver.nz,team@deargiver.nz
```

> **현재 프론트엔드**: `/admin/charities` 페이지는 인증 없이 접근 가능합니다.
> 백엔드 관리자 권한 방식이 확정되면 프론트에서 보호 로직을 추가하겠습니다.

---

## 🟡 [중요] Stripe Connect 온보딩 자동화

단체가 승인되면 기부금을 직접 수령하기 위한 Stripe Connect 계정이 필요합니다.

### 승인 시 자동 흐름 (권장):
```
1. 관리자가 "승인" 버튼 클릭
2. 백엔드: Stripe Connect Account 생성
   stripe.accounts.create({ type: 'express', country: 'NZ', ... })
3. 백엔드: 온보딩 링크 생성
   stripe.accountLinks.create({ account: acct_xxx, type: 'account_onboarding', ... })
4. 단체 이메일로 온보딩 링크 발송
5. 단체가 Stripe 온보딩 완료 → 플랫폼에 게시
```

**추가 API 필요**:
- `GET /api/v1/admin/charities/{id}/stripe-status` — Stripe Connect 온보딩 상태 확인
- `POST /api/v1/admin/charities/{id}/resend-stripe-link` — 온보딩 링크 재발송

---

## 🟢 [선택] 이메일 템플릿 내용

### 접수 확인 이메일 (신청 직후)
```
제목: DearGiver 단체 등록 신청이 접수되었습니다 — {display_name}

{contact_name}님,

{display_name}의 DearGiver 플랫폼 등록 신청이 접수되었습니다.

DearGiver 팀이 제출하신 정보를 검토한 후 3~5 영업일 이내에 연락드리겠습니다.

신청 번호: {application_id}
CC 번호: {cc_number}

문의: support@deargiver.nz
```

### 승인 이메일
```
제목: 🎉 DearGiver 단체 등록이 승인되었습니다 — {display_name}

{contact_name}님,

{display_name}의 DearGiver 플랫폼 등록이 승인되었습니다!

다음 단계로 Stripe Connect 계정을 설정해 주세요.
이 과정을 완료해야 기부금을 직접 수령하실 수 있습니다.

👉 Stripe 온보딩 시작하기: {stripe_onboarding_link}
(링크 유효기간: 7일)

온보딩 완료 후 DearGiver 플랫폼에 단체가 게시됩니다.
```

### 거절 이메일
```
제목: DearGiver 단체 등록 신청 결과 안내

{contact_name}님,

{display_name}의 신청을 검토한 결과, 아쉽게도 현재 시점에서는 등록이 어렵습니다.

사유: {admin_note}

추가 문의: support@deargiver.nz
```

---

## 📋 DB 스키마 제안 (참고용)

```sql
CREATE TABLE charity_applications (
  id              VARCHAR(32) PRIMARY KEY,
  legal_name      VARCHAR(200) NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  cc_number       VARCHAR(20) NOT NULL,
  category        VARCHAR(50) NOT NULL,
  website         VARCHAR(255),
  year_established VARCHAR(4),
  mission         TEXT NOT NULL,
  description     TEXT NOT NULL,
  impact_statement TEXT,
  contact_name    VARCHAR(100) NOT NULL,
  contact_title   VARCHAR(100),
  contact_email   VARCHAR(255) NOT NULL,
  contact_phone   VARCHAR(30),
  address         VARCHAR(255),
  city            VARCHAR(100) NOT NULL,
  region          VARCHAR(100) NOT NULL,
  status          ENUM('pending','approved','rejected','consultation') DEFAULT 'pending',
  admin_note      TEXT,
  stripe_account_id VARCHAR(32),        -- 승인 후 Stripe Connect 계정 ID
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  applied_at      TIMESTAMP DEFAULT NOW(),
  reviewed_at     TIMESTAMP
);
```

---

## 우선순위 요약

| # | 항목 | 우선순위 |
|---|------|---------|
| 1 | `POST /api/v1/charities/apply` + 접수 확인 이메일 | 🔴 필수 |
| 2 | `GET /api/v1/admin/charities` | 🔴 필수 |
| 3 | `PATCH /api/v1/admin/charities/{id}/status` + 결과 이메일 | 🔴 필수 |
| 4 | 관리자 권한 설계 (Firebase Custom Claims 권장) | 🟡 중요 |
| 5 | Stripe Connect 온보딩 자동화 | 🟡 중요 |
| 6 | `GET /api/v1/admin/charities/{id}` (상세) | 🟢 선택 |
| 7 | 온보딩 링크 재발송 API | 🟢 선택 |
