# 🚀 DearGiver 백엔드 연동 요청 사항 (Frontend → Backend)

> **발행일**: 2026년 5월 18일
> **프론트엔드 배포 완료**: https://binding-minds.vercel.app

프론트엔드 프로덕션(Vercel) 배포는 완료되었으나, 실제 기부 결제 및 세액공제 영수증 기능의 정상적인 동작을 위해 백엔드팀의 지원이 필요한 항목들을 우선순위별로 정리했습니다.

---

## 🔴 [긴급 / 최우선] 배포 차단(블로킹) 이슈

이 항목들이 해결되지 않으면 프로덕션 환경에서 사용자가 결제를 진행할 수 없습니다.

### 1. Stripe Publishable Key 제공 (가장 시급)
현재 프론트엔드에 Stripe 결제 모듈(Stripe.js)을 초기화하기 위한 **플랫폼 자체의 공개 키(Publishable Key)**가 없습니다. Stripe 계정을 백엔드팀에서 관리하고 계시므로 키 제공을 요청드립니다.

* **필요한 값**: `pk_test_...` (테스트용) 또는 `pk_live_...` (운영용)
* **확인 위치**: Stripe 대시보드 → Developers → API Keys → Publishable key
* **적용 방법**: 키를 전달해 주시면 프론트엔드(Vercel) 환경 변수 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`에 등록하겠습니다.

### 2. 백엔드 서버의 Stripe 결제 리다이렉트 URL 수정
사용자가 Stripe 결제를 완료하거나 취소하면 백엔드를 거쳐 프론트엔드로 돌아옵니다. 현재 로컬(`localhost:3000`)에서는 잘 작동하지만, 운영 환경에서는 백엔드가 리다이렉트 주소를 잘못 잡아 404 에러가 발생합니다.

* **이슈 사항**: 결제 성공 후 `localhost:3000/success`로 리다이렉트되는 현상
* **요청 사항**: 백엔드 서버 환경 변수에 프론트엔드 운영 URL을 고정해 주시거나 추가해 주세요.
```bash
# 아래와 같이 프론트엔드 URL을 명시적으로 설정 요청
PUBLIC_FRONTEND_URL=https://binding-minds.vercel.app
# 또는
CHECKOUT_SUCCESS_URL=https://binding-minds.vercel.app/donation/success
CHECKOUT_CANCEL_URL=https://binding-minds.vercel.app/donation/cancel
```

---

## 🟡 [중간] 정상 기능 동작을 위한 필수 데이터

### 3. API `pageSize` 최대 제한 완화 (50건 → 500건 이상)
프론트엔드의 **Tax Summary (연간 세금 요약 PDF)** 기능은 특정 과세연도의 전체 기부 내역을 한 번에 불러와서 합산해야 합니다.

* **요청 API**: `GET /api/v1/me/donations?page=1&pageSize=500`
* **현재 상태**: 백엔드에서 `pageSize`를 최대 50건으로 강제 제한 중
* **요청 사항**: 연간 기부가 많은 사용자를 위해 `pageSize` 상한선을 500건 이상으로 늘려주시거나, 한 번에 전체를 가져올 수 있는 옵션을 제공해 주세요.

### 4. 자선단체별 실제 Stripe Connect 계정 ID (DB 업데이트)
현재 모든 캠페인 데이터가 테스트용 계정 1개(`acct_1TLekBRHr11OamkF`)만 사용하고 있습니다. 실제 기부금이 각 단체로 배분되려면 단체별 ID가 필요합니다.

* **요청 사항**: 자선단체별 실제 `stripe_account_id` 발급 및 DB 업데이트 (`acct_...` 형태)
* **영향**: 이 값이 없거나 틀리면 기부금이 단체로 가지 않고 백엔드 DB에도 정상 기록되지 않습니다.

---

## 🟢 [낮음] 세부 기능 보완 사항

### 5. API 응답에 단체 등록번호(`charity_registration_no`) 추가
뉴질랜드 IRD 세액공제 영수증의 법적 요건으로, 영수증에 자선단체의 **Charities Services 등록번호 (CC Number)**가 표기되어야 합니다.

* **요청 API**: `GET /api/v1/me/donations`
* **요청 사항**: 기부 내역 응답 객체에 `charity_registration_no` 필드 추가
```json
// 추가 요청 필드 예시
{
  "charity_display_name": "Auckland City Mission",
  "charity_registration_no": "CC12345",  // <--- 이 필드가 필요합니다
  "donation_amount_minor": 5000
}
```

### 6. 서버 사이드 최소 기부금액 검증 ($20)
현재 프론트엔드 UI에서는 기부금 최소 금액을 20달러로 막아두었습니다. 하지만 API를 직접 호출할 경우를 대비해 백엔드에서도 검증이 필요합니다.

* **요청 API**: `POST /api/v1/checkout/donations`
* **요청 사항**: `amount`가 20 미만일 경우 `400 Bad Request` 에러 반환 로직 추가

---

## 💬 [논의 사항] 기부 영수증 세액공제 기준 금액
**영수증(PDF)에 표기할 '기부 금액'을 어느 기준으로 할지 확정이 필요합니다.**
1. **옵션 A (현재 프론트 적용 방식)**: 기부자가 결제한 총 금액 (예: $50.00)
2. **옵션 B**: Stripe 수수료 및 플랫폼 수수료를 제외하고 단체가 실제 수령한 금액 (예: $47.37)

*뉴질랜드 IRD 가이드라인에 맞춰 백엔드팀과 최종 확정 후 필요시 프론트엔드 수식을 수정하겠습니다.*
