# 🤝 Binding Minds — Frontend Handoff Document

> **작성자**: 프론트엔드 디자이너  
> **작성일**: 2026-05-12  
> **목적**: 백엔드 개발자에게 프로젝트를 이관하기 위한 기술 문서

---

## 1. 프로젝트 개요

**Binding Minds**는 뉴질랜드(Aotearoa) 기반의 기부 중개 플랫폼입니다.  
기부자와 검증된 자선단체를 연결하고, NZ IRD 기준 33.33% 세액공제 영수증을 자동 관리합니다.

- **타겟 시장**: 뉴질랜드 · 호주
- **수익 모델**: Stripe Connect 기반 (자금 미보유 구조)
- **현재 상태**: 프론트엔드 UI 완성 (v2 업그레이드 포함), 백엔드 미구현

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | Mantine | 9.1.1 |
| Icons | Tabler Icons React | 3.44.0 |
| Language | TypeScript | 5.x |
| Auth (임시) | Firebase Auth | 12.13.0 |
| Styling | CSS Modules + Mantine | - |
| Font | Inter (Google Fonts) | - |

---

## 3. 프로젝트 구조

```
binding-minds/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                  # 랜딩 페이지 (홈)
│   ├── layout.tsx                # 루트 레이아웃 (MantineProvider, AuthProvider)
│   ├── globals.css               # 글로벌 CSS 변수 + 애니메이션
│   ├── not-found.tsx             # ✨ 커스텀 404 페이지
│   │
│   ├── about/page.tsx            # About Us (정적)
│   ├── auth/page.tsx             # 로그인/회원가입
│   ├── blog/
│   │   ├── page.tsx              # ✨ 블로그 (실제 기사 3개)
│   │   └── [slug]/page.tsx       # ✨ 블로그 상세 페이지
│   ├── campaigns/
│   │   ├── page.tsx              # 캠페인 리스트 (필터/검색)
│   │   └── [slug]/page.tsx       # 캠페인 상세 + 기부 모달
│   ├── dashboard/page.tsx        # 대시보드 (4탭: Overview/History/Tax/Vault)
│   ├── settings/page.tsx         # ✨ 프로필/설정 (3탭: Profile/Notifications/Security)
│   ├── legal/
│   │   ├── privacy/page.tsx      # 개인정보 처리방침
│   │   ├── terms/page.tsx        # 이용약관
│   │   └── cookies/page.tsx      # 쿠키 정책
│   └── support/page.tsx          # FAQ + Contact (아코디언)
│
├── components/                   # 재사용 컴포넌트
│   ├── Header.tsx                # 네비게이션 헤더 (인증 상태 반영 + Settings 메뉴)
│   ├── Footer.tsx                # 사이트 푸터
│   ├── Hero.tsx                  # 랜딩 히어로 섹션
│   ├── FeaturedCharities.tsx     # 추천 캠페인 그리드
│   ├── TrendingNow.tsx           # Trending 캠페인 캐러셀
│   ├── HowItWorks.tsx            # ✨ How It Works 4단계 가이드
│   ├── ImpactCounter.tsx         # ✨ 애니메이션 임팩트 카운터
│   ├── Features.tsx              # 플랫폼 특징 3열 카드
│   ├── TaxTeaser.tsx             # 세금 환급 CTA 섹션
│   ├── ImpactStories.tsx         # 임팩트 스토리 카드
│   ├── LiveToast.tsx             # 실시간 기부 알림 토스트
│   ├── CampaignCard.tsx          # 캠페인 카드 컴포넌트
│   ├── CampaignFilters.tsx       # 캠페인 필터 사이드바
│   ├── DonationCheckoutModal.tsx  # ✨ 3단계 기부 체크아웃 모달
│   └── ProtectedRoute.tsx        # 인증 보호 라우트
│
├── contexts/
│   └── AuthContext.tsx           # Firebase Auth Context
│
├── data/                         # ⚠️ 목업 데이터 (백엔드 교체 필요)
│   ├── campaigns.ts              # 캠페인 10개 + 유틸 함수
│   ├── donations.ts              # 기부 10건 + 영수증 + 유틸
│   └── blog.ts                   # ✨ 블로그 기사 3개 + 유틸
│
├── lib/
│   └── firebase.ts               # Firebase 초기화 (Auth만)
│
├── hooks/                        # (비어있음 - 향후 커스텀 훅)
├── theme.ts                      # Mantine 테마 (Sage/Terracotta 팔레트)
├── .env.local                    # Firebase API 키 (Git 제외)
└── .env.local.example            # 환경변수 템플릿
```

---

## 4. 디자인 시스템

### 색상 팔레트

| 이름 | CSS 변수 | 헥스 | 용도 |
|------|----------|------|------|
| Background Warm | `--bm-bg-warm` | `#FAF9F6` | 전체 페이지 배경 |
| Background Cream | `--bm-bg-cream` | `#F5F0E8` | 카드/섹션 배경 |
| Text Dark | `--bm-text-dark` | `#3D3229` | 제목, 본문 텍스트 |
| Text Muted | `--bm-text-muted` | `#6B5E50` | 부가 텍스트, 설명 |
| Sage Green | `--bm-sage` | `#8F9779` | Primary 색상, 차트 |
| Sage Dark | `--bm-sage-dark` | `#6C7854` | Hover, 강조 |
| Terracotta | `--bm-terracotta` | `#E2725B` | CTA 버튼, 액센트 |
| Terracotta Dark | `--bm-terracotta-dark` | `#C14025` | Hover 상태 |

### 타이포그래피
- **Font**: Inter (Google Fonts)
- **Headings**: weight 700
- **Body**: weight 400
- **Radius**: 기본 `md`, 버튼 `xl`

### 컴포넌트 규칙
- **Primary 버튼**: `color="terracotta" radius="xl"`
- **Secondary 버튼**: `variant="outline" color="dark" radius="xl"`
- **카드**: `radius="lg"` + `shadow: 0 2px 12px rgba(0,0,0,0.06)`
- **아이콘**: Tabler Icons, 기본 size 20-24

---

## 5. 라우트 맵

| 경로 | 페이지 | 인증 필요 | 상태 |
|------|--------|----------|------|
| `/` | 랜딩 페이지 | ❌ | ✅ 완성 (v2: HowItWorks + ImpactCounter 추가) |
| `/campaigns` | 캠페인 리스트 | ❌ | ✅ 완성 |
| `/campaigns/[slug]` | 캠페인 상세 | ❌ | ✅ 완성 (v2: 기부 체크아웃 모달 연동) |
| `/about` | 소개 페이지 | ❌ | ✅ 완성 |
| `/blog` | 블로그 | ❌ | ✅ 완성 (v2: 실제 기사 3개) |
| `/blog/[slug]` | 블로그 상세 | ❌ | ✅ 완성 (v2: 신규) |
| `/support` | FAQ/연락처 | ❌ | ✅ 완성 |
| `/auth` | 로그인/가입 | ❌ | ✅ 완성 |
| `/dashboard` | 대시보드 | ✅ | ✅ 완성 |
| `/settings` | 프로필/설정 | ✅ | ✅ 완성 (v2: 신규) |
| `/legal/privacy` | 개인정보 처리 | ❌ | ✅ 완성 |
| `/legal/terms` | 이용약관 | ❌ | ✅ 완성 |
| `/legal/cookies` | 쿠키 정책 | ❌ | ✅ 완성 |
| `404` | Not Found | ❌ | ✅ 완성 (v2: 신규) |

---

## 6. ⚠️ 백엔드 담당자를 위한 핵심 안내

### 6-1. 목업 데이터 교체 필요

현재 **모든 데이터가 하드코딩**되어 있습니다. 백엔드에서 API를 구현한 후 교체해야 합니다.

| 파일 | 내용 | 교체 방법 |
|------|------|----------|
| `data/campaigns.ts` | 캠페인 10개 (이름, 설명, 모금액 등) | DB에서 가져오는 API로 교체 |
| `data/donations.ts` | 기부 내역 10건 + 영수증 | 유저별 Firestore 쿼리로 교체 |
| `data/blog.ts` | 블로그 기사 3개 | CMS 또는 Firestore로 교체 |

### 6-2. 데이터 인터페이스 (Data Contract)

프론트엔드가 기대하는 데이터 형태입니다. **이 인터페이스를 유지해주세요.**

```typescript
// Campaign (캠페인)
interface Campaign {
  id: string;
  name: string;
  slug: string;
  category: 'Education' | 'Environment' | 'Health' | 'Arts & Culture' | 'Community' | 'Animal Welfare';
  region: 'Auckland' | 'Wellington' | 'Canterbury' | 'Otago' | 'Southland' | 'Bay of Plenty' | 'Nationwide';
  description: string;         // 짧은 설명 (카드용)
  longDescription: string;     // 마크다운 (상세 페이지용)
  image: string;               // 이미지 URL
  raised: number;              // 현재 모금액
  goal: number;                // 목표 금액
  donorCount: number;          // 기부자 수
  daysLeft: number;            // 남은 일수
  organizer: string;           // 운영 단체명
  verified: boolean;           // IRD 검증 여부
  featured: boolean;           // 홈 추천 표시
  trending: boolean;           // Trending 표시
  createdAt: string;           // 생성일 ISO string
}

// Donation (기부 내역)
interface Donation {
  id: string;
  campaignSlug: string;
  campaignName: string;
  charityName: string;
  category: string;
  amount: number;
  date: string;                // ISO date
  status: 'completed' | 'pending' | 'refunded';
  receiptId: string;
}

// Receipt (영수증)
interface Receipt {
  id: string;
  donationId: string;
  campaignName: string;
  charityName: string;
  amount: number;
  date: string;
  irdApproved: boolean;
  downloadUrl: string;         // 영수증 PDF URL
}
```

### 6-3. 인증 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| Firebase Auth | ✅ 연결됨 | 프로젝트: `nz-donation-saas` |
| 이메일/비밀번호 | ✅ 활성화 | |
| Google 로그인 | ✅ 활성화 | |
| Firestore | ❌ 미사용 | 백엔드에서 설계 필요 |
| Security Rules | ❌ 미설정 | 백엔드에서 설정 필요 |
| 테스트 계정 | ✅ 생성됨 | `testuser@bindingminds.co.nz` / `Test1234!` |

### 6-4. DEV 전용 코드 (배포 전 삭제 필요)

아래 코드 블록은 `🧪 DEV ONLY` 주석으로 표시되어 있습니다:

1. **`app/auth/page.tsx`** — Quick Demo Login 버튼 (핸들러 + UI)
2. **`components/ProtectedRoute.tsx`** — Firebase 미설정 시 데모 모드 우회

### 6-5. 백엔드에서 구현해야 할 기능

1. **Firestore 컬렉션 설계** — `users`, `donations`, `campaigns`
2. **Stripe Connect 결제** — 캠페인 상세 페이지의 "Donate" 버튼과 연동
3. **영수증 PDF 생성** — Receipt Vault의 다운로드 버튼과 연동
4. **실시간 모금액 업데이트** — 캠페인 카드의 `raised`, `donorCount` 필드
5. **이미지 호스팅** — 현재 `/public/images`의 정적 이미지를 Firebase Storage 등으로 이관

---

## 7. 환경 설정

### 필수 환경변수 (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 로컬 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 프로덕션 빌드 검증
```

---

## 8. 빌드 상태

```
✅ npm run build — 성공
✅ 16개 라우트 모두 정상 생성 (14 static + 2 dynamic)
✅ TypeScript 에러 없음
✅ 모바일/태블릿/데스크톱 반응형 검증 완료
```

---

## 9. v2 업그레이드 내역 (2026-05-12)

| 기능 | 설명 |
|------|------|
| **기부 체크아웃 모달** | 3단계 위자드 (금액 → 상세정보 → 확인), 월정기/일회성 토글, 세금환급 실시간 계산 |
| **How It Works 섹션** | 랜딩 페이지 4단계 가이드 (Discover → Donate → Track → Claim) |
| **Impact Counter** | 다크테마 애니메이션 숫자 카운터 (기부 수, 기부자 수, 총 모금액, 단체 수) |
| **블로그 콘텐츠** | Coming Soon → 실제 기사 3개 + 상세 페이지 + 뉴스레터 CTA |
| **블로그 상세** | `/blog/[slug]` 동적 라우트, 히어로 이미지, 저자 정보, Prev/Next 네비게이션 |
| **404 페이지** | 브랜드 디자인, 떠다니는 나뭇잎 아이콘, 그라디언트 에러코드, CTA 버튼 |
| **설정 페이지** | Profile/Notifications/Security 3탭, 이메일 알림 토글, 계정 관리 |
| **Header 업그레이드** | 유저 메뉴에 Settings 링크 추가 |
