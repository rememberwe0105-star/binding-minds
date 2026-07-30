# DearGiver — Backend 추가 요청서 (v8.2) — Accounting & Xero Sync

- **작성일**: 2026-07-30
- **선행 문서**: v8.0, v8.1 (반영 중) — **두 문서의 항목은 변경 없이 그대로 유효**, 본 문서는 순수 추가
- **우선순위**: 기존 v8.0 P0/P1보다 낮음 — Growth 플랜 출시 시점에 맞추면 됨
- 전달용 PDF: `BACKEND_API_REQUEST_V8_2.pdf`

---

## 개요

Growth(유료) 플랜 기능으로, **Stripe payout(실제 은행 입금)별 구성 내역을 정리해
Xero로 단방향 전송**하는 회계 기능. 프론트 데모(Accounting 탭)는 배포 완료.

- 방식: **플랫폼 → Xero API 직접 단방향 sync** (Zapier 아님 — payout summary 로직이
  어차피 내부에 필요하고, 기관별 Zapier 계정 요구는 유료 기능 신뢰성에 부적합)
- Xero에서 읽는 것은 **계정과목(COA)뿐**, 거래 데이터는 플랫폼→Xero 단방향
- 환불/chargeback: **플랫폼은 환불 기능을 제공하지 않음** (기관이 Stripe에서 직접 처리,
  Donorbox 모델). 플랫폼은 webhook으로 기록만 하여 payout 조정 라인에 반영

## 기본 계산 구조

```
payout net = donations gross − stripe fees − platform fees ± adjustments(refund/chargeback)
```

## 요청 API

### 1. Stripe payout 집계
| Method | Endpoint | 설명 |
|---|---|---|
| webhook | `payout.paid` 등 | payout별 구성 내역 집계·저장 (balance transaction 조회) |
| GET | `/api/v1/me/charity/payouts` | payout summary 목록/상세 (Growth 전용) |

### 2. 환불·chargeback 기록 (조정 라인)
- webhook: `charge.refunded`, `charge.dispute.*` 수신 → 소속 payout에 조정 기록
- 플랫폼 내 환불 요청/승인 기능은 **만들지 않음** (정책)

### 3. Xero 연동 (Growth 전용)
| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/me/charity/xero/connect` | OAuth2 연결 시작 (redirect) |
| DELETE | `/api/v1/me/charity/xero/connect` | 연결 해제 |
| GET | `/api/v1/me/charity/xero/accounts` | 계정과목(COA) 조회 |
| PUT | `/api/v1/me/charity/xero/mapping` | 매핑 저장 (donations/stripe fees/platform fees/adjustments → 계정) |
| POST | `/api/v1/me/charity/xero/sync/{payoutId}` | Receive Money 전송 (수입 + 음수 수수료 라인) |
| GET | `/api/v1/me/charity/xero/history` | sync 이력 |

### 4. 플랜 게이팅
- 위 엔드포인트 전부 `plan=paid`(Growth)만 접근, Community는 403 + 업그레이드 안내

## 프론트 상태
- Accounting 탭(Growth 데모) 배포됨: 연결 카드, 계정 매핑, payout summary 테이블,
  Send to Xero, sync history — mock 데이터. API가 열리면 그대로 연결.
