# Dear Giver — Backend 추가 요청서 (v8.4) — P2P Supporter Fundraisers

- **작성일**: 2026-08-11
- **선행 문서**: v8.0 · v8.1 · v8.3 (모두 유효, 변경 없음) — 본 문서는 순수 추가
- **우선순위**: Growth 플랜 기능 — v8.3 A(Xero)와 같은 묶음으로 Growth 출시 일정에 맞추면 됨
- 전달용 PDF: `BACKEND_API_REQUEST_V8_4.pdf` (인수인계 표지 `BACKEND_HANDOVER.pdf`도 갱신됨)

---

## 개요

기부자가 기관 또는 특정 프로젝트를 위해 **개인 모금 페이지(fundraiser)**를 만들어
친구·가족·whānau·커뮤니티에 공유하는 P2P 기능. **Growth(유료) 플랜 기관 전용**.
프론트 데모(생성 모달·기관/프로젝트 페이지 섹션·대시보드 관리 탭)는 배포 완료,
게이트 패턴으로 배선되어 엔드포인트가 열리면 자동 실연동 전환된다.

### 정책 (확정)
- **Public fundraiser**: 생성 시 `pending` → **기관 승인 후** 기관/프로젝트 공개 페이지에 게시.
  부적절한 내용/사진은 기관이 Decline (기관에게 최소한의 컨트롤)
- **Private fundraiser**: 링크로만 공유, 공개 페이지 미노출, **승인 없이 즉시 생성**
- 기관 관리자는 대시보드 "Supporter Fundraisers" 탭에서 전체 목록 조회/필터/승인/거절

## 요청 API

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/fundraisers` | 기부자가 펀드레이저 생성 (로그인 필요) |
| GET | `/api/v1/charities/{slug}/fundraisers` | 공개 목록 — `approved` + `public`만 (프로젝트 필터: `?campaign={slug}`) |
| GET | `/api/v1/me/charity/fundraisers` | 기관 관리자 — 전체 목록 (상태/레벨 무관) |
| PATCH | `/api/v1/me/charity/fundraisers/{id}` | 기관 관리자 — `{ "status": "approved" \| "declined" }` |

### 생성 요청 body (프론트가 이미 전송하는 형태)

```json
POST /api/v1/fundraisers
{
  "charitySlug": "forest-and-bird-nz",
  "campaignSlug": "restore-native-forest",   // project-level일 때만
  "level": "project",                         // "organisation" | "project"
  "title": "Hana's 40th Birthday — trees instead of gifts",
  "goalAmount": 1000,
  "message": "Instead of presents this year…",
  "visibility": "public"                      // "public" | "private"
}
응답: { "id": "fr_xxx", "shareUrl": "https://…/f/{id}" }
```

### 백엔드 작업 체크리스트
1. fundraisers 테이블: owner(user), charity, campaign?, level, title, goal_minor,
   message, visibility, status(`pending`/`approved`/`declined`), share_slug, 생성/승인 시각
2. 생성 로직: `private` → 즉시 `approved`(비공개) / `public` → `pending` + 기관에 알림(이메일 권장)
3. 개인 모금 페이지 라우팅용 `share_slug` 발급 (프론트가 `/f/{slug}` 페이지 추후 구현)
4. 펀드레이저 경유 기부 연결: checkout 요청에 `fundraiserId`가 추가되면 해당 펀드레이저의
   raised/supporters 집계 (다음 단계 — 스키마만 염두)
5. Growth 게이팅: 대상 기관이 `plan=paid`가 아니면 생성 403 + 안내

## 게이트 지점 추가 (기존 9곳 → 12곳)

| 화면/버튼 | 엔드포인트 |
|---|---|
| 기관/프로젝트 페이지 → Start a fundraiser → Create | `POST /api/v1/fundraisers` |
| Growth 대시보드 Supporter Fundraisers 탭 로드 | `GET /api/v1/me/charity/fundraisers` |
| 〃 Approve / Decline 버튼 | `PATCH /api/v1/me/charity/fundraisers/{id}` |

## 프론트 상태 (참고)
- 생성 모달(level/visibility 선택, 유효성 검증), 기관·프로젝트 페이지 섹션(승인된 public 표시,
  현재 샘플 데이터), 대시보드 관리 탭(요약 통계·필터·승인/거절) 배포 완료
- 공개 목록 GET(`/charities/{slug}/fundraisers`)은 응답이 오는 대로 섹션 데이터를 교체 예정
