# DearGiver — Blog Management API 요청서

> 작성일: 2026-06-03
> 대상: 백엔드 팀
> 관련 페이지: /admin/blog (관리자 블로그 관리), /blog (공개 블로그)

프론트엔드에서 관리자 블로그 에디터를 구현 중입니다.
아래 API가 필요합니다.

---

## 요청 요약

| 순위 | 기능 | 난이도 |
|:----:|------|:------:|
| P0 | 이미지 업로드 API | 중간 |
| P0 | 블로그 CRUD API | 중간 |
| P1 | 블로그 공개 조회 API | 낮음 |

---

## [P0] 이미지 업로드 API

현재 플랫폼에 파일 업로드 API가 없습니다.
블로그 대표사진, 본문 내 이미지 삽입을 위해 범용 이미지 업로드 엔드포인트가 필요합니다.

### 엔드포인트

POST /api/v1/upload/image

### 요청

Content-Type: multipart/form-data

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| file | File | O | 이미지 파일 (JPEG, PNG, WebP) |
| category | string | X | 용도 구분 (blog, charity, project) |

```
curl -X POST /api/v1/upload/image \
  -H "Authorization: Bearer {token}" \
  -F "file=@photo.jpg" \
  -F "category=blog"
```

### 응답 (201 Created)

```json
{
  "url": "https://storage.deargiver.nz/uploads/blog/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 245000,
  "width": 1200,
  "height": 630,
  "content_type": "image/jpeg"
}
```

### 제약 사항

| 항목 | 값 |
|------|-----|
| 최대 파일 크기 | 5MB |
| 허용 형식 | JPEG, PNG, WebP |
| 권장 크기 (블로그 대표) | 1200 x 630px |
| 인증 | Firebase ID Token (관리자) |

### 저장소 옵션

- 옵션 A (권장): Firebase Storage (firebase.storage.bucket)
- 옵션 B: 로컬 서버 디스크 (/uploads/ 디렉토리)
- 옵션 C: AWS S3 / Cloudflare R2

어떤 방식이든 업로드 후 공개 접근 가능한 URL을 반환해 주세요.

---

## [P0] 블로그 CRUD API (관리자용)

### 1. 글 목록 조회

GET /api/v1/admin/blog

인증: Firebase ID Token (관리자)

Query Parameters:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | all | draft / published / all |
| page | number | 1 | 페이지 번호 |
| page_size | number | 20 | 페이지 크기 |

응답 (200 OK):

```json
{
  "total": 5,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": "blog-001",
      "slug": "how-your-donations-helped-plant-12000-trees",
      "title": "How Your Donations Helped Plant 12,000 Trees",
      "excerpt": "In just six months...",
      "category": "Impact Stories",
      "author": "Sarah Mitchell",
      "author_role": "Impact Manager",
      "image": "https://storage.deargiver.nz/uploads/blog/abc.jpg",
      "status": "published",
      "featured": true,
      "charity_id": 42,
      "charity_name": "Trees That Count",
      "created_at": "2026-05-08T00:00:00Z",
      "updated_at": "2026-05-10T00:00:00Z"
    }
  ]
}
```

### 2. 글 작성

POST /api/v1/admin/blog

인증: Firebase ID Token (관리자)

요청 Body:

```json
{
  "title": "How Your Donations Helped Plant 12,000 Trees",
  "slug": "how-your-donations-helped-plant-12000-trees",
  "excerpt": "In just six months, the campaign has exceeded expectations...",
  "category": "Impact Stories",
  "author": "Sarah Mitchell",
  "author_role": "Impact Manager",
  "content": "# Markdown content here\n\n본문 내용...",
  "image": "https://storage.deargiver.nz/uploads/blog/abc.jpg",
  "status": "draft",
  "featured": false,
  "charity_id": 42,
  "read_time": "5 min read"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| title | string | O | 글 제목 (max 200자) |
| slug | string | O | URL 슬러그 (자동 생성 가능) |
| excerpt | string | O | 요약 (max 300자) |
| category | string | O | Impact Stories / Tax Tips / Community / Platform Updates |
| author | string | O | 작성자 이름 |
| author_role | string | X | 작성자 역할 |
| content | string | O | Markdown 본문 |
| image | string | O | 대표사진 URL (upload API로 먼저 업로드) |
| status | string | O | draft / published |
| featured | boolean | X | 홈페이지 노출 여부 (기본: false) |
| charity_id | number | X | 연관 단체 ID |
| read_time | string | X | 읽기 시간 (ex: "5 min read") |

응답 (201 Created):

```json
{
  "id": "blog-004",
  "slug": "how-your-donations-helped-plant-12000-trees",
  "status": "draft",
  "created_at": "2026-06-03T00:00:00Z"
}
```

### 3. 글 수정

PATCH /api/v1/admin/blog/:id

인증: Firebase ID Token (관리자)

요청 Body: POST와 동일 (변경할 필드만 전송)

```json
{
  "status": "published",
  "featured": true
}
```

응답 (200 OK):

```json
{
  "id": "blog-004",
  "slug": "how-your-donations-helped-plant-12000-trees",
  "status": "published",
  "updated_at": "2026-06-03T01:00:00Z"
}
```

### 4. 글 삭제

DELETE /api/v1/admin/blog/:id

인증: Firebase ID Token (관리자)

응답 (200 OK):

```json
{
  "deleted": true,
  "id": "blog-004"
}
```

---

## [P1] 블로그 공개 조회 API

관리자가 아닌 일반 사용자가 공개된 블로그 글을 조회하는 API입니다.

### 1. 공개 글 목록

GET /api/v1/blog

인증: 불필요 (공개)

Query Parameters:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| category | string | all | 카테고리 필터 |
| featured | boolean | -- | true면 featured 글만 |
| page | number | 1 | 페이지 번호 |
| page_size | number | 10 | 페이지 크기 |

* status=published인 글만 반환 (draft 제외)

### 2. 공개 글 상세

GET /api/v1/blog/:slug

인증: 불필요 (공개)

응답: 단일 BlogPost 객체 (content 포함)

---

## DB 스키마

```sql
CREATE TABLE blog_posts (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  title       VARCHAR(200) NOT NULL,
  excerpt     TEXT NOT NULL,
  category    VARCHAR(50) NOT NULL,
  author      VARCHAR(100) NOT NULL,
  author_role VARCHAR(100),
  content     TEXT NOT NULL,
  image       VARCHAR(500) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'draft',
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  charity_id  INTEGER REFERENCES charities(id),
  read_time   VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_featured ON blog_posts(featured) WHERE featured = TRUE;
```

```sql
CREATE TABLE uploaded_files (
  id          SERIAL PRIMARY KEY,
  filename    VARCHAR(255) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  size        INTEGER NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  category    VARCHAR(50),
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 전체 API 매핑

| Method | Endpoint | 용도 | 인증 | 우선순위 |
|--------|----------|------|:----:|:--------:|
| POST | /api/v1/upload/image | 이미지 업로드 | 관리자 | P0 |
| GET | /api/v1/admin/blog | 관리자 글 목록 | 관리자 | P0 |
| POST | /api/v1/admin/blog | 글 작성 | 관리자 | P0 |
| PATCH | /api/v1/admin/blog/:id | 글 수정 | 관리자 | P0 |
| DELETE | /api/v1/admin/blog/:id | 글 삭제 | 관리자 | P0 |
| GET | /api/v1/blog | 공개 글 목록 | 없음 | P1 |
| GET | /api/v1/blog/:slug | 공개 글 상세 | 없음 | P1 |

---

## 백엔드 팀 응답 체크리스트

- [ ] 이미지 저장소 방식 결정 (Firebase Storage / 로컬 / S3)
- [ ] POST /api/v1/upload/image
- [ ] GET /api/v1/admin/blog
- [ ] POST /api/v1/admin/blog
- [ ] PATCH /api/v1/admin/blog/:id
- [ ] DELETE /api/v1/admin/blog/:id
- [ ] GET /api/v1/blog
- [ ] GET /api/v1/blog/:slug
- [ ] blog_posts 테이블 생성
- [ ] uploaded_files 테이블 생성

---

문서 끝. 질문이 있으면 프론트엔드 팀에 연락해주세요.
