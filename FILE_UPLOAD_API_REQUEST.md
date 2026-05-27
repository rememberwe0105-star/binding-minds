# File Upload API Specification — Backend Request
> **From**: Frontend Team  
> **To**: Backend Team  
> **Updated**: 2026-05-27  
> **Context**: Charity dashboard now has **complete image & document upload UI** built and locally functional. We need backend endpoints to persist these files.

---

## ✅ Frontend Status — READY TO CONNECT

All upload UI is **fully built, wired, and testable locally**:
- ✅ Multi-image upload (up to 10 per entity) with drag-and-drop, reorder, primary designation
- ✅ Logo upload (avatar variant, circular preview)
- ✅ Banner upload (wide variant, 3:1 preview)
- ✅ Document upload (PDF/DOC, multi-file with file list)
- ✅ Client-side file type & size validation
- ✅ Image preview with remove/replace/set-as-primary actions
- ✅ API functions in `lib/api.ts` ready to call (using `apiFetchMultipart`)
- ✅ Graceful fallback — if endpoints return errors, text profile saves still succeed

**Frontend will automatically connect once the endpoints below return 200.**

---

## 1. Charity Logo Upload

**Use Case**: Charity admin uploads their organisation's logo (displayed on public charity page and search results)

```
POST /api/v1/charities/{charityId}/logo
Content-Type: multipart/form-data

Form Fields:
  file: <binary image data>

Constraints:
  - Accepted types: image/png, image/jpeg, image/webp
  - Max file size: 2MB
  - Recommended: Square, minimum 200×200px

Response (200):
{
  "ok": true,
  "imageUrl": "https://storage.example.com/charities/3/logo.webp",
  "thumbnailUrl": "https://storage.example.com/charities/3/logo_thumb.webp"
}
```

---

## 2. Charity Banner Image Upload

**Use Case**: Charity admin uploads a banner/hero image for their public charity page

```
POST /api/v1/charities/{charityId}/banner
Content-Type: multipart/form-data

Form Fields:
  file: <binary image data>

Constraints:
  - Accepted types: image/png, image/jpeg, image/webp
  - Max file size: 2MB
  - Recommended: 1200×400px (3:1 aspect ratio)

Response (200):
{
  "ok": true,
  "imageUrl": "https://storage.example.com/charities/3/banner.webp"
}
```

---

## 3. Charity Gallery Images (Multi-Image, NEW)

**Use Case**: Charity admin uploads gallery photos showcasing the organisation (up to 10 images, with 1 designated as primary/representative)

**The primary image is shown on the public charity page, search results, and external previews (OG image).**

```
POST /api/v1/charities/{charityId}/images
Content-Type: multipart/form-data

Form Fields:
  images: <binary image data>      ← REPEATABLE, up to 10 files
  primary_index: "0"               ← Index (0-based) of the primary image

Constraints:
  - Accepted types: image/png, image/jpeg, image/webp
  - Max file size per image: 2MB
  - Max images per charity: 10
  - Recommended: 800×600px or larger

Response (200):
{
  "ok": true,
  "images": [
    {
      "url": "https://storage.example.com/charities/3/gallery/img_001.webp",
      "thumbnailUrl": "https://storage.example.com/charities/3/gallery/img_001_thumb.webp",
      "isPrimary": true,
      "order": 0
    },
    {
      "url": "https://storage.example.com/charities/3/gallery/img_002.webp",
      "thumbnailUrl": "https://storage.example.com/charities/3/gallery/img_002_thumb.webp",
      "isPrimary": false,
      "order": 1
    }
  ]
}
```

### Alternative: Update primary image only
```
PATCH /api/v1/charities/{charityId}/images/primary
Content-Type: application/json

{
  "primary_index": 2
}
```

### Delete single gallery image
```
DELETE /api/v1/charities/{charityId}/images/{imageId}

Response (200):
{ "ok": true, "message": "Image deleted successfully" }
```

---

## 4. Project Cover Image Upload (Single)

**Use Case**: Charity admin uploads a cover image for a specific fundraising project/campaign

```
POST /api/v1/charities/{charityId}/projects/{projectId}/image
Content-Type: multipart/form-data

Form Fields:
  file: <binary image data>

Constraints:
  - Accepted types: image/png, image/jpeg, image/webp
  - Max file size: 2MB
  - Recommended: 800×450px (16:9 aspect ratio)

Response (200):
{
  "ok": true,
  "imageUrl": "https://storage.example.com/charities/3/projects/12/cover.webp"
}
```

---

## 5. Project Gallery Images (Multi-Image, NEW)

**Use Case**: Charity admin uploads multiple photos for a project (up to 10, with primary designation)

**The primary image is shown on the project card, search results, and campaign page hero.**

```
POST /api/v1/charities/{charityId}/projects/{projectId}/images
Content-Type: multipart/form-data

Form Fields:
  images: <binary image data>      ← REPEATABLE, up to 10 files
  primary_index: "0"               ← Index (0-based) of the primary image

Constraints:
  - Accepted types: image/png, image/jpeg, image/webp
  - Max file size per image: 2MB
  - Max images per project: 10
  - Recommended: 800×600px or larger

Response (200):
{
  "ok": true,
  "images": [
    {
      "url": "https://storage.example.com/charities/3/projects/12/img_001.webp",
      "thumbnailUrl": "https://storage.example.com/charities/3/projects/12/img_001_thumb.webp",
      "isPrimary": true,
      "order": 0
    }
  ]
}
```

### Delete single project image
```
DELETE /api/v1/charities/{charityId}/projects/{projectId}/images/{imageId}

Response (200):
{ "ok": true, "message": "Image deleted successfully" }
```

---

## 6. Document/Report Upload

**Use Case**: Charity admin uploads annual reports, financial statements, or impact reports (displayed on their public page for donor transparency)

```
POST /api/v1/charities/{charityId}/documents
Content-Type: multipart/form-data

Form Fields:
  file: <binary file data>
  document_type: "annual_report" | "financial_statement" | "impact_report" | "other"
  title: "2025 Annual Impact Report" (optional, defaults to filename)

Constraints:
  - Accepted types: .pdf, .doc, .docx, .xls, .xlsx
  - Max file size: 10MB
  - Max documents per charity: 10

Response (200):
{
  "ok": true,
  "document": {
    "id": 42,
    "title": "2025 Annual Impact Report",
    "document_type": "annual_report",
    "file_url": "https://storage.example.com/charities/3/docs/annual_2025.pdf",
    "file_size": 2456789,
    "uploaded_at": "2026-05-26T12:00:00Z"
  }
}
```

### List Documents
```
GET /api/v1/charities/{charityId}/documents

Response (200):
{
  "items": [
    {
      "id": 42,
      "title": "2025 Annual Impact Report",
      "document_type": "annual_report",
      "file_url": "https://storage...",
      "file_size": 2456789,
      "uploaded_at": "2026-05-26T12:00:00Z"
    }
  ]
}
```

### Delete Document
```
DELETE /api/v1/charities/{charityId}/documents/{documentId}

Response (200):
{
  "ok": true,
  "message": "Document deleted successfully"
}
```

---

## 7. Existing Endpoints — Image URL Fields

The following existing endpoints should return image URLs when available:

### GET /api/v1/charities/{charityId}
```json
{
  "id": 3,
  "display_name": "AC Mission",
  "logo_url": "https://storage.example.com/charities/3/logo.webp",
  "banner_url": "https://storage.example.com/charities/3/banner.webp",
  "images": [
    {
      "url": "https://storage.example.com/charities/3/gallery/img_001.webp",
      "thumbnailUrl": "https://storage.example.com/charities/3/gallery/img_001_thumb.webp",
      "isPrimary": true,
      "order": 0
    }
  ]
}
```

### GET /api/v1/charities/{charityId}/projects
```json
{
  "items": [
    {
      "id": 12,
      "title": "Emergency Housing Fund",
      "cover_image_url": "https://storage.example.com/.../cover.webp",
      "images": [
        {
          "url": "https://storage.example.com/.../img_001.webp",
          "thumbnailUrl": "https://storage.example.com/.../img_001_thumb.webp",
          "isPrimary": true,
          "order": 0
        }
      ]
    }
  ]
}
```

---

## 8. Security Requirements

| Requirement | Detail |
|-------------|--------|
| **Auth** | All upload endpoints require `Authorization: Bearer <id_token>` |
| **Role check** | Only `charity_admin` users who own the charity can upload |
| **Virus scan** | Recommended: scan uploaded files before storing |
| **Rate limit** | Suggested: 10 uploads per minute per user |
| **Storage** | Firebase Storage, S3, or equivalent CDN-backed storage |
| **Image processing** | Recommended: auto-generate thumbnails, convert to WebP, resize to reasonable max |

---

## 9. Frontend Implementation Summary

### Files Modified/Created

| File | Changes |
|------|---------|
| `components/MultiImageUpload.tsx` | **NEW** — Multi-image upload with primary designation, drag reorder, 10-image limit |
| `components/MultiImageUpload.module.css` | **NEW** — Premium CSS with animations, glassmorphism overlays, responsive grid |
| `lib/api.ts` | Added `apiFetchMultipart`, 6 upload functions, `FileUploadResponse`/`MultiImageUploadResponse`/`DocumentUploadResponse` types |
| `app/charity/dashboard/page.tsx` | Wired `MultiImageUpload` in Project Create/Edit, added Gallery to Profile tab, connected all upload API calls with graceful fallback |
| `next.config.ts` | Added `images.remotePatterns` for Firebase Storage, S3, R2, etc. |

### How It Works Now

1. **Project Create**: User drops images → stored in local state → on "Create Project" → project is created first → then images are uploaded to `POST /charities/{id}/projects/{projectId}/images`
2. **Project Edit**: Existing images loaded from backend → user can add/remove/reorder → on "Save" → project metadata saved first → then new images uploaded
3. **Profile Tab**: Logo/Banner saved via single-file endpoints → Gallery via multi-image endpoint → Documents via document endpoint → all in sequence, each with individual try-catch

**All upload calls are wrapped in try-catch so if the backend returns 404/500, the text profile/project still saves successfully.** Errors are logged to console only.

### Frontend API Functions (in `lib/api.ts`)

```typescript
// Single file uploads
uploadCharityLogo(charityId, file)           → POST /charities/{id}/logo
uploadCharityBanner(charityId, file)         → POST /charities/{id}/banner
uploadProjectCoverImage(charityId, pid, file) → POST /charities/{id}/projects/{pid}/image

// Multi-image uploads (with primary designation)
uploadProjectImages(charityId, pid, files[], primaryIndex) → POST /charities/{id}/projects/{pid}/images
uploadCharityImages(charityId, files[], primaryIndex)       → POST /charities/{id}/images

// Document upload
uploadCharityDocument(charityId, file, type, title?)       → POST /charities/{id}/documents
```

**Frontend will connect automatically once endpoints return 200.**
