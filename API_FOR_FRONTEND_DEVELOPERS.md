# 백엔드 REST API — 프론트엔드 개발자용 가이드

이 문서는 **Firebase Auth로 로그인한 브라우저 앱**이 `backend-server`(Express)와 통신할 때 필요한 계약만 정리한다. 서버 구현·DB 스키마 세부는 [REST_API.md](./REST_API.md) 및 레포 `backend-server/` 를 참고한다.

---

## 1. 한 줄 요약

| 항목 | 내용 |
|------|------|
| 인증 | **Firebase ID 토큰** → 모든 비즈니스 API에 `Authorization: Bearer <token>` |
| 베이스 경로 | **`/api/v1`** 아래에 엔드포인트가 모여 있음 |
| 참고 구현 | 이 레포의 `frontend-app/src/api.js` (`apiFetch`, `getRegistration` 등) |

---

## 2. 베이스 URL · 환경 변수

| 환경 | 설정 | 요청 URL 예시 |
|------|------|----------------|
| 로컬 (Vite) | `VITE_API_BASE_URL` 비움 | `GET /api/v1/me/registration` (상대 경로 → Vite가 `backend-server`로 프록시) |
| 프로덕션 | `VITE_API_BASE_URL=https://api.example.com` (끝 `/` 없이) | `GET https://api.example.com/api/v1/me/registration` |

- 빌드 시점에 값이 박히므로 **`npm run build` 전**에 CI/`.env`에 맞춰 둔다.
- 같은 오리진 뒤에 API를 리버스 프록시만 쓸 거면 비워 두고 `/api`만 써도 된다.

추가: 하위 경로 배포 시 `VITE_BASE_PATH` → `vite.config.js`의 `base` (자세한 건 [REST_API.md](./REST_API.md) §5).

---

## 3. 인증

### 3.1 헤더 (필수)

```http
Authorization: Bearer <Firebase ID 토큰>
Content-Type: application/json
```

### 3.2 토큰 얻기 (Firebase Web)

```ts
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
if (!user) throw new Error('로그인 필요');

const token = await user.getIdToken(/* forceRefresh */ false);
```

- 토큰 만료·갱신은 Firebase SDK가 처리. **401**이 오면 `getIdToken(true)` 한 번 더 후 재시도하는 패턴을 권장.
- **401** 메시지는 서버·프로젝트 설정에 따라 다름(프로젝트 불일치, 서비스 계정 오류 등).

### 3.3 공통 `fetch` 래퍼 패턴

레포 기준 동작은 `api.js`와 동일하면 된다.

1. `await user.getIdToken()`
2. `fetch(url, { method, headers: { Authorization, Content-Type }, body })`
3. `res.text()` 후 `JSON.parse` — 실패 시 본문이 JSON이 아닐 수 있음(프록시 HTML 등).
4. `!res.ok` 이면 `body.error.message` 등을 꺼내 **`throw`** 해서 UI에서 처리.

개발 모드에서 서버가 `error.detail`에 Firebase 오류 코드를 붙일 수 있다(`api.js`가 `err.detail`로 전달).

---

## 4. 헬스 (인증 없음)

서버 살아 있는지 확인할 때만 사용.

```http
GET /health
```

**200** 예:

```json
{ "ok": true, "service": "donation-backend-server" }
```

---

## 5. API 목록 (`/api/v1`)

아래는 **모두 Bearer 필수** (표에 명시한 것만 예외).

### 5.1 등록 여부 조회

```http
GET /api/v1/me/registration
```

**200 — 이미 서비스 DB에 등록됨**

```json
{
  "registered": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "status": "active"
  }
}
```

**200 — 아직 미등록 (추가 프로필 필요)**

```json
{
  "registered": false,
  "needsProfileCompletion": true,
  "suggestedEmail": "",
  "suggestedName": ""
}
```

- UI는 `registered === true` → 메인, `needsProfileCompletion === true` → 이메일/이름 입력 단계로 분기하면 된다.
- `suggestedEmail` / `suggestedName`은 Firebase 토큰에 있으면 채워 줄 수 있음.

---

### 5.2 서비스 DB에 사용자 등록

```http
POST /api/v1/me/registration
```

**Body (JSON)**

| 필드 | 타입 | 제약 |
|------|------|------|
| `email` | string | 필수, 이메일 형식, 최대 320자 |
| `name` | string | 필수, 최대 200자 |

**201 — 신규 등록**

```json
{
  "ok": true,
  "alreadyRegistered": false,
  "user": { "id": 1, "email": "...", "name": "...", "status": "active" }
}
```

**200 — 이미 같은 Firebase UID로 등록됨**

```json
{
  "ok": true,
  "alreadyRegistered": true,
  "user": { "id": 1, "email": "...", "name": "...", "status": "active" }
}
```

**에러**

| HTTP | `error.code` | 설명 |
|------|----------------|------|
| 400 | `invalid-argument` | 이메일/이름 검증 실패 |
| 409 | `already-exists` | 이메일 중복 또는 기타 중복 |

---

### 5.3 Stripe Checkout 세션 생성

```http
POST /api/v1/checkout/donations
```

**Body (JSON)**

| 필드 | 타입 | 설명 |
|------|------|------|
| `amount` | number | **AUD 정수 금액**(예: `50` = $50). 서버에서 `×100` 해 소수 단위로 전달. |
| `charityAccountId` | string | Stripe Connect **Connected account ID** (`acct_...`). |
| `charityName` | string | 선택. Checkout에 표시할 단체 이름. |

**200**

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

- 결제 UI는 **`url`로 `window.location.href` 리다이렉트**하면 된다(현재 앱과 동일).
- 서버는 세션 생성 후, DB에 `charity_payment_accounts.stripe_account_id === charityAccountId` 인 행이 있으면 **`donations`에 `checkout_created` 행을 INSERT**한다. **운영 DB에 해당 `acct_` 행이 없으면** 내역에는 안 쌓이고 서버 로그에만 경고가 남을 수 있다.
- Stripe 결제 완료 후 돌아올 URL은 서버 설정·`Origin`에 의존한다. 프론트가 `http://192.168.x.x:5173` 처럼 열려 있으면 기본적으로 그 **Origin** 기준으로 `…/success`, `…/` 리다이렉트가 잡힌다. 비브라우저·Origin 없음 → 백엔드 `PUBLIC_FRONTEND_URL` 또는 `CHECKOUT_SUCCESS_URL` / `CHECKOUT_CANCEL_URL` 필요. 상세는 [REST_API.md](./REST_API.md).

**에러**

| HTTP | 설명 |
|------|------|
| 400 | 금액 등 인자 오류 |
| 500 | Stripe 실패 또는 리다이렉트 URL 설정 실패 등 |

---

### 5.4 기부 내역 (페이지네이션)

```http
GET /api/v1/me/donations?page=1&pageSize=20
```

| Query | 기본 | 제약 |
|-------|------|------|
| `page` | 1 | ≥ 1 |
| `pageSize` | 20 | 1 ~ 50 |

**200**

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 0,
  "items": []
}
```
total이 전체 건수라서 그걸로 마지막 페이지를 계산

**`items[]` 한 행 (필드 예시)**

| 필드 | 설명 |
|------|------|
| `donation_amount_minor` 등 `*_minor` | **센트(소수 단위)** 정수. 표시 시 ÷100. |
| `currency_code` | 예: `AUD` |
| `donation_status` | 예: `checkout_created`, `succeeded` 등 |
| `paid_at`, `created_at` | ISO 유사 문자열(서버 UTC). 없으면 null. |
| `charity_display_name` | 단체 표시명(없으면 `"(단체 미연결)"` 등으로 내려올 수 있음). |
| `receipt_no`, `receipt_status`, … | 영수증이 있으면 채워짐. |

**에러**

| HTTP | `error.code` | 설명 |
|------|----------------|------|
| 401 | `unauthenticated` | 토큰 없음/무효 |
| 412 | `failed-precondition` | 서비스 DB `users`에 해당 Firebase UID 없음 → **5.2 등록 선행** |

---

## 6. 에러 응답 공통 형식

```json
{
  "error": {
    "code": "unauthenticated",
    "message": "사람이 읽을 수 있는 설명"
  }
}
```

- `message`를 그대로 토스트/인라인 에러에 쓰면 된다.
- 개발 빌드에서는 `error.detail`이 붙을 수 있음(서버 설정에 따름).

---

## 7. CORS · Firebase 콘솔 (프론트 담당 이슈)

- API 도메인과 프론트 도메인이 다르면 백엔드 `CORS_ORIGIN`에 **프론트 오리진 전체**(스킴+호스트+포트)가 등록돼 있어야 한다.
- LAN IP로 접속하면 그 오리진도 허용 목록에 포함되거나, 개발 중 `*` (비권장·운영 금지) 등 정책을 백엔드와 맞춘다.
- Firebase Auth: 콘솔 **승인된 도메인**에 배포·프리뷰 호스트를 추가한다.

---

## 8. 체크리스트 (연동 전)

- [ ] `VITE_API_BASE_URL` / 프록시가 의도한 `backend-server`를 가리키는지
- [ ] 로그인 후 `GET /me/registration` → 미등록 시 `POST /me/registration` → 이후에만 `GET /me/donations` (412 방지)
- [ ] Checkout용 `charityAccountId`가 DB `charity_payment_accounts`와 일치하는지(내역 적재)
- [ ] Stripe 리다이렉트가 실제 프론트 URL로 돌아오는지(Origin 또는 `PUBLIC_FRONTEND_URL` / `CHECKOUT_*`)

---

## 9. 관련 파일

| 용도 | 경로 |
|------|------|
| 프론트 래퍼 | `frontend-app/src/api.js` |
| 상세·운영 체크 | [REST_API.md](./REST_API.md) |
| 서버 라우트 | `backend-server/routes/v1.js` |
| DB 스키마 | `backend-server/db/mysql_schema.sql` |

문의 시: 엔드포인트·HTTP 상태·**요청/응답 원문**(Network 탭)을 함께내면 디버깅이 빠르다.
