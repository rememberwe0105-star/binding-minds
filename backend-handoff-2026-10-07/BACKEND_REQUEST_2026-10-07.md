# 백엔드 요청 — 2026-10-07 (통합본)

> **이 문서 하나로 정리했습니다.** 09-30 요청서(`BACKEND_REQUEST_2026-09-30.md`)는 전달되지 않은 것으로 보여
> 그 내용과 이후 추가된 항목을 모두 이 문서에 합쳤습니다. 09-30 문서는 참고하지 않으셔도 됩니다.
> (09-01 요청 — 테스트 계정 4종 / Stripe 온보딩 / 소개문구 — 은 반영 확인 완료, 감사합니다.)

- 백엔드 API: `http://libertron.iptime.org:8787/api/v1`
- 프론트 배포: `https://binding-minds.vercel.app`
- 프론트는 아래 경로·스펙으로 **이미 호출하도록 배선**돼 있습니다(404/405/501이면 "준비 중" 안내로 대체되는 게이트 패턴).
  **엔드포인트가 열리는 즉시 프론트 수정 없이 실연동**됩니다. (단, #10 감사 이메일은 현재 브라우저 저장 방식이라 API 확정 후 프론트 전환 작업이 함께 필요합니다.)
- 프론트 저장소 접근이 가능하시면 호출 코드는 `lib/api.ts` 에 있습니다 (`gatedFetch` 로 시작하는 함수들 = 백엔드 대기 중인 기능).

**첨부 (이 폴더)**
| 파일 | 내용 |
|---|---|
| `01_users-permissions.jpg` | #3·#4 — 완성된 Users & permissions 화면 (API 연결 대상 필드 확인용) |
| `02_donor-updates-email-settings.jpg` | #10 — 감사 이메일 설정 화면 ("Auto-saved locally" = 서버 저장 안 됨) |

---

## 0. 현황 요약 (2026-10-07 직접 호출 결과)

비인증 호출 기준 — `401` = 라우트 존재(정상), `404` = 미구현.

| # | 우선 | 항목 | 엔드포인트 | 현재 |
|---|---|---|---|---|
| 1 | **P0** | 서버 안정성 (자동 재시작·모니터링) | 8787 포트 전체 | 테스트 중 2회 다운 |
| 2 | **P1** | Stripe 결제창 상품명 "기부금" → 영문 | Checkout Session 생성부 | 한국어 노출 |
| 3 | **P1** | 기관 팀원 관리 (Users & permissions) | `GET/POST/PATCH/DELETE /me/charity/members…` | **404** (5개 전부) |
| 4 | **P1** | 플랜·결제 관리 포털 | `POST /me/charity/billing/portal` | **404** |
| 5 | **P1** | 에러 메시지 영문화 + `code` | 전체 | 한국어 메시지 |
| 6 | P2 | 관리자 활동 로그 | `GET /admin/activity` | **404** |
| 7 | P2 | 미완료 기부 결제 이어하기 | `POST /checkout/donations/:id/resume` (또는 `checkout_url`) | **404** |
| 8 | P3 | 영수증 번호 서버 발급 · 기부내역에 기관 정보 | `/me/donations`, `/charities/:id/donations` | 필드 없음 |
| 9 | P3 | (보안 참고) 공개 API의 `stripe_account_id` 노출 | `GET /charities`, `/charities/:slug` | 노출 중 |
| 10 | **P1** | 기부 감사 이메일 자동 발송 (템플릿·설정 저장 + 발송) | `/charities/:id/email-templates`, `/me/charity/email-settings` | **404** — 화면은 "자동 발송 On"인데 실제 발송 없음 |

참고로 정상 확인된 것: `/me/registration`, `/me/donations`, `/me/subscriptions`, `/me/charity/payouts`,
`/me/charity/fundraisers`, `/fundraisers`, `/charities/:slug/fundraisers`, `/admin/settings`,
`/admin/finance/overview`, `/admin/analytics/platform`, `POST /admin/messages`, `/notifications` (모두 401/200).

---

## 1. (P0) 서버 안정성 — 자동 재시작 + 헬스체크

**증상:** 프론트 테스트 도중 백엔드(8787)가 **두 번 내려갔고**, 그동안 사이트 전체가 데이터를 못 불러왔습니다.
Vercel 프록시는 이때 `ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR`(502)를 받습니다.
(프론트는 이제 이 경우 "Our service is temporarily unavailable…" 같은 일반 문구로 보여주도록 처리해 두었습니다.)

**요청:**
- 프로세스 매니저로 **크래시 시 자동 재시작** (pm2 / systemd `Restart=always` / NSSM 등 환경에 맞게)
- **부팅 시 자동 기동**
- `GET /health`(현재 200 정상)에 대한 **외부 모니터링**(UptimeRobot 등) + 다운 알림
- 가능하면 다운 원인 로그 확인 (메모리/미처리 예외 등)

---

## 2. (P1) Stripe Checkout 상품명 "기부금" → 영문

**증상:** 기부 → Stripe 결제 페이지의 라인아이템이 `Coastal Cleanup NZ 기부금` 처럼 **한국어 "기부금"** 으로 표시됩니다.

**원인:** 백엔드가 Checkout Session 생성 시 넣는 `line_items[].price_data.product_data.name`(또는 description) 값입니다.
프론트 결제 payload(`POST /api/v1/checkout/donations`)에는 상품명 필드가 없어 프론트에서 바꿀 수 없습니다.

**요청:** 영문 고정으로 변경. 예: `"Donation to <Charity name>"` 또는 `"<Project name> — Donation"`
(게스트 결제 `POST /checkout/donations/guest` 도 동일하게 적용 부탁드립니다.)

---

## 3. (P1) 기관 팀원 관리 — Users & permissions

Growth(유료) 기관 대시보드 **Users 탭**이 클라이언트 레퍼런스대로 완성돼 있습니다
(좌석 카드 "1 of 3 users included in your plan", Invite user, Manage ▾, Resend invite, Cancel invite, Last active).
지금은 API가 없어 **현재 로그인한 Owner 한 명만 표시**되고, 초대/변경/삭제는 "준비 중" 안내가 뜹니다.

모두 **인증 필요**, 요청 사용자의 **소속 기관 기준**입니다.

```
GET    /api/v1/me/charity/members
  → 200 {
      "members": [
        { "id": 6, "email": "owner@org.nz", "name": "Jane", "member_role": "owner",
          "status": "active", "invited_at": null, "last_active_at": "2026-10-07T01:23:00Z" },
        { "id": 7, "email": "sam@org.nz", "name": null, "member_role": "member",
          "status": "invited", "invited_at": "2026-10-06T09:00:00Z", "last_active_at": null }
      ],
      "seat_limit": 3,     // 플랜에 포함된 사용자 수
      "seats_used": 2      // active + 초대 대기 포함
    }

POST   /api/v1/me/charity/members/invite
  body: { "email": "new@org.nz", "role": "member" }
  → 201 생성된 member 객체 (status: "invited") + 초대 이메일 발송

POST   /api/v1/me/charity/members/:memberId/resend     ← 신규
  → 초대 이메일 재발송 + 만료일 갱신 (status 가 invited 인 경우만)

PATCH  /api/v1/me/charity/members/:memberId
  body: { "role": "owner" | "member" }
  → 200 갱신된 member 객체

DELETE /api/v1/me/charity/members/:memberId
  → 204 (active 멤버 제거 / invited 상태면 초대 취소)
```

**필드 메모**
- `status`: `active` | `invited` (프론트는 `pending` 도 초대 대기로 취급)
- `last_active_at`: "Last active" 컬럼 표시용(ISO, 없으면 null → "—")
- `seat_limit` / `seats_used`: 없으면 프론트가 기본 3명으로 가정 중. **Growth 플랜 실제 좌석 수 확인 부탁드립니다.**
- `member_role`: 현재 UI는 `owner`, `member` 두 가지만 노출. 추후 `admin`, `finance`, `campaign_manager` 로
  세분화할 수 있게 **확장 가능한 문자열 enum** 으로 잡아주세요.

**서버에서 강제해야 할 규칙**
- 기관마다 **Owner 최소 1명** — 마지막 Owner 강등/삭제는 `409` (프론트도 막고 있지만 서버에서도 필요)
- 초대/역할변경/삭제는 **Owner만** — 아니면 `403`
- **좌석 초과 시 초대 거부** — `409` 또는 `403` + `code: "seat_limit_reached"`
- 무료(Community) 플랜이면 `403` + `code: "plan_required"`
- 초대는 **7일 후 만료** (UI 하단에 "Pending invites will expire in 7 days." 표기 중)
- 초대받은 사람이 해당 이메일로 가입/로그인하면 그 기관의 `charity_admin` 으로 연결

---

## 4. (P1) 플랜·결제 관리 포털

Users 탭의 **"View plan & billing"** 링크가 호출합니다.

```
POST /api/v1/me/charity/billing/portal
  → 200 { "url": "https://billing.stripe.com/p/session/..." }
```

- Stripe **Customer Portal** 세션 URL을 생성해 반환 (구독 확인/결제수단 변경/해지)
- `return_url` 은 `https://binding-minds.vercel.app/charity/dashboard` 로 설정 부탁드립니다
- Owner만 허용(아니면 403)

---

## 5. (P1) 에러 메시지 영문화 + 고정 `code`

**증상:** 서버 에러 `message` 가 한국어입니다. 예:
`POST /checkout/donations/guest` 빈 요청 → `{"error":{"code":"invalid-argument","message":"올바른 기부 금액이 전달되지 않았습니다."}}`

사이트는 영어 사용자 대상이라 프론트는 **한글이 섞인 서버 메시지는 숨기고** 상태코드별 일반 문구
(예: "Something went wrong (error 400). Please try again.")로 대체하고 있습니다.
그래서 사용자에게 **구체적인 안내(무엇이 잘못됐는지)가 전달되지 않습니다.**

**요청:**
- 사용자에게 보일 수 있는 `error.message` 는 **영문**으로 (예: `"Please enter a valid donation amount."`)
- `error.code` 는 지금처럼 **고정 문자열** 유지 (프론트가 분기에 사용)
- 영문 메시지는 프론트가 그대로 노출합니다(별도 수정 불필요)

---

## 6. (P2) 관리자 활동 로그

관리자 개요 화면의 "Recent activity" 가 이 API를 호출하며, 현재 404라 비어 보입니다.

```
GET /api/v1/admin/activity?page=1&pageSize=10        (platform_admin 전용)
  → 200 {
      "items": [
        { "id": "a1", "type": "charity_approved", "message": "Greenpeace Aotearoa claim approved",
          "actor": "test.admin@bindingminds.co.nz", "target_id": 12, "target_type": "charity",
          "created_at": "2026-10-07T01:00:00Z" }
      ],
      "total": 1
    }
```

`type` 값(프론트 아이콘 매핑): `charity_approved`, `charity_rejected`, `donation_received`, `project_created`,
`project_reviewed`, `donor_suspended`, `refund_issued`, `system_event`

---

## 7. (P2) 미완료 기부 "결제 이어하기"

결제를 끝내지 않은 기부가 대시보드에 `pending`/`cancelled` 로 남습니다. 지금은 클릭 시 **해당 기관 페이지로 보내 새로 결제**하게 해두었습니다.
원래 결제를 이어가려면 둘 중 하나가 필요합니다.

- 기부 내역 항목에 만료 전 **`checkout_url`** 포함, 또는
- `POST /api/v1/checkout/donations/:id/resume` → `{ "url": "<새 Stripe Checkout URL>" }`

없으면 현재 동작을 유지합니다(필수 아님).

---

## 8. (P3) 영수증 — 번호 서버 발급 · 기부내역에 기관 정보

영수증 PDF(NZ IRD 기준)는 프론트에서 생성합니다. 기부자용·기관용(Donations 탭) 모두 동작 중입니다.

**이번에 프론트에서 해결한 것:** 기관 CC 등록번호가 "Pending"으로 하드코딩돼 있던 것을 공개 기관 API의
`registration_no`(84곳 전부 존재)를 조회해 실제 값(예: `CC58459`)으로 표시하도록 수정했습니다.

**백엔드에 요청:**
- **`receipt_no`(공식 영수증 번호)를 서버에서 발급**해 `/me/donations` 와 `/charities/:id/donations` 항목에 포함.
  지금은 없어서 프론트가 `DG-YYYYMMDD-<기부ID>` 형식으로 임시 생성합니다.
- 두 기부내역 응답 항목에 **`charity_id`** 와 **`charity_registration_no`**(또는 `cc_number`) 포함
  → 프론트가 별도 조회 없이 바로 영수증에 찍을 수 있습니다.

---

## 9. (P3, 보안 참고) 공개 API의 `stripe_account_id` 노출

`GET /charities`, `GET /charities/:slug` 응답에 `stripe_account_id`(예: `acct_…`)가 포함됩니다.
비밀키는 아니지만 공개 화면에서 쓰지 않으므로, **공개 응답에서는 제외하고 "결제 가능 여부"만 불리언으로**
(`donations_enabled: true/false` 등) 주시는 걸 권장합니다. 바꾸실 경우 미리 알려주시면 프론트도 함께 맞추겠습니다
(현재 프론트는 이 값의 존재 여부로 기부 버튼 활성화를 판단합니다).

---

## 10. (P1) 기부 감사 이메일 자동 발송

**현황 (중요):** 기관 대시보드 **Donor Updates** 탭에서 기관이
"Auto Thank-You Email: **On**", "Attach Receipt PDF: **On**", Reply-To 주소, 감사 메시지 템플릿(프로젝트별)을 설정할 수 있는데,
**전부 브라우저(localStorage)에만 저장**되고 서버로 가지 않습니다. 즉 **기관은 감사 이메일이 나가는 줄 알지만 실제로는 아무 메일도 발송되지 않습니다.**
(관련 엔드포인트 `GET /charities/:id/email-templates`, `/me/charity/email-settings` 모두 404) — 첨부 `02_donor-updates-email-settings.jpg`

이 기능은 2026-06 요청서(`BACKEND_REQUEST_RECEIPT_EMAIL.md`)에 처음 있었고, 그중 아직 남은 부분만 정리했습니다.

**① 설정 저장**
```
GET  /api/v1/me/charity/email-settings
PUT  /api/v1/me/charity/email-settings
  body/응답: { "auto_send_thank_you": true, "attach_receipt_pdf": true, "reply_to_email": "hello@org.nz" | null }
```

**② 템플릿 CRUD** (프론트 `lib/api.ts` 에 이미 이 경로로 함수가 있습니다)
```
GET    /api/v1/charities/:charityId/email-templates
  → { "items": [ { "id": "t1", "title": "Thank You for Your Generosity",
                   "body": "Dear {donor_name}, ...", "is_active": true,
                   "applies_to": "general" | <project_id>, "created_at": "..." } ], "total": 1 }
POST   /api/v1/charities/:charityId/email-templates      body: { title, body, is_active?, applies_to? }
PUT    /api/v1/charities/:charityId/email-templates/:id
DELETE /api/v1/charities/:charityId/email-templates/:id
```
- 플랜 제한: Community(무료) **템플릿 1개**, Growth **여러 개 + 프로젝트별 지정**
- 해당 기관 소속(charity_admin)만 접근

**③ 실제 발송 (핵심)** — Stripe `checkout.session.completed`(기부 `succeeded`) 처리 시:
1. 기관의 `auto_send_thank_you` 가 true 면
2. 템플릿 선택: 해당 **프로젝트 지정 활성 템플릿 → 없으면 general 활성 템플릿 → 없으면 기본 문구**
3. 치환자 렌더: `{donor_name}`, `{amount}`, `{project_name}`, `{charity_name}`, `{date}` (NZ 시간대, NZD 표기)
4. `attach_receipt_pdf` 가 true 면 영수증 PDF 첨부 (#8 의 `receipt_no` 와 같은 번호 사용 권장)
5. `reply_to_email` 이 있으면 Reply-To 로 설정, 없으면 no-reply
6. 익명 기부(`is_anonymous`)라도 기부자 본인에게는 발송 (기관에 이메일 노출은 하지 않음)
7. 발송 결과를 기부 건에 기록 (`receipt_status: "emailed"` 등) — 기관 Donations 탭 표시용

**결정 필요:** 이메일 발송 서비스(이전 요청서에선 Resend 추천)와 발신 주소(`noreply@deargiver.nz` 등) 도메인 인증.

---

## 참고 — 프론트 측 반영 완료 (요청 아님)

| 항목 | 처리 |
|---|---|
| Donation Tax Credit 탭 상단·How to claim·계산기 문구 (클라이언트 목업 기준) | 반영·배포 |
| Users & permissions 화면 (레퍼런스 기준 재설계) | 반영·배포 (API 대기) |
| 기관 계정으로 `/dashboard` 접근 시 기관 대시보드로 이동 | 반영 |
| 기관 Donations 탭 영수증 PDF 다운로드 | 반영 |
| 서버 다운/에러 시 개발용 메시지 노출 방지 (영문 일반 문구) | 반영 |
| 모바일에서 긴 기관명 버튼이 화면을 넘치던 문제 | 수정 |
| 통계(Charities Supported / Total Donations)에서 pending 제외 | 수정 |
| 영수증 PDF 기관 CC 등록번호 실제 값 표시 | 수정 |
| Donor Updates 템플릿 대상에 다른 기관(데모) 프로젝트가 뜨던 문제 | 수정 (실제 기관 프로젝트로) |

**우선순위:** 1(서버 안정성) → 2(기부금 영문) · 10(감사 이메일) · 3·4(팀원/결제 포털) · 5(에러 영문) → 6·7 → 8·9
