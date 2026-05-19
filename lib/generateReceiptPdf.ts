/**
 * DearGiver — NZ 기부 영수증 PDF 생성 유틸리티
 *
 * NZ IRD Donation Tax Credit 요건 기반:
 * - 기부자 이름, 단체명, 날짜, 금액, 통화, 영수증 번호
 * - "This is not a tax invoice" 법적 면책 문구
 * - NZD 기부건에 한해 세액공제 33.33% 예상액 표시
 *
 * @see https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/donation-tax-credits
 */

import type { DonationItem } from '@/lib/api';

// ─── 색상 (DearGiver 브랜드) ────────────────────────────────────────────────
const COLOR_TEAL_R = 74;
const COLOR_TEAL_G = 124;
const COLOR_TEAL_B = 113; // #4A7C71 (sage-dark)
const COLOR_GOLD_R = 196;
const COLOR_GOLD_G = 154;
const COLOR_GOLD_B = 82; // #C49A52 (warm gold)
const COLOR_TEXT_DARK = [30, 40, 35] as const;
const COLOR_TEXT_MUTED = [120, 130, 125] as const;
const COLOR_DIVIDER = [220, 228, 224] as const;
const COLOR_BG_LIGHT = [248, 251, 250] as const;

// ─── 영수증 번호 생성 ────────────────────────────────────────────────────────
function generateReceiptNo(item: DonationItem, index: number): string {
  if (item.receipt_no) return String(item.receipt_no);
  // 자동 생성: DG-YYYYMMDD-NNNN
  const dateStr = item.paid_at ?? item.created_at;
  const datePart = dateStr
    ? new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, '')
    : 'UNKNOWN';
  const seq = String(index + 1).padStart(4, '0');
  return `DG-${datePart}-${seq}`;
}

// ─── 금액 포맷 ───────────────────────────────────────────────────────────────
function fmtAmount(minor: number, currency: string): string {
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} $${amount.toFixed(2)}`;
  }
}

// ─── 날짜 포맷 ───────────────────────────────────────────────────────────────
function fmtDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown Date';
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ─── 현재 날짜 ────────────────────────────────────────────────────────────────
function todayNZ(): string {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date());
}

// ─── 메인: 단일 영수증 PDF 생성 ──────────────────────────────────────────────

interface ReceiptOptions {
  item: DonationItem;
  donorName: string;
  donorEmail?: string;
  index?: number;
}

/**
 * 단일 기부 건에 대한 NZ IRD 기준 영수증 PDF를 생성하고 자동 다운로드합니다.
 */
export async function downloadReceiptPdf(opts: ReceiptOptions): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const { item, donorName, donorEmail, index = 0 } = opts;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210; // A4 width mm
  const MARGIN = 20;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  // ── 헬퍼 ──────────────────────────────────────────────────────────────────
  const setRGB = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
  const setFillRGB = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
  const setDrawRGB = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
  const text = (
    str: string,
    x: number,
    yPos: number,
    opts?: Parameters<typeof doc.text>[3],
  ) => doc.text(str, x, yPos, opts);
  const line = (y1: number) => {
    setDrawRGB(...COLOR_DIVIDER);
    doc.line(MARGIN, y1, W - MARGIN, y1);
  };

  // ── 1. 헤더 배경 ───────────────────────────────────────────────────────────
  setFillRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  doc.rect(0, 0, W, 42, 'F');

  // ── 2. 로고 텍스트 ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  text('DearGiver', MARGIN, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 220);
  text('deargiver.nz  |  Connecting NZ with causes that matter', MARGIN, 26);

  // ── 3. "DONATION RECEIPT" 타이틀 ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  text('DONATION RECEIPT', W - MARGIN, 18, { align: 'right' });

  // 금색 강조선
  doc.setFillColor(COLOR_GOLD_R, COLOR_GOLD_G, COLOR_GOLD_B);
  doc.rect(W - MARGIN - 60, 22, 60, 0.8, 'F');

  y = 52;

  // ── 4. 영수증 메타 (번호 + 발행일) ────────────────────────────────────────
  setFillRGB(...COLOR_BG_LIGHT);
  doc.rect(MARGIN, y - 4, CONTENT_W, 18, 'F');

  const receiptNo = generateReceiptNo(item, index);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setRGB(...COLOR_TEXT_MUTED);
  text('RECEIPT NO.', MARGIN + 4, y + 2);
  text('DATE ISSUED', MARGIN + CONTENT_W / 2 + 4, y + 2);

  doc.setFontSize(11);
  setRGB(...COLOR_TEXT_DARK);
  text(receiptNo, MARGIN + 4, y + 8);
  text(todayNZ(), MARGIN + CONTENT_W / 2 + 4, y + 8);

  y += 24;
  line(y);
  y += 8;

  // ── 5. 기부 정보 섹션 ────────────────────────────────────────────────────
  const labelX = MARGIN;
  const valueX = MARGIN + 55;

  const row = (label: string, value: string, bold = false) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setRGB(...COLOR_TEXT_MUTED);
    text(label, labelX, y);

    doc.setFontSize(10);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    setRGB(...COLOR_TEXT_DARK);
    // 긴 값은 줄바꿈
    const lines = doc.splitTextToSize(value, CONTENT_W - 55);
    doc.text(lines, valueX, y);
    y += Math.max(8, lines.length * 5.5);
  };

  // 기부자 정보
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  text('DONOR DETAILS', labelX, y);
  y += 7;

  row('Donor Name:', donorName || 'N/A');
  if (donorEmail) row('Email:', donorEmail);

  y += 4;
  line(y);
  y += 8;

  // 단체 정보
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  text('ORGANISATION DETAILS', labelX, y);
  y += 7;

  row('Charity Name:', item.charity_display_name || '(Organisation not linked)');
  row('CC Registration No.:', 'Pending — Charity Services registered');

  y += 4;
  line(y);
  y += 8;

  // 기부 정보
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  text('DONATION DETAILS', labelX, y);
  y += 7;

  const donationDate = fmtDate(item.paid_at ?? item.created_at);
  const currency = item.currency_code ?? 'NZD';
  const amountDisplay = fmtAmount(item.donation_amount_minor, currency);
  const amountDecimal = item.donation_amount_minor / 100;

  row('Date of Donation:', donationDate);
  row('Currency:', currency);
  row('Donation Amount:', amountDisplay, true);

  // 세액공제 (NZD만)
  if (currency === 'NZD') {
    const taxCredit = Math.round(amountDecimal * 0.3333 * 100) / 100;
    const taxCreditFmt = fmtAmount(taxCredit * 100, 'NZD');
    row('Est. Tax Credit (33.33%):', taxCreditFmt);
    row('Estimated Net Cost:', fmtAmount((amountDecimal - taxCredit) * 100, 'NZD'));
  }

  y += 4;
  line(y);
  y += 10;

  // ── 6. 금액 강조 박스 ──────────────────────────────────────────────────────
  setFillRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  doc.rect(MARGIN, y, CONTENT_W, 18, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 230, 220);
  text('TOTAL DONATION RECEIVED', MARGIN + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  text(amountDisplay, W - MARGIN - 4, y + 12, { align: 'right' });

  y += 26;

  // ── 7. NZ 법적 면책 문구 ─────────────────────────────────────────────────
  setFillRGB(255, 248, 230);
  doc.rect(MARGIN, y, CONTENT_W, 22, 'F');
  setDrawRGB(COLOR_GOLD_R, COLOR_GOLD_G, COLOR_GOLD_B);
  doc.rect(MARGIN, y, 1.5, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setRGB(150, 100, 30);
  text('IMPORTANT NOTICE', MARGIN + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setRGB(120, 80, 20);
  const disclaimer = [
    'This receipt is issued by DearGiver Limited on behalf of the named charity organisation.',
    'This is NOT a tax invoice. It is a donation receipt for the purposes of claiming a',
    'Donation Tax Credit with Inland Revenue (IRD) New Zealand.',
  ];
  disclaimer.forEach((line_, i) => {
    text(line_, MARGIN + 6, y + 12 + i * 4.5);
  });

  y += 30;

  // ── 8. IRD 청구 안내 ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setRGB(COLOR_TEAL_R, COLOR_TEAL_G, COLOR_TEAL_B);
  text('HOW TO CLAIM YOUR TAX CREDIT', MARGIN, y);
  y += 6;

  const steps = [
    '1.  Log in to myIR at ird.govt.nz',
    '2.  Select "Income Tax" → "Donation Tax Credits"',
    '3.  Enter your total annual donation amount (from your receipts)',
    '4.  IRD will calculate your 33.33% credit (NZD donations only)',
    '5.  Your refund will be deposited to your bank account within 4–8 weeks',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setRGB(...COLOR_TEXT_DARK);
  steps.forEach((step) => {
    text(step, MARGIN + 2, y);
    y += 5.5;
  });

  y += 6;
  line(y);
  y += 8;

  // ── 9. 하단 푸터 ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setRGB(...COLOR_TEXT_MUTED);
  const footer1 = 'DearGiver Limited  |  Helping New Zealanders give more, together  |  deargiver.nz';
  const footer2 = `This document was generated on ${todayNZ()}. Keep this receipt for your tax records.`;
  text(footer1, W / 2, y, { align: 'center' });
  y += 5;
  text(footer2, W / 2, y, { align: 'center' });

  // ── 10. 저장 ────────────────────────────────────────────────────────────
  const charitySlug = (item.charity_display_name ?? 'charity')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const datePart = (item.paid_at ?? item.created_at ?? 'unknown')
    .slice(0, 10)
    .replace(/-/g, '');

  doc.save(`deargiver-receipt-${charitySlug}-${datePart}.pdf`);
}

// ─── 전체 영수증 일괄 다운로드 ───────────────────────────────────────────────

/**
 * 여러 기부 건의 영수증을 순차적으로 각각 PDF로 다운로드합니다.
 * 각 파일 사이에 300ms 딜레이를 주어 브라우저가 차단하지 않도록 합니다.
 */
export async function downloadAllReceiptsPdf(
  items: DonationItem[],
  donorName: string,
  donorEmail?: string,
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    await downloadReceiptPdf({ item: items[i], donorName, donorEmail, index: i });
    if (i < items.length - 1) {
      await new Promise((res) => setTimeout(res, 350));
    }
  }
}
