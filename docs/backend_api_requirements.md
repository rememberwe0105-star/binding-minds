# DearGiver — Backend API 추가 요청서 (v7.0)
# 작성일: 2026-06-03
# 대상: 백엔드 팀
# 참조: 이전 요청서 (BACKEND_REQUEST_FINAL.md, 5월 20일) — 기존 항목 해결 완료

> 이전 v6.0 요청사항 (Stripe Key, 리다이렉트 URL, Role System, 단체 온보딩 등)은
> 모두 해결 완료되었습니다. 본 문서는 **신규 추가된 기능**만 다룹니다.

> 프론트엔드 주소: https://binding-minds.vercel.app
> 백엔드 API 주소: http://libertron.iptime.org:8787

---

## 이번 요청 요약

| 순위 | 기능 | 난이도 | 의존성 |
|:----:|------|:------:|--------|
| P0 | Recurring Donations (정기 기부) | 높음 | Stripe Subscriptions API |
| P1 | Gift Donation Metadata (선물 기부) | 낮음 | DB 스키마 추가 |
| P2 | Interest Notification Email (기관 초대) | 중간 | Resend + 도메인 인증 |
| P3 | Donor Journey API (기부자 관계) | 낮음 | 기존 API 확장 |
| -- | Impact Dashboard | -- | 백엔드 작업 불필요 |

---

## 변경 사항 안내

### 1. 수수료 모델 변경

| 항목 | 이전 (v6.0) | 현재 (v7.0) |
|------|:-----------:|:-----------:|
| 플랫폼 수수료 | 고정 $1/건 | Starter 2.5% / Growth 1.0% |
| 최소 수수료 | -- | $0.50 |
| 최소 기부금액 | $20 | $10 |
| 월 구독료 (Growth) | -- | $49/월 |

* POST /api/v1/checkout/donations에서 최소 금액 검증을 $20 -> $10으로 변경 필요

### 2. Stripe NZ 수수료 정정

이전 문서에서 ~1.5%로 안내했으나 잘못된 수치였습니다.

| 유형 | 올바른 수수료 |
|------|-------------|
| 국내 카드 (NZ) | 2.7% + NZ$0.30 |
| 해외 카드 | 3.5% + NZ$0.30 |

프론트엔드에서 기부자가 선택적으로 수수료 커버 가능 (국내 기준 계산).

---

## [P0] Recurring Donations — 정기 기부

### 현재 상태
- 프론트엔드: DonationCheckoutModal에서 recurring: true 파라미터를 이미 전송 중
- 프론트엔드: 대시보드에 RecurringDonationsCard 구독 관리 UI 구현 완료
- 백엔드: POST /api/v1/checkout/donations에서 recurring 파라미터 무시 중

### 1. Checkout Session 수정

엔드포인트: POST /api/v1/checkout/donations (기존 엔드포인트 확장)

프론트엔드가 보내는 요청:

```json
{
  "amount": 50,
  "currency": "NZD",
  "charityAccountId": "acct_xxx",
  "charityName": "Trees That Count",
  "coverStripeFee": true,
  "addSupport": false,
  "recurring": true
}
```

백엔드 로직:

```
if recurring == true:
  -> Stripe Checkout Session mode: "subscription"
  -> Price 객체 동적 생성 (recurring interval: "month")
  -> subscription_data에 metadata 포함
else:
  -> 기존 mode: "payment" 유지 (변경 없음)
```

Stripe API 호출 예시 (recurring === true):

```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price_data: {
      currency: 'nzd',
      product_data: { name: `Monthly donation to ${charityName}` },
      unit_amount: amountInCents,
      recurring: { interval: 'month' },
    },
    quantity: 1,
  }],
  subscription_data: {
    metadata: {
      charity_account_id: charityAccountId,
      platform_fee_percent: '2.5',
      donor_id: userId,
    },
    application_fee_percent: platformFeePercent,
  },
  success_url: `${FRONTEND_URL}/donation/success?project=${charityName}&amount=${amount}`,
  cancel_url: `${FRONTEND_URL}/donation/cancel`,
});
```

### 2. Subscription 관리 API (신규)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/v1/me/subscriptions | 내 정기 기부 목록 |
| PATCH | /api/v1/me/subscriptions/:id | 정기 기부 수정 (금액, 상태) |
| DELETE | /api/v1/me/subscriptions/:id | 정기 기부 취소 |

GET /api/v1/me/subscriptions 응답:

```json
{
  "subscriptions": [
    {
      "id": "sub_xxx",
      "charity_display_name": "Trees That Count",
      "charity_id": 42,
      "amount_minor": 5000,
      "currency_code": "NZD",
      "interval": "month",
      "status": "active",
      "current_period_start": "2026-05-01T00:00:00Z",
      "current_period_end": "2026-06-01T00:00:00Z",
      "next_payment_date": "2026-06-01T00:00:00Z",
      "created_at": "2026-01-15T00:00:00Z",
      "total_paid_minor": 25000,
      "payment_count": 5,
      "stripe_subscription_id": "sub_xxx"
    }
  ],
  "total": 1
}
```

PATCH /api/v1/me/subscriptions/:id 요청:

```json
{
  "amount_minor": 10000,
  "status": "paused"
}
```

* status: "active" | "paused"
* Stripe pause = subscription.pause_collection
* 금액 변경 = subscription.items의 price 업데이트

### 3. Webhook 처리

| Event | 처리 |
|-------|------|
| invoice.payment_succeeded | DB에 새 donation 레코드 생성 |
| customer.subscription.updated | 상태 업데이트 (pause/resume) |
| customer.subscription.deleted | 취소 처리 |
| invoice.payment_failed | 기부자에게 알림 이메일 |

### 4. DB 스키마

```sql
CREATE TABLE subscriptions (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  charity_id      INTEGER NOT NULL REFERENCES charities(id),
  stripe_sub_id   VARCHAR(255) UNIQUE NOT NULL,
  amount_minor    INTEGER NOT NULL,
  currency_code   VARCHAR(3) NOT NULL DEFAULT 'NZD',
  interval        VARCHAR(10) NOT NULL DEFAULT 'month',
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  next_payment_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ,
  total_paid_minor INTEGER NOT NULL DEFAULT 0,
  payment_count    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## [P1] Gift Donation Metadata — 선물 기부

### 현재 상태
- 프론트엔드: localStorage에 선물 데이터 저장 -> 성공 페이지에서 디지털 카드 표시
- 백엔드: 선물 메타데이터 저장 안 됨

### 1. Checkout Session에 Gift Metadata 추가

POST /api/v1/checkout/donations 요청에 추가할 필드:

```json
{
  "amount": 50,
  "currency": "NZD",
  "charityAccountId": "acct_xxx",
  "gift": {
    "recipientName": "Sarah Kim",
    "recipientEmail": "sarah@email.com",
    "message": "Happy birthday!"
  }
}
```

* gift 필드는 optional
* recipientEmail은 optional
* message는 max 200자

### 2. 처리 플로우

```
1. Stripe session metadata에 gift 정보 포함
2. donation 레코드에 gift 필드 저장
3. recipientEmail이 있으면 -> 결제 성공 후 선물 카드 이메일 발송
```

### 3. DonationItem 타입 확장

```typescript
interface DonationItem {
  // ... 기존 필드 ...
  is_gift?: boolean;
  gift_recipient_name?: string;
  gift_recipient_email?: string;
  gift_message?: string;
}
```

### 4. Gift Card 이메일

결제 성공 + gift.recipientEmail 존재 시:

```
From: noreply@deargiver.nz
To: sarah@email.com
Subject: A donation was made in your honor!

- "{donorName}" made a donation of $50 to {charityName} in your name!
- Message: "Happy birthday!"
- Learn more at deargiver.nz
```

### 5. DB 스키마 추가

```sql
ALTER TABLE donations
  ADD COLUMN is_gift         BOOLEAN DEFAULT FALSE,
  ADD COLUMN gift_recipient  VARCHAR(255),
  ADD COLUMN gift_email      VARCHAR(255),
  ADD COLUMN gift_message    TEXT;
```

---

## [P2] Interest Notification Email — 기관 초대

### 현재 상태
- 프론트엔드: POST /api/interest-notify Next.js API 라우트 구현 완료
- UNCLAIMED 단체 페이지에 "I'd love to donate!" 버튼 동작 중
- 이슈: Resend 무료 티어에서 인증된 도메인만 외부 이메일 발송 가능

### 1. 도메인 인증 (Resend)

```
1. Resend 대시보드 -> Domains -> Add Domain: deargiver.nz
2. DNS 레코드 추가:
   - MX record
   - SPF (TXT): v=spf1 include:amazonses.com ~all
   - DKIM (CNAME): resend 제공 값
3. 인증 완료 후 환경변수 업데이트:
   INTEREST_EMAIL_FROM=hello@deargiver.nz
```

### 2. 이메일 발송 로그 DB

```sql
CREATE TABLE interest_notifications (
  id              SERIAL PRIMARY KEY,
  charity_slug    VARCHAR(255) NOT NULL,
  charity_name    VARCHAR(255) NOT NULL,
  donor_name      VARCHAR(255),
  donor_email     VARCHAR(255),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_id       VARCHAR(255)
);

CREATE INDEX idx_interest_charity ON interest_notifications(charity_slug);
```

* 현재 인메모리 스팸 방지 -> 프로덕션에서 DB 기반으로 전환 필요

---

## [P3] Donor Journey API — 기부자 관계

### 현재 상태
- 프론트엔드: useApiDonations(500)으로 전체 기부 내역 로드 후 클라이언트 집계
- 문제: 기부 건수 증가 시 성능 저하

### 기관별 집계 API (신규)

엔드포인트: GET /api/v1/me/charity-relationships

응답:

```json
{
  "relationships": [
    {
      "charity_id": 42,
      "charity_display_name": "Trees That Count",
      "total_donated_minor": 15000,
      "donation_count": 5,
      "first_donation_at": "2026-01-15T00:00:00Z",
      "last_donation_at": "2026-05-10T00:00:00Z",
      "avg_donation_minor": 3000,
      "currency_code": "NZD",
      "recent_donations": [
        {
          "amount_minor": 5000,
          "paid_at": "2026-05-10T00:00:00Z",
          "status": "succeeded"
        }
      ]
    }
  ],
  "total_charities": 3,
  "total_donated_minor": 45000
}
```

---

## 신규 API 전체 매핑

| Method | Endpoint | 용도 | 우선순위 |
|--------|----------|------|:--------:|
| POST | /api/v1/checkout/donations | recurring 파라미터 처리 추가 | P0 |
| GET | /api/v1/me/subscriptions | 정기 기부 목록 | P0 |
| PATCH | /api/v1/me/subscriptions/:id | 정기 기부 수정 | P0 |
| DELETE | /api/v1/me/subscriptions/:id | 정기 기부 취소 | P0 |
| POST | /api/v1/checkout/donations | gift 메타데이터 저장 | P1 |
| GET | /api/v1/me/charity-relationships | 기관별 관계 집계 | P3 |

---

## 환경 변수 추가

```bash
# 기존 환경 변수는 유지. 아래만 추가/변경:

# 최소 기부금액 변경 ($20 -> $10)
MIN_DONATION_AMOUNT=1000  # $10 in cents

# Resend 도메인 인증 후 변경
INTEREST_EMAIL_FROM=hello@deargiver.nz  # 현재: onboarding@resend.dev
```

---

## 프론트엔드 연결 포인트 (백엔드 완성 후)

| 파일 | 수정 내용 |
|------|----------|
| components/RecurringDonationsCard.tsx | 목업 -> GET /api/v1/me/subscriptions |
| app/donation/success/page.tsx | localStorage -> API 응답에서 gift 데이터 |
| app/api/interest-notify/route.ts | 인메모리 -> DB 기반 스팸 방지 |
| app/dashboard/page.tsx (MyCausesTab) | 500건 풀로드 -> GET /api/v1/me/charity-relationships |

** 위 수정은 백엔드 API가 완성된 후에 진행합니다.
** 현재 프론트엔드는 목업/클라이언트 로직으로 완전 동작합니다.

---

## 백엔드 팀 응답 체크리스트

완료된 항목에 [x] 표시 후 프론트엔드 팀에 회신해 주세요.

### 정기 기부 (P0)
- [ ] POST /api/v1/checkout/donations — recurring 처리 추가
- [ ] GET /api/v1/me/subscriptions
- [ ] PATCH /api/v1/me/subscriptions/:id
- [ ] DELETE /api/v1/me/subscriptions/:id
- [ ] Webhook 처리 (invoice.payment_succeeded 등 4종)
- [ ] subscriptions 테이블 생성

### 선물 기부 (P1)
- [ ] POST /api/v1/checkout/donations — gift 메타데이터 저장
- [ ] donations 테이블에 gift 컬럼 추가
- [ ] Gift Card 이메일 발송 (recipientEmail 존재 시)

### 기관 초대 (P2)
- [ ] Resend 도메인 인증 (deargiver.nz)
- [ ] interest_notifications 테이블 생성

### 기부자 관계 (P3)
- [ ] GET /api/v1/me/charity-relationships

### 변경 사항
- [ ] 최소 기부금액 검증 $20 -> $10 변경

---

문서 끝. 질문이 있으면 프론트엔드 팀에 연락해주세요.
