# Backend API Request — 2차 요청서
> **From**: Frontend Team  
> **To**: Backend Team  
> **Date**: 2026-05-27  
> **이전 요청서**: `FILE_UPLOAD_API_REQUEST.md` (2026-05-27, 파일 업로드 관련)

---

## 📋 요약

| 구분 | 건수 | 비고 |
|------|------|------|
| 🆕 **신규 요청** | 13건 | 관리자 기능 + 통합 알림 시스템 |
| 🔄 **이전 요청 변경/추가** | 4건 | 1차 요청서 내용 수정 또는 보완 |

---

# Part A — 🆕 신규 요청 (13건)

> 아래 엔드포인트들은 모두 **새롭게 필요한 API**입니다. 이전 요청서에는 포함되지 않았습니다.

---

## A-1. 관리자: 단체 신청 목록 조회

```
GET /api/v1/admin/charities?status={status}&page={page}&page_size={pageSize}

Query Parameters:
  status: "pending" | "approved" | "rejected" | "suspended" (optional)
  page: number (default: 1)
  page_size: number (default: 30)

Response (200):
{
  "items": [
    {
      "id": 3,
      "display_name": "Hope Foundation",
      "email": "admin@hope.org.nz",
      "application_status": "pending",
      "legal_name": "Hope Foundation NZ Trust",
      "registration_number": "CC12345",
      "category": "Social Services",
      "region": "Auckland",
      "contact_name": "Sarah Thompson",
      "contact_phone": "+64-21-1234567",
      "created_at": "2026-05-20T12:00:00Z",
      "updated_at": "2026-05-25T14:30:00Z",
      "logo_url": "https://...",
      "website_url": "https://hope.org.nz"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 30
}
```

---

## A-2. 관리자: 단체 신청 승인/거절/보류

```
PATCH /api/v1/admin/charities/{charityId}/status
Content-Type: application/json

{
  "status": "approved" | "rejected" | "suspended",
  "admin_note": "승인 사유 또는 거절 사유 (optional)"
}

Response (200):
{
  "ok": true,
  "charity": {
    "id": 3,
    "application_status": "approved",
    "admin_note": "All documents verified",
    "reviewed_at": "2026-05-27T10:00:00Z",
    "reviewed_by": "admin@deargiver.co.nz"
  }
}
```

---

## A-3. 관리자: 프로젝트 심사 목록 조회

```
GET /api/v1/admin/projects?status={status}&page={page}&page_size={pageSize}

Query Parameters:
  status: "pending_review" | "active" | "suspended" | "rejected" | "completed" | "cancelled" | "draft" (optional)
  page: number (default: 1)
  page_size: number (default: 30)

Response (200):
{
  "items": [
    {
      "id": 12,
      "title": "Clean Water Initiative",
      "charity_id": 3,
      "charity_name": "Hope Foundation",
      "project_status": "pending_review",
      "description": "Providing clean water access...",
      "goal_amount_minor": 5000000,
      "current_amount_minor": 0,
      "currency_code": "NZD",
      "cover_image_url": "https://...",
      "start_date": "2026-06-01",
      "end_date": "2026-12-31",
      "donor_count": 0,
      "created_at": "2026-05-25T08:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 30
}
```

---

## A-4. 관리자: 프로젝트 상태 변경 (승인/보류/거절)

```
PATCH /api/v1/admin/projects/{projectId}/status
Content-Type: application/json

{
  "status": "active" | "suspended" | "rejected",
  "admin_note": "사유 (optional)"
}

Response (200):
{ "ok": true, "message": "Project status updated" }
```

---

## A-5. 관리자: 기부 내역 목록 조회

```
GET /api/v1/admin/donations?status={status}&page={page}&page_size={pageSize}

Query Parameters:
  status: "completed" | "pending" | "refunded" | "failed" (optional)
  page: number (default: 1)
  page_size: number (default: 30)

Response (200):
{
  "items": [
    {
      "id": "don_abc123",
      "donor_name": "John D.",
      "donor_email": "john@example.com",
      "charity_name": "Hope Foundation",
      "project_title": "Clean Water Initiative",
      "amount_minor": 5000,
      "currency_code": "NZD",
      "status": "completed",
      "payment_method": "card",
      "stripe_payment_intent_id": "pi_xxx",
      "created_at": "2026-05-26T14:30:00Z",
      "receipt_url": "https://...",
      "refundable": true
    }
  ],
  "total": 1250,
  "page": 1,
  "page_size": 30
}
```

---

## A-6. 관리자: 기부 환불 처리

```
POST /api/v1/admin/donations/{donationId}/refund
Content-Type: application/json

{
  "reason": "Duplicate charge",
  "amount_minor": 5000  (optional, 부분환불 시. 생략하면 전액환불)
}

Response (200):
{
  "ok": true,
  "refund": {
    "id": "rf_abc123",
    "status": "succeeded",
    "amount_minor": 5000,
    "reason": "Duplicate charge",
    "processed_at": "2026-05-27T10:00:00Z"
  }
}
```

---

## A-7. 관리자: 기부자 목록 조회

```
GET /api/v1/admin/donors?status={status}&page={page}&page_size={pageSize}

Query Parameters:
  status: "active" | "flagged" | "suspended" (optional)
  page: number (default: 1)
  page_size: number (default: 30)

Response (200):
{
  "items": [
    {
      "id": 101,
      "name": "John Smith",
      "email": "john@example.com",
      "status": "active",
      "total_donated_minor": 150000,
      "donation_count": 12,
      "last_donation_at": "2026-05-26T14:30:00Z",
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 340,
  "page": 1,
  "page_size": 30
}
```

---

## A-8. 관리자: 기부자 상태 변경

```
PATCH /api/v1/admin/donors/{donorId}/status
Content-Type: application/json

{
  "status": "active" | "flagged" | "suspended",
  "reason": "사유 (optional)"
}

Response (200):
{ "ok": true }
```

---

## A-9. 관리자: 재무 관리 개요

```
GET /api/v1/admin/finance/overview

Response (200):
{
  "total_platform_revenue_minor": 2500000,
  "total_donations_minor": 85000000,
  "total_settled_minor": 78000000,
  "pending_settlements_minor": 7000000,
  "avg_fee_rate": 0.029,
  "settlements": [
    {
      "charity_id": 3,
      "charity_name": "Hope Foundation",
      "total_received_minor": 12000000,
      "total_fees_minor": 348000,
      "total_settled_minor": 11000000,
      "pending_settlement_minor": 652000,
      "stripe_status": "active"
    }
  ]
}
```

---

## A-10. 관리자: 플랫폼 설정 조회/변경

```
GET /api/v1/admin/settings

Response (200):
{
  "platform_fee_rate": 0.029,
  "min_donation_minor": 500,
  "max_donation_minor": 10000000,
  "categories": ["Education", "Health", "Environment", ...],
  "regions": ["Auckland", "Wellington", ...],
  "auto_approve_projects": false,
  "require_stripe_onboarding": true
}
```

```
PATCH /api/v1/admin/settings
Content-Type: application/json

{
  "platform_fee_rate": 0.035,
  "auto_approve_projects": true
}

Response (200):
{ "ok": true }
```

---

## A-11. 통합 알림: Donor 알림 조회

```
GET /api/v1/notifications

Headers: Authorization: Bearer <id_token>

Response (200):
{
  "items": [
    {
      "id": "notif_abc123",
      "type": "donation_confirmed" | "receipt_ready" | "badge_unlocked" |
              "project_milestone" | "campaign_update" | "tax_reminder" |
              "monthly_report" | "charity_news",
      "title": "Donation Confirmed",
      "message": "Your $50 donation to Restore Native Forest was processed",
      "read": false,
      "action_url": "/dashboard",
      "created_at": "2026-05-27T10:00:00Z"
    }
  ],
  "unread_count": 3
}
```

---

## A-12. 통합 알림: Charity 알림 조회

```
GET /api/v1/charities/{charityId}/notifications

Headers: Authorization: Bearer <id_token>

Response (200):
{
  "items": [
    {
      "id": "notif_xyz789",
      "type": "donation_received" | "project_approved" | "project_rejected" |
              "project_suspended" | "fundraising_milestone" | "settlement_complete" |
              "stripe_issue" | "admin_message" | "document_expiry" | "refund_issued",
      "title": "New Donation Received",
      "message": "$200 donation received from John D.",
      "read": false,
      "action_url": "/charity/dashboard",
      "created_at": "2026-05-27T09:30:00Z"
    }
  ],
  "unread_count": 5
}
```

---

## A-13. 통합 알림: 알림 설정 조회/변경

```
GET /api/v1/notifications/preferences

Headers: Authorization: Bearer <id_token>

Response (200) — 역할에 해당하는 필드만 반환:
{
  // Donor (donor role일 때)
  "donation_receipts": true,
  "monthly_report": true,
  "campaign_updates": false,
  "tax_reminders": true,
  "badge_notifications": true,
  "milestone_updates": true,
  "charity_news": false,
  
  // Charity (charity_admin role일 때)
  "donation_received": true,
  "project_status_change": true,     // 서버에서 항상 true 반환 (필수)
  "fundraising_milestones": true,
  "settlement_complete": true,
  "stripe_alerts": true,              // 서버에서 항상 true 반환 (필수)
  "admin_messages": true,              // 서버에서 항상 true 반환 (필수)
  "document_expiry": true,
  "refund_alerts": true,
  
  // Admin (platform_admin role일 때)
  "new_applications": true,            // 서버에서 항상 true 반환 (필수)
  "project_reviews": true,             // 서버에서 항상 true 반환 (필수)
  "large_donations": true,
  "refund_requests": true,
  "stripe_issues": true,
  "daily_summary": false,
  "anomaly_detection": true,           // 서버에서 항상 true 반환 (필수)
  "system_events": true
}
```

```
PATCH /api/v1/notifications/preferences
Content-Type: application/json

{
  "campaign_updates": true,
  "daily_summary": true
}

Response (200):
{ "ok": true }
```

---

# Part B — 🔄 이전 요청 변경/추가 (4건)

> 아래는 1차 요청서(`FILE_UPLOAD_API_REQUEST.md`)에 포함된 항목 중 **변경 또는 보완이 필요한 것**입니다.

---

## B-1. 🔄 알림 읽음 처리 API — 경로 통합 요청

### 이전 요청 (1차)
```
PATCH /api/v1/admin/notifications/{notificationId}/read     ← Admin 전용
PATCH /api/v1/admin/notifications/read-all                  ← Admin 전용
```

### 변경 요청
```
PATCH /api/v1/notifications/{notificationId}/read           ← 역할 공통
PATCH /api/v1/notifications/read-all                        ← 역할 공통
```

### 변경 사유

기존에는 Admin 전용 알림벨(`AdminNotificationBell`) 만 API 연동되어 있었고, Donor/Charity는 하드코딩된 목업 데이터를 사용했습니다.

이번 업데이트에서 **하나의 통합 알림벨 컴포넌트(`UnifiedNotificationBell`)** 로 3개 역할(Donor, Charity, Admin)을 합쳤습니다. 따라서 알림 읽음 처리도 **역할에 관계없이 동일한 경로**를 사용하도록 통일했습니다.

**기존 Admin 전용 경로(`/admin/notifications/...`)는 프론트엔드에서 Admin 역할일 때 fallback으로 여전히 호출하고 있으므로, 즉시 제거할 필요는 없습니다.** 다만 향후에는 `/api/v1/notifications/...` 경로로 통일을 권장합니다.

서버 구현 시: 요청자의 `id_token`에서 역할을 판단하여, 해당 역할의 알림만 대상으로 읽음 처리하면 됩니다.

---

## B-2. 🔄 Admin 알림 목록 — 알림 type 2개 추가

### 이전 요청 (1차)
```typescript
type: 'new_application' | 'project_review' | 'large_donation' 
    | 'refund_request' | 'stripe_issue' | 'system'    // 6개
```

### 변경 요청
```typescript
type: 'new_application' | 'project_review' | 'large_donation' 
    | 'refund_request' | 'stripe_issue' | 'system'
    | 'daily_summary' | 'anomaly_detection'            // +2개 = 8개
```

### 변경 사유

Admin 알림 설정 UI를 역할별로 확장하면서 2가지 알림을 추가했습니다:

- **`daily_summary`**: 관리자가 매일 플랫폼 활동 요약(기부 건수, 금액, 신규 가입 등)을 받아볼 수 있는 기능. 설정 UI에서 기본값 OFF이며 관리자가 선택적으로 켤 수 있습니다.

- **`anomaly_detection`**: 비정상적인 활동 패턴(예: 동일 IP에서 단시간 대량 기부, 비정상 환불 패턴 등) 감지 시 관리자에게 알림을 보내는 기능. **필수 알림(끌 수 없음)** 으로 설정되어 있으며, 보안상 항상 활성 상태여야 합니다.

기존 6개 type에 대한 변경은 없으며, 프론트엔드는 기존 type도 정상 처리합니다. 새 type이 없어도 기존 동작에 영향 없습니다.

---

## B-3. 🔄 Admin 메시지 전송 — 응답 필드 보강

### 이전 요청 (1차, api.ts에서 사용 중)
```
POST /api/v1/admin/messages
Response: { "ok": true }
```

### 변경 요청
```
Response (200):
{
  "ok": true,
  "message_id": "msg_abc123",
  "delivered_at": "2026-05-27T10:00:00Z"
}
```

### 변경 사유

관리자 설정 페이지(`/admin/settings`)에 메시지 전송 기능을 구현했습니다. 메시지 전송 후 **전송 확인 토스트/알림 UI**를 표시하기 위해 `message_id`(추적용)와 `delivered_at`(전송 시각 표시용)이 필요합니다.

또한, 메시지가 전송되면 수신자(charity 또는 donor)의 알림 목록에 **`admin_message`** 타입 알림이 자동으로 생성되어야 합니다. 이를 통해:
- **Charity** → `/charities/{id}/notifications`에서 `admin_message` 타입 알림 확인
- **Donor** → `/notifications`에서 `admin_message` 타입 알림 확인

---

## B-4. 🔄 관리자 활성 단체 목록 + 단체별 프로젝트 조회 — 보완 추가

### 이전 요청 (1차)
해당 없음 — 1차 요청서에는 포함되지 않았습니다.

### 추가 요청
```
GET /api/v1/admin/charities/active?page={page}&page_size={pageSize}

Response (200):
{
  "items": [
    {
      "id": 3,
      "display_name": "Hope Foundation",
      "logo_url": "https://...",
      "category": "Social Services",
      "region": "Auckland",
      "project_count": 5,
      "total_received_minor": 12000000,
      "stripe_status": "active",
      "approved_at": "2026-03-15T10:00:00Z"
    }
  ],
  "total": 28,
  "page": 1,
  "page_size": 30
}
```

```
GET /api/v1/admin/charities/{charityId}/projects?page={page}&page_size={pageSize}

Response (200):
{
  "items": [
    {
      "id": 12,
      "title": "Clean Water Initiative",
      "project_status": "active",
      "goal_amount_minor": 5000000,
      "current_amount_minor": 3200000,
      "donor_count": 45,
      "created_at": "2026-04-01T08:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 30
}
```

### 추가 사유

관리자 페이지에서 **승인된 활성 단체를 운영 모니터링**하고, **단체별로 등록한 프로젝트를 조회**하는 기능을 구현했습니다.

이전 `GET /api/v1/admin/charities` (A-1)과의 차이:
- **A-1** (`/admin/charities`): **심사 프로세스** — "이 단체를 승인할까?" (pending/approved/rejected/suspended 필터)
- **B-4** (`/admin/charities/active`): **운영 모니터링** — "승인된 단체들이 잘 운영되고 있나?" (활성 단체만, 프로젝트 수, 총 수령액, Stripe 상태 포함)

프론트엔드의 `/admin/charities` 페이지에서 탭으로 분기하여 두 API를 모두 호출합니다. A-1의 `status=approved` 필터와 유사하지만, `project_count`, `total_received_minor`, `stripe_status`, `approved_at` 등 **모니터링 전용 필드**가 추가로 필요합니다.

---

# Part C — 공통 사항

## 인증 & 권한

| 엔드포인트 | 필요 권한 |
|-----------|----------|
| `/api/v1/admin/*` | `platform_admin` role |
| `/api/v1/charities/{id}/notifications` | 해당 charity의 `charity_admin` |
| `/api/v1/notifications` (Donor) | 인증된 사용자 (donor role) |
| `/api/v1/notifications/preferences` | 인증된 모든 사용자 |

## 페이지네이션 표준

모든 목록 API는 아래 형식을 따릅니다:
```
Query: ?page=1&page_size=30
Response: { "items": [...], "total": 42, "page": 1, "page_size": 30 }
```
프론트엔드는 **30개씩** 끊어서 요청합니다.

## 에러 응답 형식

```json
{
  "error": "NOT_FOUND",
  "message": "Charity with id 999 not found",
  "details": {}
}
```

---

# 📊 전체 요약 체크리스트

## 🆕 신규 (13건)

| # | 엔드포인트 | 메서드 | 설명 |
|---|-----------|--------|------|
| A-1 | `/admin/charities` | GET | 단체 신청 목록 (페이지네이션) |
| A-2 | `/admin/charities/{id}/status` | PATCH | 단체 승인/거절/보류 |
| A-3 | `/admin/projects` | GET | 프로젝트 심사 목록 |
| A-4 | `/admin/projects/{id}/status` | PATCH | 프로젝트 상태 변경 |
| A-5 | `/admin/donations` | GET | 기부 내역 목록 |
| A-6 | `/admin/donations/{id}/refund` | POST | 기부 환불 |
| A-7 | `/admin/donors` | GET | 기부자 목록 |
| A-8 | `/admin/donors/{id}/status` | PATCH | 기부자 상태 변경 |
| A-9 | `/admin/finance/overview` | GET | 재무 관리 개요 |
| A-10 | `/admin/settings` | GET/PATCH | 플랫폼 설정 |
| A-11 | `/notifications` | GET | Donor 알림 조회 |
| A-12 | `/charities/{id}/notifications` | GET | Charity 알림 조회 |
| A-13 | `/notifications/preferences` | GET/PATCH | 알림 설정 조회/변경 |

## 🔄 변경/추가 (4건)

| # | 내용 | 사유 요약 |
|---|------|----------|
| B-1 | 알림 읽음 API 경로 통합 | Admin 전용 → 역할 공통으로 변경 (통합 알림벨 리팩토링) |
| B-2 | Admin 알림 type 2개 추가 | 일일 요약 + 이상 탐지 알림 신설 |
| B-3 | 메시지 전송 응답 보강 | 전송 확인 UI를 위한 `message_id`, `delivered_at` 필드 추가 |
| B-4 | 활성 단체 + 단체별 프로젝트 조회 | 운영 모니터링용 별도 엔드포인트 (심사용 A-1과 분리) |
