# DearGiver — 백엔드 팀 API 연동 요청서 (Final Production Handoff)

> **작성일**: 2026년 5월 19일  
> **문서 버전**: v6.0 (최종 프로덕션 핸드오프 버전)  
> **프론트엔드 주소**: https://binding-minds.vercel.app  
> **백엔드 API 주소**: http://libertron.iptime.org:8787  
> **프론트엔드 상태**: 🟢 빌드 에러 0건, ESLint 에러 0건, 배포 준비 완료

---

## 🎯 안녕하세요, 백엔드 팀 여러분 👋

DearGiver 프론트엔드 팀입니다. 
현재 프론트엔드 코드베이스의 모든 개발 및 최적화(렌더링 폭포 현상 제거, ESLint 에러 해결, 서버사이드 렌더링 호환성 완비)가 끝났으며, **완벽한 프로덕션 레디(Production-Ready)** 상태입니다. 

이제 백엔드 API 연동만 완료되면 바로 서비스를 런칭할 수 있습니다. 각 항목별로 **현재 상태**, **필요한 사항**, 그리고 **이유**를 명확하게 정리했습니다.

---

## 📋 요청 목록 한눈에 보기

| # | 카테고리 | 요청 내용 | 긴급도 | 상태 |
|---|----------|-----------|--------|------|
| 1 | 환경설정 | Stripe Secret Key 전달 | 🔴 긴급 | 미해결 |
| 2 | 환경설정 | 결제 완료/취소 리다이렉트 URL 수정 | 🔴 긴급 | 미해결 |
| 3 | 환경설정 | 관리자 권한 확인 방식 (Role System) 확정 | 🔴 긴급 | 논의 필요 |
| 4 | 단체 가입 | 단체 가입 신청 API (`POST /api/v1/charities/apply`) | 🔴 긴급 | 미해결 |
| 5 | 관리자 | 신청 목록 조회 API (`GET /api/v1/admin/charities`) | 🔴 긴급 | 미해결 |
| 6 | 관리자 | 신청 승인/거절 API (`PATCH /api/v1/admin/charities/{id}/status`) | 🔴 긴급 | 미해결 |
| 7 | 관리자 | 신청 처리 이력(History) 조회 API | 🟡 중요 | 미해결 |
| 8 | 결제/계좌 | Stripe Connect 계좌 연동 자동화 | 🔴 긴급 | 미해결 |
| 9 | 결제/계좌 | 단체별 개별 Stripe 계정(Account ID) 연동 | 🟡 중요 | 미해결 |
| 10| 결제/계좌 | 최소 기부금액(NZD $10) 서버 검증 | 🟢 보완 | 미해결 |
| 11| 기부 내역 | 기부 내역 대량 조회 (Limit 확장) | 🟡 중요 | 미해결 |
| 12| 기부 내역 | 영수증용 단체 등록번호(CC Number) 데이터 포함 | 🟢 보완 | 미해결 |
| 13| 단체 계정 | 단체별 기부 내역 조회 API | 🟡 중요 | 미해결 |
| 14| 단체 계정 | 단체 프로필 정보 수정 API | 🟡 중요 | 미해결 |
| 15| 단체 계정 | 프로젝트/캠페인 CRUD API | 🟡 중요 | 미해결 |
| 16| 단체 계정 | 단체 대시보드 통계(Analytics) API | 🟡 중요 | 미해결 |
| 17| 플랫폼 관리| 기부자 목록 조회 및 상태 변경 API | 🟢 보완 | 미해결 |
| 18| 플랫폼 관리| 플랫폼 전체 통계 및 성장 지표 API | 🟢 보완 | 미해결 |

---

## 🔴 Part 1. 최우선 긴급 요청 (결제 및 코어 시스템)

### 1. Stripe Secret Key 서버 환경 변수 세팅 확인
- **상황**: 백엔드 팀에서 발급해 주신 Stripe 키를 프론트엔드(`Publishable Key`)에 성공적으로 적용 완료했습니다.
- **요청 사항**: 발급해 주신 `Secret Key`(`sk_test_...`)가 백엔드 서버의 환경 변수(`STRIPE_SECRET_KEY`)에도 정상적으로 등록되어 있는지 다시 한번 확인해 주세요. (백엔드 서버에서 결제 인텐트(PaymentIntent)를 생성하거나 검증할 때 이 키가 필수적으로 사용됩니다.)

### 2. 결제 완료 후 이동 주소(URL) 수정
- **상황**: 결제 후 돌아오는 리다이렉트 URL이 `localhost:3000`으로 설정되어 있습니다.
- **요청 사항**: 아래 환경 변수를 백엔드에 적용해 주세요.
  - `CHECKOUT_SUCCESS_URL=https://binding-minds.vercel.app/donation/success`
  - `CHECKOUT_CANCEL_URL=https://binding-minds.vercel.app/donation/cancel`

### 3. 사용자 권한 (Role System) 방식 결정
- **상황**: 유저가 일반 기부자인지, 단체 관리자인지, 플랫폼 관리자인지 식별해야 합니다.
- **요청 사항**: `Firebase Custom Claims`를 사용할지, 서비스 DB의 `users.role` 필드를 사용할지 결정해 주시면 프론트엔드 라우팅 가드(Routing Guard)에 즉시 적용하겠습니다.

---

## 🟠 Part 2. 단체 가입 및 온보딩 시스템

프론트엔드의 `/charity/apply` 폼이 완벽하게 구축되었습니다. 데이터 저장을 위한 다음 API들이 필요합니다.

### 4. 단체 가입 신청 API
- **Endpoint**: `POST /api/v1/charities/apply` (로그인 불필요)
- **Body 예시**:
  ```json
  {
    "legal_name": "Auckland City Mission Incorporated",
    "display_name": "Auckland City Mission",
    "cc_number": "CC20073",
    "category": "community",
    "bank_account_number": "12-3456-1234567-00",
    "ird_number": "123-456-789",
    "contact_email": "sarah@acmission.org.nz"
    // ... 프론트엔드 폼 데이터 매핑
  }
  ```

### 5. 관리자 신청 목록 조회 API
- **Endpoint**: `GET /api/v1/admin/charities?status={pending|approved|rejected}`
- **응답 예시**: 신청된 단체들의 페이지네이션된 목록과 처리 상태(`status`) 반환.

### 6. 관리자 신청 상태 업데이트 (승인/거절)
- **Endpoint**: `PATCH /api/v1/admin/charities/{id}/status`
- **Body**: `{ "status": "approved", "admin_note": "문서 확인 완료" }`
- **로직 요구사항**: 상태가 `approved`로 변경될 경우, 해당 단체의 이메일로 Stripe Connect 온보딩 링크 자동 발송.

---

## 🟡 Part 3. 대시보드 및 통계 데이터 (단체/관리자)

프론트엔드에 새롭게 구축된 단체용 대시보드(`/charity/dashboard`)와 관리자용 대시보드(`/admin/analytics`)를 활성화하기 위한 API입니다.

### 7. 단체 대시보드 분석 지표 (Analytics)
- **Endpoint**: `GET /api/v1/charity/dashboard/analytics`
- **응답 예시**: (Recharts 시각화용 데이터)
  ```json
  {
    "avg_donation_minor": 910000,
    "repeat_donor_ratio": 0.35,
    "monthly_trend": [
      { "month": "Jan", "amount_minor": 1500000 }
    ],
    "by_project": [
      { "name": "Housing Fund", "value_minor": 3640000 }
    ]
  }
  ```

### 8. 단체 프로필 및 캠페인 CRUD
- **프로필 수정**: `PATCH /api/v1/charities/{charityId}`
- **캠페인 관리**: `POST|PATCH|DELETE /api/v1/charities/{charityId}/projects`
- **목적**: 기존 `data/campaigns.ts`에 하드코딩된 데이터를 실제 DB 데이터로 마이그레이션.

### 9. 플랫폼 통합 관리자 통계
- **Endpoint**: `GET /api/v1/admin/analytics/platform`
- **응답 예시**: 총 기부금, 플랫폼 수수료(1%), 활성 단체 수, 월별 성장 트렌드 등.

---

## 🟢 Part 4. 결제 품질 및 정책 보완

### 10. 영수증용 데이터 보강
- **Endpoint**: `GET /api/v1/me/donations`
- **요청 사항**: NZ 세금 환급(IRD)을 위해 기부 내역 응답에 단체의 `cc_number`(등록번호) 필드를 반드시 포함해 주세요.

### 11. 최소 기부금액 검증 및 Limit 확장
- **결제 검증**: `POST /api/v1/checkout/donations`에서 `$10` 미만 결제 시도 시 `400 Bad Request` 반환.
- **대량 조회**: 세금 환급 편의를 위해 기부 내역 목록 호출 시 `pageSize=500` 등 대용량 조회를 지원해 주세요.

---

## 🗄️ Database 스키마 참고 (charity_applications)

```sql
CREATE TABLE charity_applications (
  id VARCHAR(32) PRIMARY KEY,
  legal_name VARCHAR(200) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  cc_number VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  bank_account_number VARCHAR(30) NOT NULL,
  ird_number VARCHAR(20) NOT NULL,
  gst_registered ENUM('yes', 'no', 'exempt') NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  status ENUM('pending','approved','rejected','consultation') DEFAULT 'pending',
  admin_note TEXT,
  stripe_account_id VARCHAR(32),
  applied_at TIMESTAMP DEFAULT NOW()
);
```

**DearGiver 프로젝트의 프론트엔드 작업은 모두 성공적으로 완료되었습니다. API가 준비되는 대로 즉각적인 연동 및 서비스 런칭이 가능합니다. 수고 많으셨습니다! 🚀**

---

## 📝 백엔드 팀 답변 및 액션 시트 (Response & Action Sheet)

이 시트는 백엔드 팀이 수행해야 할 **[프론트엔드 전달 사항], [의사 결정 사항], [백엔드 내부 설정]**을 명확히 구분하여 작성되었습니다. 작업 완료 후 이 양식에 답변을 채워 회신해 주시면 됩니다.

### 🎯 1. 프론트엔드로 전달해 주셔야 할 정보 (필수 회신)
백엔드 서버 설정이나 구조 파악 후, 프론트엔드 팀으로 결정된 값을 전달해 주세요.
(현재 단계에서는 2번 항목의 권한 확인 방식 외에 별도로 회신하실 키 값은 없습니다. 향후 추가 키가 필요할 경우 여기에 기재하겠습니다.)
### 🎯 2. 백엔드 시스템 설계 결정 사항 (필수 회신)
프론트엔드의 화면 접근 권한(라우팅 가드)을 어떻게 처리할지 백엔드의 결정이 필요합니다. 선택하신 항목에 `[v]` 표시해 주세요.

- [ ] **관리자/단체 권한(Role) 확인 방식 결정**
  - **프론트엔드가 유저 권한을 식별하는 방법을 선택해 주세요:**
    - `[ ]` **옵션 A (권장): Firebase Custom Claims 방식**
      - *백엔드 적용법*: 권한 부여 시 `admin.auth().setCustomUserClaims(uid, { role: 'platform_admin' })` 실행.
      - *프론트 장점*: 로그인 토큰 파싱만으로 추가 API 호출 없이 권한 확인 가능.
    - `[ ]` **옵션 B: DB `users` 테이블의 `role` 필드 방식**
      - *백엔드 적용법*: `/api/v1/users/me` (내 정보 조회) API 응답에 `"role": "platform_admin"` 추가.
      - *프론트 장점*: 백엔드 DB 구조와 직관적으로 일치함.
    - `[ ]` **옵션 C: 기타 방식 (직접 작성)**: _________________________________

### 🎯 3. 백엔드 서버 내부 설정 사항 (회신 불필요, 자체 적용)
아래 항목은 프론트엔드에 답변하실 필요 없이, **백엔드 서버 환경 변수 및 로직에 자체적으로 적용**해 주시면 되는 항목입니다.

- [ ] **결제 완료/취소 리다이렉트 URL (환경 변수 적용)**
  - **적용 방법**: 백엔드의 Stripe Checkout Session 생성 로직 내 `success_url` 및 `cancel_url`을 개발망(`localhost`)에서 실서버로 고정해 주세요.
  - `CHECKOUT_SUCCESS_URL` = `https://binding-minds.vercel.app/donation/success?session_id={CHECKOUT_SESSION_ID}`
  - `CHECKOUT_CANCEL_URL` = `https://binding-minds.vercel.app/donation/cancel`

- [ ] **결제 최소 금액(NZD $10) 서버단 검증 로직**
  - **적용 방법**: `POST /api/v1/checkout/donations` API 호출 시, 요청된 `amount`가 1000 미만(Stripe는 기본 화폐 단위 센트를 사용하므로 $10 = 1000)일 경우 `400 Bad Request` 에러를 반환해 주세요.

- [ ] **기부 내역 대량 조회 (Limit 확장)**
  - **적용 방법**: 뉴질랜드 연말정산(IRD)을 위해 유저가 1년 치 내역을 한 번에 뽑아야 합니다. `/api/v1/me/donations` 등의 조회 API에서 `pageSize` 파라미터를 최대 `500`까지 허용하도록 로직을 수정해 주세요.

### 🎯 4. API 개발 완료 체크리스트
문서 본문에 명시된 API들의 구현이 완료되면 아래에 체크 표시해 주세요.

**[단체 가입 및 관리자 승인 로직]**
- [ ] `POST /api/v1/charities/apply` (단체 신청 폼 저장)
- [ ] `GET /api/v1/admin/charities` (관리자 - 신청 목록 조회)
- [ ] `PATCH /api/v1/admin/charities/{id}/status` (관리자 - 신청 승인/거절 상태 변경)
  - *핵심 로직*: 상태가 `approved`로 변경될 경우, 백엔드에서 Stripe Connect 온보딩 링크를 생성하여 단체 담당자 이메일로 자동 발송해야 합니다.

**[대시보드 통계 데이터 (Mock -> Real 연동)]**
- [ ] `GET /api/v1/charity/dashboard/analytics` (단체용 차트 데이터)
- [ ] `GET /api/v1/admin/analytics/platform` (플랫폼 관리자용 통계)

**[기부 영수증 데이터 보강]**
- [ ] `GET /api/v1/me/donations` 응답 필드에 단체 등록번호(`cc_number`) 반환 로직 추가 완료

### 💬 5. 기타 피드백 및 논의 사항
프론트엔드 쪽에 데이터 구조 변경을 요청하거나, 명확하지 않아 조율이 필요한 사항이 있다면 아래에 작성해 주세요.
- 

