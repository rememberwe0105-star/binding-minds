# 백엔드 요청 — 테스트 계정 · Stripe 온보딩 · 데이터 정리 (2026-09-01)

프론트엔드는 최근 FRONTEND_TODO(FE-001/002/008/010/011/012) 반영분을 라이브 배포 완료했고,
공개 화면(기관/프로젝트 목록·상세, 문구·디자인)은 실데이터로 정상 동작함을 확인했습니다.
남은 항목들은 **실제 계정 로그인과 결제 흐름**이 있어야 최종 검증되며, 아래 3가지를 요청드립니다.

라이브 확인 기준: `GET http://libertron.iptime.org:8787/api/v1/...` (기관 91 / 프로젝트 10)

---

## 1. (P0) 테스트 계정 4종

역할 값은 프론트가 기대하는 `role` 기준입니다: `donor` / `charity_admin` / `platform_admin`.

| # | 구분 | role | plan | 필요 정보 | 용도 |
|---|------|------|------|-----------|------|
| 1 | 일반 기부자 | `donor` | — | 이메일 + 비밀번호 | 회원가입/기부자 대시보드/영수증 흐름 |
| 2 | 기관 — 무료 | `charity_admin` | `free` | 이메일 + 비밀번호 + 연결된 기관 slug | 무료 플랜에서 유료 기능이 잠겨 보이는지 확인 |
| 3 | 기관 — 유료 | `charity_admin` | 유료 티어(아래 주석) | 이메일 + 비밀번호 + 기관 slug + 적용 plan 값 | 유료 전용 기능(P2P Supporter Fundraisers) 활성 확인 |
| 4 | 플랫폼 관리자 | `platform_admin` | — | 이메일 + 비밀번호 | `/admin` (기관 승인·기부 모니터링·재무) 검증 |

> **유료 플랜 명칭 확인 요청:** 라이브 데이터에는 `plan` 값으로 `free`(90건)와 `founder_pilot`(1건)만
> 존재합니다. 반면 프론트 카피에는 유료 기능이 "**Growth**"로 표기되어 있습니다.
> 3번 계정에 적용할 **정식 유료 플랜 값**(`founder_pilot` / `growth` 등)을 알려주시면 프론트 게이팅을 거기에 맞추겠습니다.

> 참고: 문서(PROJECT_STATUS/HANDOFF)에 있던 `testuser@bindingminds.co.nz` / `Test1234!` 계정이
> 아직 유효하고 role이 `donor`라면 **1번은 그 계정으로 갈음** 가능합니다. 유효 여부만 확인 부탁드립니다.

---

## 2. (P0) Stripe Connect 온보딩 — 최소 1개(가급적 2개) 기관

**현상:** 91개 기관 전원 `stripe_account_id = null`.
프론트는 규격(FE-008)대로 하드코딩 폴백 계정을 제거했기 때문에, 현재 **모든 기부 버튼이 비활성**
("Donations opening soon")입니다. 이는 의도된 동작이며, 온보딩만 되면 프론트 수정 없이 자동 활성화됩니다.

**요청:**
- 위 2번(무료)·3번(유료) 기관에 **Stripe Connect 온보딩 완료** (테스트 모드, `acct_...` 채워주기)
- 온보딩 후 기대 동작: 해당 기관/프로젝트의 기부 버튼 활성화 → checkout → `succeeded`/`pending` 상태가
  기부자·기관 대시보드에 배지로 표시(FE-012)

이 항목이 완료되어야 **FE-008(기부)·FE-012(상태 배지)** 를 실제로 검증할 수 있습니다. (현재 최대 병목)

---

## 3. (P1) 기관 소개문구(description) 임시 데이터 교체

**현상:** 프로젝트를 보유한 아래 8개 기관의 `description`이 한국어 임시문구로 저장되어 있습니다.

```
"<기관명> — 프론트엔드 목업의 프로젝트 주최 단체."
```

이 값이 공개 기관 카드/상세 페이지에 그대로 노출됩니다(화면은 정상, 데이터만 임시값).

| id | 기관명 | slug |
|----|--------|------|
| 93 | Creative Canterbury | creative-canterbury |
| 92 | Age Concern Wellington | age-concern-wellington |
| 91 | Kai Auckland | kai-auckland |
| 90 | Auckland Youth Music Trust | auckland-youth-music-trust |
| 89 | Southland Water Trust | southland-water-trust |
| 88 | Wellington Arts Collective | wellington-arts-collective |
| 87 | Otago Conservation Network | otago-conservation-network |
| 86 | Kiwi Education Trust | kiwi-education-trust |

**요청:** 위 8개 기관의 `description`을 실제 영문 소개문구로 교체 부탁드립니다.
(프로젝트 10건의 `description`은 영문으로 정상이라 별도 조치 불필요.)

---

## 참고 — 프론트엔드 측 완료/확인 사항 (요청 아님)

- 공개 기관/프로젝트 목록·상세는 실API 연동 완료, 실제 slug로 라우팅 정상.
- claimed 기관이 "Unclaimed"로 잘못 표시되던 카드/상세 배지 버그는 프론트에서 수정·배포 완료
  (claimed → "Managed by the organisation").
- 설립연도 미제공 시 "Est. 0" 노출되던 표기도 프론트에서 숨김 처리 완료.

**우선순위 요약:** 1·2번(테스트 계정 + Stripe)이 최우선입니다. 이 둘이 준비되면 남은 프론트 항목
(등록→업로드→기부→상태표시) 전 구간을 바로 검증하겠습니다.
