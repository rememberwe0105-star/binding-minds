# DearGiver — Backend 통합 추가 요청서 (v8.3) — 업데이트 3+4

- **작성일**: 2026-08-10
- **선행 문서**: v8.0, v8.1 (반영 중) — **두 문서의 항목은 변경 없이 그대로 유효**
- **⚠️ 본 문서는 v8.2(미착수)를 대체·통합합니다** — v8.2는 폐기하고 이 문서만 보시면 됩니다
- **우선순위**: 기존 v8.0 P0/P1 작업이 우선 — 본 건은 Growth 플랜 출시 시점에 맞추면 됩니다
- 전달용 PDF: `BACKEND_API_REQUEST_V8_3.pdf`

---

## A. Accounting & Xero Sync (Growth 유료 기능) — 구 v8.2 전체

Stripe payout(실제 은행 입금)별 구성 내역을 정리해 **Xero로 단방향 전송**하는 회계 기능.
프론트 데모(Growth 대시보드 Accounting 탭)는 배포 완료.

- 방식: **플랫폼 → Xero API 직접 단방향 sync** (Zapier 아님). Xero에서 읽는 것은 계정과목(COA)뿐
- 환불/chargeback: 플랫폼은 환불 기능을 제공하지 않음(기관이 Stripe에서 직접 처리, Donorbox 모델).
  플랫폼은 webhook 기록만 하여 payout 조정 라인에 반영
- 계산 구조: `payout net = donations gross − stripe fees − platform fees ± adjustments`

### A-1. Stripe payout 집계
| Method | Endpoint | 설명 |
|---|---|---|
| webhook | `payout.paid` 등 | payout별 구성 내역 집계·저장 (balance transaction 조회) |
| GET | `/api/v1/me/charity/payouts` | payout summary 목록/상세 (Growth 전용) |

### A-2. 환불·chargeback 기록
- webhook `charge.refunded`, `charge.dispute.*` → 소속 payout에 조정 기록
- 플랫폼 내 환불 요청/승인 기능은 만들지 않음 (정책)

### A-3. Xero 연동 (Growth 전용)
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/me/charity/xero/connect` | OAuth2 연결 시작 (redirect) |
| DELETE | `/api/v1/me/charity/xero/connect` | 연결 해제 |
| GET | `/api/v1/me/charity/xero/accounts` | 계정과목(COA) 조회 |
| PUT | `/api/v1/me/charity/xero/mapping` | 매핑 저장 (donations/stripe fees/platform fees/adjustments → 계정) |
| POST | `/api/v1/me/charity/xero/sync/{payoutId}` | Receive Money 전송 (수입 + 음수 수수료 라인) |
| GET | `/api/v1/me/charity/xero/history` | sync 이력 |

### A-4. 플랜 게이팅
- 위 엔드포인트 전부 `plan=paid`(Growth)만 접근, Community는 403

---

## B. 기관 프로필 메타데이터 (업데이트 4 신규 — 난이도 낮음)

Charities 목록에 정렬 옵션(Recently updated / Name A–Z / Claimed profiles first)이
추가되었습니다. 프론트는 현재 로컬 데이터로 동작하며, 백엔드 기관 API 연동 시
아래 필드가 응답에 포함되어야 실데이터 정렬이 가능합니다.

- 기관 목록/상세 응답에 추가:
  - `profile_updated_at` (프로필 정보가 마지막으로 관리/갱신된 시각)
  - `claim_status` (`unclaimed` | `claimed` | `partnered`) — 승인 파이프라인의 기존 상태와 매핑
- 프로필 수정·승인·티어 변경 등 관리 이벤트 시 `profile_updated_at` 갱신

---

## ⚡ 작업 방식 안내 — "백엔드 게이트" 패턴 (중요)

미구현 기능의 모든 버튼이 **실제 엔드포인트를 먼저 호출하도록 배선되어 있습니다**:

- 엔드포인트가 404/405/501 또는 미기동이면 → 사이트에 "Backend integration pending"
  다이얼로그가 뜨고, **필요한 `METHOD /path`와 요청서 번호가 그대로 표시**됩니다
- **엔드포인트가 정상 응답을 시작하는 순간, 프론트 수정 없이 자동으로 실연동 전환**됩니다
- 즉, 배포된 사이트를 클릭해 보는 것만으로 남은 작업 목록·스펙을 확인할 수 있고,
  구현 → 새로고침 → 동작 확인의 루프가 바로 돌아갑니다

게이트가 걸려 있는 지점 (프론트 코드 기준 스펙: `lib/api.ts` 하단 "백엔드 게이트" 블록):

| 화면/버튼 | 호출 엔드포인트 | 요청서 |
|---|---|---|
| 결제 모달 (비로그인) → Pay | `POST /api/v1/checkout/donations/guest` | v8.1 P1 |
| 대시보드 Recurring Giving 로드 | `GET /api/v1/me/subscriptions` | v7.0 P0 |
| Pause/Resume/Change/Cancel | `PATCH /api/v1/me/subscriptions/{id}` | v7.0 P0 |
| Growth Profile → Publish to checkout | `PUT /api/v1/me/charity/donation-tiers` | v8.0 P3-1 |
| Accounting 탭 로드 | `GET /api/v1/me/charity/payouts` | 본 문서 A-1 |
| Connect to Xero | `POST /api/v1/me/charity/xero/connect` | 본 문서 A-3 |
| Send to Xero | `POST /api/v1/me/charity/xero/sync/{payoutId}` | 본 문서 A-3 |

### payouts 응답 스키마 제안 (A-1) — 프론트 테이블과 1:1 매핑

```json
{
  "items": [
    {
      "id": "po_xxx",
      "paid_at": "2026-08-07",
      "donations_gross_minor": 124000,
      "donation_count": 21,
      "stripe_fees_minor": -3978,
      "platform_fees_minor": -3100,
      "adjustments_minor": -5000,
      "adjustment_note": "1 refund",
      "net_minor": 111922,
      "xero_synced_at": null
    }
  ]
}
```

---

## 프론트 상태 (참고)
- Accounting 탭(Growth 데모): 연결 카드, 계정 매핑, payout summary, Send to Xero, sync history — mock으로 배포됨
- Charities 정렬 UI + 안내 문구 배포됨 (로컬 데이터 기준 동작 중)
- 업데이트 4의 나머지(문구/디자인 전면 개편)는 백엔드 무관
