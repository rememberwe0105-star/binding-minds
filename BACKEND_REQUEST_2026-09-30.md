# 백엔드 요청 — 2026-09-30 (프론트 반영 후 백엔드 필요 항목)

이번 프론트 수정 배치에서 **프론트엔드만으로 끝낼 수 없어 백엔드 작업이 필요한 항목**만 정리했습니다.
프론트는 아래 경로/스펙으로 이미 호출하도록 배선돼 있고(게이트 패턴), 백엔드가 응답하기 시작하면
프론트 수정 없이 자동으로 실연동됩니다.

- 백엔드 API: `http://libertron.iptime.org:8787/api/v1`
- 프론트 배포: `https://binding-minds.vercel.app`

---

## 1. (P1) Stripe Checkout 상품명의 한국어 "기부금" → 영문화

**증상:** Confirm donation → Stripe 결제 페이지 상단 라인아이템이
`"<프로젝트명> 기부금"` 처럼 **한국어 "기부금"** 이 붙어 표시됩니다.
(예: `Coastal Cleanup NZ 기부금`)

**원인:** 이 라벨은 **백엔드가 Stripe Checkout Session 생성 시 `line_items[].price_data.product_data.name`
(또는 product description)에 넣는 값**입니다. 프론트 결제 payload(`POST /api/v1/checkout/donations`)에는
상품명 필드가 없습니다.

**요청:** 해당 상품명/설명을 **영문**으로 변경. 예:
- `"<Project/Charity name> — Donation"` 또는 `"Donation to <Charity name>"`

플랫폼이 다국어 대응 전이므로 영문 고정으로 충분합니다.

---

## 2. (P1) 기관 팀 관리 (Users & Permissions) — 멤버 관리 API

**배경:** Growth(유료) 기관 대시보드에 **"Users" 탭**을 추가했습니다(Owner가 팀원을 초대/역할변경/제거).
현재는 백엔드 미구현이라 **게이트 패턴으로 데모 동작**합니다. 아래 엔드포인트가 열리면 자동 실연동됩니다.

프론트가 호출하는 경로/스펙(전부 인증 필요, 요청 사용자의 소속 기관 기준):

```
GET    /api/v1/me/charity/members
  → 200 { "members": [
      { "id": 6, "email": "owner@org.nz", "name": "Jane", "member_role": "owner",
        "status": "active", "invited_at": null },
      { "id": 7, "email": "sam@org.nz",  "name": "Sam",  "member_role": "member",
        "status": "invited", "invited_at": "2026-09-30T..." }
    ] }

POST   /api/v1/me/charity/members/invite
  body: { "email": "new@org.nz", "role": "member" }   // role: 아래 참고
  → 초대 생성 + (가능하면) 초대 이메일 발송

PATCH  /api/v1/me/charity/members/:memberId
  body: { "role": "owner" | "member" | ... }

DELETE /api/v1/me/charity/members/:memberId
```

**역할(role) 값:** 지금은 `owner`, `member` 2종만 UI에 노출합니다. 다만 나중에
`admin`, `finance`, `campaign_manager` 등으로 세분화할 수 있도록 **확장 가능한 문자열 enum**으로 잡아주세요.

**규칙(서버에서도 강제 필요):**
- 기관마다 **Owner 최소 1명 유지** — 마지막 Owner의 역할 강등/삭제는 거부(4xx).
- Owner만 초대/삭제/역할변경 가능(`member_role === 'owner'` 또는 별도 권한 체크).
- 권한 없는 사용자 호출 시 403.

**참고:** 무료(Community) 플랜에서는 프론트에서 탭을 잠금 처리합니다. 백엔드도 Growth 아닐 때 403(`plan_required`)이면 프론트가 안내를 띄웁니다.

---

## 3. (P2) 미완료 기부의 "결제 이어하기(resume)" — checkout URL 노출

**배경:** 기부 결제를 완료하지 않으면 대시보드에 해당 기록이 `pending`(이후 `cancelled`)으로 남습니다.
프론트에서 이 기록을 **클릭하면 결제를 마저 할 수 있도록** 처리했는데, 현재는 원래 Stripe 세션을 재개할
방법이 없어 **해당 기관 페이지로 이동해 새로 결제**하도록 해두었습니다.

**요청(선택):** 원래 결제를 그대로 이어서 하려면 아래 중 하나가 필요합니다.
- 기부 내역 항목에 **`checkout_url`**(아직 만료 전이면)을 포함해 반환, 또는
- `POST /api/v1/checkout/donations/:id/resume` 같은 **재개 엔드포인트**로 유효한 Stripe URL 재발급.

이게 있으면 프론트가 미완료 기부를 정확히 그 결제 화면으로 돌려보낼 수 있습니다. 없으면 현재의
"기관 페이지로 이동 후 재결제" 동작을 유지합니다.

> 참고(프론트 반영 완료): 대시보드 통계 **Charities Supported / Total Donations 는 `succeeded` 기부만
> 카운트**하도록 수정했습니다(과거 pending 포함되던 문제 해결). 이건 백엔드 작업 아님.

---

## 4. (P3, 확인) 기관 명의 영수증에 대한 기관측 접근

**질문/제안:** 영수증 PDF 템플릿은 프론트에 있습니다(NZ IRD 기준, 기부자용).
기관이 **자기 기관 명의로 발행된 영수증/기부기록**에 접근하는 건 현재 대시보드 Donations 탭 + CSV export로
가능합니다. 만약 "기관이 개별 기부의 영수증 PDF를 직접 내려받게" 하려면, 기관용 기부 응답
(`GET /api/v1/charities/:id/donations`)에 **영수증 번호/발행 상태/기부자 표시명** 등 영수증 렌더에 필요한
필드가 포함되면 프론트에서 바로 구현 가능합니다. (필드 목록 확정 필요 시 회신 부탁드립니다.)

---

## 백엔드 작업 아님(프론트 반영 완료, 참고용)

| 항목 | 처리 |
|---|---|
| Support Q1 / Tax Credits 페이지·탭 문구 | 프론트 반영·배포 |
| 즐겨찾기 → My Causes 반영 | 프론트 버그 수정(실API id 매칭) |
| 통계에서 pending 제외 | 프론트 수정 |
| 계정 드롭다운 역할별 정리(도너/기관) | 프론트 수정 |
| 관리자 메뉴/페이지 접근 제한 | 프론트 수정 |

**우선순위 요약:** 1(기부금 영문화)·2(멤버 API)가 데모 품질에 가장 큰 영향입니다.
3·4는 있으면 좋은 항목입니다.
