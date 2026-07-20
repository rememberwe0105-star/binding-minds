# DearGiver — Backend 추가 요청서 (v8.1)

- **작성일**: 2026-07-20
- **선행 문서**: `BACKEND_API_REQUEST_V8.md` (v8.0, 기전달) — **v8.0 항목은 모두 그대로 유효**
- **이 문서는 v8.0 이후 추가분만** 담습니다 (전달용 PDF: `BACKEND_API_REQUEST_V8_1.pdf`)

---

## 요약

| 구분 | 항목 | 상태 |
|------|------|------|
| P1 | **게스트(비로그인) 기부** — 신규 엔드포인트 | FE 배포 완료, 엔드포인트 대기 |
| 정정 | 플랫폼 팁(addSupport) — v8.0의 "유지" → **제거** | FE 미전송으로 배포됨 |
| 참고 | 금액 동기화 버그 수정 · 데모 Free/Premium 플랜 분리 | BE 작업 없음 |

---

## [P1] 게스트(비로그인) 기부

기부 시작 단계에서 로그인 강제를 없애 완료율을 높입니다. 이름/이메일만 받아 기부를
완료하고, 완료 후 계정 생성을 유도합니다.

```json
POST /api/v1/checkout/donations/guest    (인증 헤더 없음)
{
  "amount": 50,
  "currency": "NZD",
  "charityAccountId": "acct_xxx",
  "charityName": "Trees That Count",
  "recurring": false,
  "anonymous": false,
  "donorType": "individual",
  "guestName": "Aroha Ngata",
  "guestEmail": "aroha@email.com"
}
```

### 백엔드 작업
1. 인증 없이 Checkout Session 생성 (`customer_email` = guestEmail)
2. 이름+이메일 기반 **게스트 고객 기록** 생성 — 동일 이메일 재기부 시 동일 고객 연결
3. 결제 완료 이메일에 **계정 연결 링크** 포함 — 가입 시 게스트 내역 자동 병합
   (Firebase email link 인증 활용 제안)
4. rate limit + 이메일 검증 (남용 방지)
5. 게스트 정기 기부는 **초기 차단(400) 권장** — 구독 관리에 계정 필요

---

## [정정] 플랫폼 팁(addSupport) 제거

v8.0 문서에서 "자발적 플랫폼 팁 $2: 유지"로 안내했으나, **론치 단계에서는 팁 옵션도
노출하지 않기로 확정**. 기부자는 선택한 금액만 결제합니다.

- 프론트는 `addSupport` 미전송 — 값이 오더라도 무시 처리 (하위 호환)
- Checkout 금액 = `amount` 단독
- 팁 관련 정산 로직이 있다면 비활성화

---

## [참고] 백엔드 작업 불필요 (FE 배포 완료)

- 상세 페이지 선택 금액 → 결제 모달 동기화 버그 수정
- 데모 charity 로그인 Free/Premium 분리 (플랜별 기능 잠금 시연 — 프론트 mock)
- 게스트 기부 UI (이름/이메일 입력 + 완료 페이지 계정 생성 유도) — P1 엔드포인트만 열리면 동작
