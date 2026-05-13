# Binding Minds — 프로젝트 현황 문서
> **마지막 업데이트: 2026-05-12 17:35 KST**
> **라이브 URL: [https://binding-minds.vercel.app](https://binding-minds.vercel.app)**
> **GitHub: [rememberwe0105-star/binding-minds](https://github.com/rememberwe0105-star/binding-minds)**

---

## 1. 프로젝트 개요

**Binding Minds**는 뉴질랜드 기반의 기부 플랫폼입니다. 사용자가 검증된 자선 단체(Organizations)와 개별 캠페인(Projects)에 기부할 수 있으며, 기부금에 대해 NZ 33.33% 세금 크레딧을 안내합니다.

### 핵심 기능
| 기능 | 상태 | 설명 |
|------|------|------|
| 홈페이지 | ✅ 완료 | Hero, Impact Counter, Featured, How it Works, Tax Teaser 등 |
| 캠페인 목록 | ✅ 완료 | 10개 프로젝트 + 10개 기관 혼합 그리드 |
| 기관(Organizations) | ✅ 완료 | 실제 NZ 10대 자선단체 데이터 |
| 캠페인 상세 | ✅ 완료 | `/campaigns/[slug]` 마크다운 렌더링 |
| 기관 상세 | ✅ 완료 | `/campaigns/org/[slug]` Hero + 통계 + 관련 프로젝트 |
| 기부 결제 | ✅ 완료 | Stripe 4단계 위자드 (금액→정보→결제→완료) |
| 인증 | ✅ 완료 | Firebase Auth (이메일/비밀번호 + 데모 로그인) |
| 찜하기 | ✅ 완료 | localStorage 기반 (Firestore 마이그레이션 준비됨) |
| 블로그 | ✅ 완료 | 3개 기사 + 상세 페이지 |
| About / Support | ✅ 완료 | 정적 페이지 |
| 법적 페이지 | ✅ 완료 | Privacy, Terms, Cookies |
| 대시보드 | 🟡 빈 상태 | 로그인 후 접근 가능, 콘텐츠 미구현 |
| Settings | 🟡 빈 상태 | 페이지 존재, 기능 미구현 |

---

## 2. 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| **프레임워크** | Next.js | 16.2.6 |
| **UI 라이브러리** | Mantine | 9.1.1 |
| **언어** | TypeScript + React | 19.2.4 |
| **아이콘** | Tabler Icons React | 3.44.0 |
| **인증** | Firebase Auth | 12.13.0 |
| **결제** | Stripe | 22.1.1 |
| **배포** | Vercel | 자동 배포 (main push) |
| **CSS** | CSS Modules | - |

---

## 3. 프로젝트 구조

```
binding-minds/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (MantineProvider + AuthProvider + FavoritesProvider)
│   ├── page.tsx                  # 홈페이지 (/)
│   ├── globals.css               # 글로벌 CSS 변수 & 스타일
│   ├── about/                    # /about
│   ├── auth/                     # /auth (로그인/회원가입)
│   ├── blog/                     # /blog, /blog/[slug]
│   ├── campaigns/
│   │   ├── page.tsx              # /campaigns (혼합 그리드: Projects + Orgs)
│   │   ├── [slug]/page.tsx       # /campaigns/[slug] (캠페인 상세)
│   │   └── org/[slug]/page.tsx   # /campaigns/org/[slug] (기관 상세) ← NEW
│   ├── dashboard/                # /dashboard (빈 상태)
│   ├── settings/                 # /settings (빈 상태)
│   ├── support/                  # /support
│   ├── legal/                    # /legal/privacy, /legal/terms, /legal/cookies
│   └── api/
│       └── create-payment-intent/route.ts  # Stripe PaymentIntent API
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx                # 네비게이션 헤더
│   ├── Footer.tsx                # 푸터
│   ├── Hero.tsx                  # 홈 히어로 섹션
│   ├── CampaignCard.tsx          # 프로젝트 카드 (♡ 포함)
│   ├── OrganizationCard.tsx      # 기관 카드 (♡ 포함) ← NEW
│   ├── CampaignFilters.tsx       # 사이드바 필터 (Type + Favorites + Category + Region + Sort)
│   ├── FavoriteButton.tsx        # 찜하기 하트 버튼 ← NEW
│   ├── DonationCheckoutModal.tsx # Stripe 4단계 결제 위자드
│   ├── FeaturedCharities.tsx     # 홈 추천 자선단체
│   ├── Features.tsx              # 홈 기능 소개
│   ├── HowItWorks.tsx            # 홈 이용 방법
│   ├── ImpactCounter.tsx         # 홈 실시간 카운터
│   ├── ImpactStories.tsx         # 홈 임팩트 스토리
│   ├── LiveToast.tsx             # 실시간 기부 알림
│   ├── TaxTeaser.tsx             # 세금 크레딧 안내
│   ├── TrendingNow.tsx           # 트렌딩 캠페인
│   └── ProtectedRoute.tsx        # 로그인 보호 라우트
│
├── contexts/                     # React Context
│   ├── AuthContext.tsx            # Firebase 인증 상태 관리
│   └── FavoritesContext.tsx       # 찜하기 상태 관리 (localStorage) ← NEW
│
├── data/                         # 목업 데이터 모듈 (추후 Firestore 전환)
│   ├── campaigns.ts              # 10개 캠페인 데이터 + 필터/정렬 유틸
│   ├── organizations.ts          # 10개 NZ 기관 데이터 + 유틸 ← NEW
│   ├── donations.ts              # 기부 내역 목업
│   └── blog.ts                   # 블로그 기사 데이터
│
├── lib/
│   ├── firebase.ts               # Firebase 초기화 (런타임)
│   └── stripe.ts                 # Stripe loadStripe 싱글턴
│
├── hooks/
│   └── useCountUp.ts             # 숫자 카운트업 애니메이션 훅
│
├── theme.ts                      # Mantine 테마 커스터마이징
└── .env.local                    # 환경 변수 (Firebase + Stripe)
```

---

## 4. 환경 변수

> **⚠️ `.env.local`은 gitignore 됨. Vercel Production에도 동일하게 등록 필수.**

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

템플릿 파일: `.env.local.example`

---

## 5. 테스트 계정

| 구분 | 값 |
|------|-----|
| 이메일 | `testuser@bindingminds.co.nz` |
| 비밀번호 | `Test1234!` |
| Stripe 테스트 카드 | `4242 4242 4242 4242` (만료: 아무 미래 날짜, CVC: 아무 3자리) |

---

## 6. 등록된 NZ 기관 (10개)

| # | 기관명 | CC번호 | 카테고리 | 설립 | 활성 프로젝트 |
|---|--------|--------|----------|------|--------------|
| 1 | Forest & Bird NZ | CC26943 | Environment | 1923 | 2 |
| 2 | SPCA New Zealand | CC56833 | Animal Welfare | 1882 | 0 |
| 3 | The Salvation Army NZ | CC37322 | Community | 1883 | 1 |
| 4 | World Vision NZ | CC25984 | Community | 1973 | 0 |
| 5 | New Zealand Red Cross | CC21697 | Health | 1915 | 0 |
| 6 | Starship Foundation | CC24272 | Health | 1991 | 0 |
| 7 | KidsCan Charitable Trust | CC10386 | Education | 2005 | 0 |
| 8 | Greenpeace Aotearoa | CC58459 | Environment | 1974 | 0 |
| 9 | Habitat for Humanity NZ | CC28026 | Community | 1993 | 0 |
| 10 | Whānau Āwhina Plunket | CC54853 | Health | 1907 | 0 |

---

## 7. 라우트 맵 (18개)

| 라우트 | 타입 | 설명 |
|--------|------|------|
| `/` | Static | 홈페이지 |
| `/about` | Static | 소개 페이지 |
| `/auth` | Static | 로그인/회원가입 |
| `/blog` | Static | 블로그 목록 |
| `/blog/[slug]` | Dynamic | 블로그 상세 |
| `/campaigns` | Static | 캠페인+기관 혼합 목록 |
| `/campaigns/[slug]` | Dynamic | 캠페인 상세 |
| `/campaigns/org/[slug]` | Dynamic | 기관 상세 ← NEW |
| `/dashboard` | Static | 대시보드 (빈 상태) |
| `/settings` | Static | 설정 (빈 상태) |
| `/support` | Static | 고객지원 |
| `/legal/privacy` | Static | 개인정보처리방침 |
| `/legal/terms` | Static | 이용약관 |
| `/legal/cookies` | Static | 쿠키 정책 |
| `/api/create-payment-intent` | API | Stripe PaymentIntent 생성 |
| `/_not-found` | Static | 404 커스텀 페이지 |

---

## 8. Git 커밋 히스토리

```
038a5cc feat: add favorites/bookmark system with localStorage
9d891db feat: add Organizations with mixed grid and type filter
441e468 fix: lazy-init Stripe server to prevent build-time crash without env vars
a7511ce feat: v2 upgrade — Stripe checkout, new sections, blog content, 404, settings
978f4f3 feat: Complete Binding Minds platform
c4020b4 Initial commit from Create Next App
```

---

## 9. 아키텍처 결정 기록 (ADR)

### ADR-1: 기관 + 프로젝트 혼합 그리드
- **결정**: `/campaigns` 페이지에서 Projects와 Organizations를 별도 탭이 아닌 **혼합 그리드**로 자연스럽게 노출
- **이유**: 사용자가 탐색 중에 "기관이라는 선택지가 있구나"를 자연스럽게 발견하도록
- **구현**: `interleaveItems()` 함수로 Project 3개당 Org 1개 비율로 삽입
- **필터**: 사이드바 Type 필터 (All/Projects/Orgs)로 특정 타입만 볼 수 있음

### ADR-2: 찜하기는 localStorage → Firestore 마이그레이션
- **결정**: Phase 1은 localStorage, Phase 2에서 Firestore로 이관
- **이유**: 현재 Firestore 미연동 상태이므로 즉시 작동하는 방식 우선
- **구현**: `FavoritesContext`에서 `loadFromStorage()` / `saveToStorage()` 두 함수만 교체하면 됨
- **마이그레이션 시**: 로그인 상태면 Firestore, 비로그인이면 localStorage fallback

### ADR-3: Stripe 런타임 초기화
- **결정**: Stripe SDK를 빌드 타임이 아닌 런타임에서 초기화
- **이유**: Vercel 빌드 시 환경 변수가 없으면 빌드 실패하는 문제 방지
- **구현**: `lib/stripe.ts` (클라이언트), `api/create-payment-intent/route.ts` (서버) 모두 lazy-init 패턴 사용

---

## 10. 디자인 시스템

### CSS 변수 (`globals.css`)
```css
--bm-sage: #8f9779;           /* 메인 그린 */
--bm-sage-dark: #6b7359;
--bm-terracotta: #e2725b;     /* 액센트 오렌지/레드 */
--bm-text-dark: #2d2a26;
--bm-text-muted: #6e6a62;
--bm-bg-warm: #faf8f5;        /* 따뜻한 배경 */
```

### Mantine 테마 (`theme.ts`)
- 커스텀 컬러: `sage`, `terracotta`
- 기본 폰트: Inter (Google Fonts)
- 기본 radius: `md`

---

## 11. 다음 단계 (TODO)

### 우선순위 높음 🔴
| # | 작업 | 설명 |
|---|------|------|
| 1 | **Firestore 연동** | 현재 `data/*.ts` 목업 → Firestore 컬렉션으로 전환 |
| 2 | **찜하기 Firestore 마이그레이션** | `FavoritesContext`의 storage 함수를 Firestore로 교체 |
| 3 | **Dashboard 구현** | 기부 내역, 찜 목록, 세금 크레딧 계산기 |

### 우선순위 중간 🟡
| # | 작업 | 설명 |
|---|------|------|
| 4 | 기관 상세에서 "기관 직접 기부" 흐름 개선 | 목표 금액 없는 상시 기부 UI 최적화 |
| 5 | 기관-캠페인 연결 강화 | 캠페인 상세에서 주관 기관 프로필 링크 |
| 6 | Settings 페이지 구현 | 프로필 편집, 알림 설정 |
| 7 | 검색 기능 강화 | 키워드 하이라이팅, 자동완성 |

### 우선순위 낮음 🟢
| # | 작업 | 설명 |
|---|------|------|
| 8 | 다국어 지원 (영어/한국어/마오리어) | i18n 적용 |
| 9 | PWA 지원 | 오프라인 접근, 푸시 알림 |
| 10 | 관리자 패널 | 캠페인/기관 CRUD |
| 11 | 데모 버튼 삭제 | `DonationCheckoutModal.tsx` 내 테스트용 버튼 제거 |

---

## 12. 참고 명령어

```bash
# 로컬 개발 서버
npm run dev                # http://localhost:3000

# 빌드 테스트
npm run build

# Vercel 수동 배포
vercel --yes --prod

# Git 상태 확인
git log --oneline -5
```

---

> **이 문서는 다음 세션 시작 시 프로젝트 현재 상태를 즉시 파악하기 위한 핸드오프 문서입니다.**
> **코드를 수정할 때마다 이 문서도 함께 업데이트해주세요.**
