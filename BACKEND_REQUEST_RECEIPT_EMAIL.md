# 🔧 백엔드 요청서: 자동 영수증 저장 + 감사 이메일 발송

> **작성일**: 2026-06-02  
> **작성**: 프론트엔드 팀 (민지)  
> **대상**: 백엔드 개발자 (오빠)  
> **우선순위**: 높음 — DearGiver 핵심 차별화 기능

---

## 📋 요약

기부 완료 시 **자동으로**:
1. 서버에서 NZ IRD 기준 영수증 PDF를 생성
2. Cloud Storage에 영수증을 저장 (기부자 계정에 영구 보관)
3. 기관 대신 감사 이메일을 보내면서 영수증 PDF를 첨부

---

## 🔄 현재 vs 요청 흐름

### 현재 (As-Is)
```
기부 완료 → Stripe Webhook → 기부 레코드 생성 (receipt_no) → 끝
                                                        ↓
                                          프론트에서 직접 PDF 생성해서 다운로드
                                          (저장 안 됨, 이메일 없음)
```

### 요청 (To-Be)
```
기부 완료 → Stripe Webhook → 기부 레코드 생성 (receipt_no)
                                    ↓
                          ① 서버에서 PDF 영수증 생성
                                    ↓
                          ② Cloud Storage에 저장 → receipt_url 업데이트
                                    ↓
                          ③ 감사 이메일 발송 (PDF 첨부)
                                    ↓
                          ④ 알림 레코드 생성 (in-app)
```

---

## 🆕 필요한 API 엔드포인트

### 1. 영수증 PDF 다운로드
```
GET /api/v1/receipts/{donation_id}/pdf
```
- **용도**: 기부자가 대시보드에서 저장된 영수증 PDF를 다운로드
- **응답**: PDF 파일 (application/pdf) 또는 signed URL redirect
- **인증**: 기부자 본인만 접근 가능

### 2. 감사 이메일 템플릿 CRUD
```
GET    /api/v1/charities/{charity_id}/email-templates
POST   /api/v1/charities/{charity_id}/email-templates
PUT    /api/v1/charities/{charity_id}/email-templates/{template_id}
DELETE /api/v1/charities/{charity_id}/email-templates/{template_id}
```

**템플릿 스키마:**
```json
{
  "id": 1,
  "charity_id": 3,
  "title": "Thank You for Your Generosity",
  "body": "Dear {donor_name},\n\nThank you so much for your generous donation of {amount} to {charity_name}...",
  "is_active": true,
  "created_at": "2026-06-02T12:00:00Z",
  "updated_at": "2026-06-02T12:00:00Z"
}
```

**지원 플레이스홀더:**
| 변수 | 설명 | 예시 |
|------|------|------|
| `{donor_name}` | 기부자 이름 | Sarah Johnson |
| `{amount}` | 기부 금액 (통화 포함) | NZ$50.00 |
| `{charity_name}` | 기관명 | Forest & Bird NZ |
| `{project_name}` | 프로젝트명 | Restore Native Forest |
| `{date}` | 기부 날짜 | 2 June 2026 |
| `{receipt_no}` | 영수증 번호 | DG-2026-0042 |
| `{tax_credit}` | 예상 세액공제 | NZ$16.67 |

### 3. 기부자 이메일 수신 설정
```
GET /api/v1/donors/me/notification-settings
PUT /api/v1/donors/me/notification-settings
```

> 이미 notification-settings 스펙에 `email_donation_receipt` 필드가 있으므로, 이 설정이 `true`인 경우에만 이메일을 발송하면 됩니다.

---

## 📧 이메일 서비스 추천

### Resend (추천 ⭐)
- **이유**: Next.js 생태계 최적화, React Email로 HTML 이메일 작성, PDF 첨부 지원
- **무료**: 3,000통/월 (초기 충분)
- **설치**: `npm install resend`
- **공식 문서**: https://resend.com/docs

### 사용 예시 (참고용)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'DearGiver <noreply@deargiver.co.nz>',
  to: donorEmail,
  subject: `Thank you for your donation to ${charityName} 🌿`,
  html: renderedEmailHtml,
  attachments: [
    {
      filename: `DearGiver_Receipt_${receiptNo}.pdf`,
      content: pdfBuffer,  // Buffer 또는 Base64
    },
  ],
});
```

---

## 📄 서버사이드 PDF 생성

현재 프론트엔드에서 `jsPDF`로 생성하고 있는 코드를 그대로 서버로 이식하면 됩니다.

**참고 파일**: `lib/generateReceiptPdf.ts` (344줄)

### 핵심 로직 요약
1. A4 크기 PDF 생성 (jsPDF)
2. DearGiver 브랜드 헤더 (teal 컬러 배경)
3. 영수증 번호 + 발행일
4. 기부자 정보 (이름, 이메일)
5. 기관 정보 (이름, CC 번호)
6. 기부 상세 (날짜, 통화, 금액)
7. NZD인 경우 세액공제 33.33% 계산
8. NZ IRD 법적 면책 문구
9. 세금 크레딧 청구 가이드 (myIR 안내)

### 서버에서 jsPDF 사용
```bash
npm install jspdf
```
Node.js에서도 동일하게 동작합니다. `doc.output('arraybuffer')`로 Buffer를 얻으면 됩니다.

---

## ☁️ PDF 저장소

### Firebase Storage (추천 — 이미 Firebase 사용 중)
```
gs://[bucket]/receipts/{donor_id}/{receipt_no}.pdf
```
- 5GB 무료
- Firebase Auth와 Security Rules 연동 가능
- signed URL로 다운로드 링크 제공

### 대안: Vercel Blob
- 매우 쉬운 연동 (`@vercel/blob`)
- Vercel에 배포 중이므로 자연스러움

---

## 🔀 Stripe Webhook 확장

현재 `checkout.session.completed` 이벤트를 처리하고 있으므로, 여기에 추가:

```
checkout.session.completed
  └→ 1. 기부 레코드 생성 (기존)
  └→ 2. receipt_no 생성 (기존)
  └→ 3. [NEW] PDF 생성 → Storage 업로드
  └→ 4. [NEW] receipt_url 필드 업데이트
  └→ 5. [NEW] 기부자 notification-settings 확인
  └→ 6. [NEW] email_donation_receipt == true → 감사 이메일 발송
  └→ 7. [NEW] in-app 알림 생성
```

---

## 📊 감사 이메일 템플릿 DB 스키마

```sql
CREATE TABLE email_templates (
  id              SERIAL PRIMARY KEY,
  charity_id      INTEGER NOT NULL REFERENCES charities(id),
  title           VARCHAR(200) NOT NULL,
  body            TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 기본 템플릿 (기관이 커스텀 안 만들면 사용)
```
title: "Thank You for Your Donation"
body: "Dear {donor_name},\n\nThank you for your generous donation of {amount} to {charity_name}. Your support makes a real difference.\n\nYour official donation receipt (#{receipt_no}) is attached to this email. You can also access all your receipts from your DearGiver dashboard at any time.\n\nWith gratitude,\n{charity_name}"
```

---

## 🚀 우선순위 단계

| 단계 | 내용 | 의존성 |
|------|------|--------|
| **Phase 1** | Webhook에서 PDF 생성 + Storage 저장 + `receipt_url` 반환 | 없음 |
| **Phase 2** | Resend 연동 + 기본 감사 이메일 (DearGiver 공통 템플릿) 발송 | Phase 1 |
| **Phase 3** | 감사 템플릿 CRUD API + 기관별 커스텀 메시지 | Phase 2 |

> Phase 1만 완료되면 프론트에서 바로 `receipt_url`로 다운로드 전환 가능!

---

## ✅ 프론트에서 미리 준비하는 것

| 작업 | 상태 |
|------|------|
| Donation Success 페이지에 영수증 다운로드 버튼 | 구현 예정 |
| Charity Dashboard 감사 템플릿 UI → API 연동 구조 | 구현 예정 |
| Settings 이메일 수신 설정 UI | ✅ 이미 구현됨 |
| Receipt Vault — URL 기반 다운로드 전환 준비 | 구현 예정 |

---

## 💬 질문 / 논의 사항

1. **이메일 발신 도메인**: `noreply@deargiver.co.nz` — 도메인 DNS에 SPF/DKIM 설정 필요. 도메인 관리 접근 가능한지?
2. **PDF 생성 타이밍**: Webhook 내에서 동기적으로? 아니면 큐(Queue)로 비동기 처리?
3. **receipt_url 반환 형태**: signed URL (만료 시간 있음) vs public URL (고정)?
4. **이메일 발송 실패 시 재시도**: 자동 재시도 로직 필요한지?

---

> 이 문서를 오빠한테 보내주면 됩니다! 프론트에서는 위의 구현 계획대로 먼저 작업 시작할게요.
