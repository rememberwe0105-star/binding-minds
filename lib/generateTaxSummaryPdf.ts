/**
 * DearGiver — NZ 연간 기부 세금 요약서 PDF 생성 유틸리티
 *
 * NZ IRD Donation Tax Credit 청구용 연간 통합 요약 문서:
 * - 선택한 NZ 과세연도(4/1 ~ 3/31)의 기부 전체 합산
 * - 세액공제 33.33% 예상액 (NZD 기부건만)
 * - IRD myIR 청구 안내
 * - 법적 면책 문구
 *
 * @see https://www.ird.govt.nz/income-tax/income-tax-for-individuals/types-of-individual-income/donation-tax-credits
 */

import type { DonationItem } from '@/lib/api';

// ─── 색상 (DearGiver 브랜드) ────────────────────────────────────────────────
const TEAL = [74, 124, 113] as const;    // #4A7C71
const GOLD = [196, 154, 82] as const;   // #C49A52
const TEXT_DARK = [30, 40, 35] as const;
const TEXT_MUTED = [110, 125, 118] as const;
const DIVIDER = [218, 228, 222] as const;
const BG_LIGHT = [247, 251, 249] as const;
const BG_GREEN = [236, 247, 242] as const;
const BG_WARN = [255, 248, 230] as const;
const WARN_TEXT = [130, 90, 20] as const;

// ─── NZ 과세연도 유틸 ────────────────────────────────────────────────────────

/**
 * NZ 과세연도: 4월 1일 ~ 다음해 3월 31일
 * taxYear=2025 → 2024-04-01 ~ 2025-03-31
 */
export function getNZTaxYearRange(taxYear: number): { start: Date; end: Date } {
  return {
    start: new Date(`${taxYear - 1}-04-01T00:00:00.000Z`),
    end: new Date(`${taxYear}-03-31T23:59:59.999Z`),
  };
}

/**
 * 특정 날짜가 속하는 NZ 과세연도를 반환합니다.
 * 예: 2025-01-15 → 2025 (2024-04-01 ~ 2025-03-31에 속하므로)
 */
export function getNZTaxYear(dateStr: string): number {
  const d = new Date(dateStr);
  const month = d.getUTCMonth() + 1; // 1~12
  const year = d.getUTCFullYear();
  return month >= 4 ? year + 1 : year;
}

/**
 * 기부 내역에서 존재하는 NZ 과세연도 목록을 추출합니다. (내림차순)
 */
export function getAvailableTaxYears(items: DonationItem[]): number[] {
  const years = new Set<number>();
  for (const item of items) {
    const dateStr = item.paid_at ?? item.created_at;
    if (dateStr && item.donation_status === 'succeeded') {
      years.add(getNZTaxYear(dateStr));
    }
  }
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * 특정 NZ 과세연도에 속하는 completed 기부건만 필터링합니다.
 */
export function filterByTaxYear(
  items: DonationItem[],
  taxYear: number,
): DonationItem[] {
  const { start, end } = getNZTaxYearRange(taxYear);
  return items.filter((item) => {
    if (item.donation_status !== 'succeeded') return false;
    const dateStr = item.paid_at ?? item.created_at;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= start && d <= end;
  });
}

// ─── 포맷 유틸 ───────────────────────────────────────────────────────────────

function fmtCurrency(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency || 'NZD',
      minimumFractionDigits: 2,
    }).format(minor / 100);
  } catch {
    return `${currency} ${(minor / 100).toFixed(2)}`;
  }
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function todayNZ(): string {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date());
}

// ─── 메인: Tax Summary PDF 생성 ─────────────────────────────────────────────

export interface TaxSummaryOptions {
  items: DonationItem[];       // 해당 연도로 이미 필터된 기부 내역
  donorName: string;
  donorEmail?: string;
  taxYear: number;             // 예: 2025 → "2025 Tax Year (1 Apr 2024 – 31 Mar 2025)"
}

/**
 * 연간 기부 세금 요약서 PDF를 생성하고 자동 다운로드합니다.
 */
export async function downloadTaxSummaryPdf(opts: TaxSummaryOptions): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { items, donorName, donorEmail, taxYear } = opts;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  const MARGIN = 18;
  const CW = W - MARGIN * 2;       // 콘텐츠 폭
  let y = 0;

  // ── 헬퍼 ──────────────────────────────────────────────────────────────────
  const rgb = (c: readonly [number, number, number]) =>
    doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c: readonly [number, number, number]) =>
    doc.setFillColor(c[0], c[1], c[2]);
  const draw = (c: readonly [number, number, number]) =>
    doc.setDrawColor(c[0], c[1], c[2]);
  const hline = (yPos: number) => {
    draw(DIVIDER);
    doc.line(MARGIN, yPos, W - MARGIN, yPos);
  };

  // ── 집계 ──────────────────────────────────────────────────────────────────
  const nzdItems = items.filter((d) => d.currency_code === 'NZD');
  const otherItems = items.filter((d) => d.currency_code !== 'NZD');

  const nzdTotal = nzdItems.reduce((s, d) => s + d.donation_amount_minor, 0);
  const nzdTaxCredit = Math.round(nzdTotal * 0.3333) / 100; // 달러로

  const taxYearLabel = `${taxYear} Tax Year`;
  const taxYearRange = `1 Apr ${taxYear - 1} – 31 Mar ${taxYear}`;

  // ══════════════════════════════════════════════════════════════════════════
  // 1. 헤더 배경
  // ══════════════════════════════════════════════════════════════════════════
  fill(TEAL);
  doc.rect(0, 0, W, 46, 'F');

  // 로고
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('DearGiver', MARGIN, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 225, 215);
  doc.text('deargiver.nz  |  Connecting NZ with causes that matter', MARGIN, 26);

  // 타이틀 (우측)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('ANNUAL TAX SUMMARY', W - MARGIN, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(190, 225, 215);
  doc.text(taxYearLabel, W - MARGIN, 23, { align: 'right' });
  doc.text(taxYearRange, W - MARGIN, 29, { align: 'right' });

  // 금색 강조선
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(W - MARGIN - 72, 33, 72, 0.9, 'F');

  y = 54;

  // ══════════════════════════════════════════════════════════════════════════
  // 2. 기부자 정보
  // ══════════════════════════════════════════════════════════════════════════
  fill(BG_LIGHT);
  doc.rect(MARGIN, y - 4, CW, donorEmail ? 22 : 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  rgb(TEXT_MUTED);
  doc.text('PREPARED FOR', MARGIN + 4, y + 2);
  doc.text('DATE ISSUED', MARGIN + CW / 2 + 4, y + 2);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  rgb(TEXT_DARK);
  doc.text(donorName || 'Valued Donor', MARGIN + 4, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(todayNZ(), MARGIN + CW / 2 + 4, y + 9);

  if (donorEmail) {
    doc.setFontSize(8.5);
    rgb(TEXT_MUTED);
    doc.text(donorEmail, MARGIN + 4, y + 15);
  }

  y += donorEmail ? 26 : 22;
  hline(y);
  y += 8;

  // ══════════════════════════════════════════════════════════════════════════
  // 3. 요약 박스
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('DONATION SUMMARY', MARGIN, y);
  y += 6;

  // 요약 그리드 (2열)
  const summaryItems = [
    { label: 'Total NZD Donations', value: fmtCurrency(nzdTotal, 'NZD') },
    { label: 'Number of Donations', value: String(items.length) },
    { label: 'Est. Tax Credit (33.33% of NZD)', value: `NZD $${nzdTaxCredit.toFixed(2)}` },
    { label: 'NZD Tax-Eligible Donations', value: String(nzdItems.length) },
  ];

  const cellW = CW / 2 - 4;
  summaryItems.forEach((si, idx) => {
    const col = idx % 2;
    const xOff = MARGIN + col * (cellW + 8);

    if (col === 0) {
      // 행 배경
      fill(idx < 2 ? BG_GREEN : BG_LIGHT);
      doc.rect(MARGIN, y - 2, CW, 16, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    rgb(TEXT_MUTED);
    doc.text(si.label, xOff + 4, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    rgb(idx === 2 ? TEAL : TEXT_DARK);
    doc.text(si.value, xOff + 4, y + 12);

    if (col === 1) y += 20;
  });

  y += 8;

  // 세액공제 강조 배너
  fill(TEAL);
  doc.rect(MARGIN, y, CW, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 225, 215);
  doc.text('Your estimated NZ Donation Tax Credit for this year:', MARGIN + 5, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`NZD $${nzdTaxCredit.toFixed(2)}`, W - MARGIN - 3, y + 10, { align: 'right' });

  y += 22;
  hline(y);
  y += 8;

  // 비NZD 기부 안내 (있을 때만)
  if (otherItems.length > 0) {
    fill(BG_WARN);
    doc.rect(MARGIN, y - 2, CW, 12, 'F');
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(MARGIN, y - 2, 1.5, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(WARN_TEXT[0], WARN_TEXT[1], WARN_TEXT[2]);
    doc.text(
      `Note: ${otherItems.length} donation(s) in non-NZD currencies are excluded from the tax credit calculation.`,
      MARGIN + 5, y + 5,
    );
    y += 18;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. 기부 내역 테이블
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('DONATION DETAILS', MARGIN, y);
  y += 5;

  // 테이블 헤더
  fill(TEAL);
  doc.rect(MARGIN, y, CW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 240, 235);

  const COL = {
    date:    MARGIN + 2,
    charity: MARGIN + 30,
    cur:     MARGIN + 114,
    amount:  MARGIN + 126,
    status:  MARGIN + 154,
  };

  doc.text('DATE', COL.date, y + 5.5);
  doc.text('CHARITY / ORGANISATION', COL.charity, y + 5.5);
  doc.text('CCY', COL.cur, y + 5.5);
  doc.text('AMOUNT', COL.amount, y + 5.5);
  doc.text('RECEIPT NO.', COL.status, y + 5.5);
  y += 10;

  // 테이블 행
  items.forEach((item, i) => {
    if (y > 260) {
      // 페이지 넘김
      doc.addPage();
      y = 20;
    }

    if (i % 2 === 0) {
      fill(BG_LIGHT);
      doc.rect(MARGIN, y - 1, CW, 7.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    rgb(TEXT_DARK);

    const dateStr = fmtDate(item.paid_at ?? item.created_at);
    const charityName = item.charity_display_name || '(Organisation not linked)';
    const charityTrunc = doc.splitTextToSize(charityName, 80)[0]; // 1줄로 자름
    const currency = item.currency_code ?? 'NZD';
    const amount = fmtCurrency(item.donation_amount_minor, currency);
    const receiptNo = item.receipt_no ? String(item.receipt_no) : 'Auto';

    doc.text(dateStr, COL.date, y + 5);
    doc.text(charityTrunc, COL.charity, y + 5);

    // NZD 아닌 통화 주황 표시
    if (currency !== 'NZD') {
      doc.setTextColor(180, 100, 20);
    } else {
      rgb(TEXT_DARK);
    }
    doc.text(currency, COL.cur, y + 5);
    rgb(TEXT_DARK);

    doc.text(amount, COL.amount, y + 5);
    rgb(TEXT_MUTED);
    doc.text(receiptNo, COL.status, y + 5);

    y += 7.5;
  });

  y += 4;
  hline(y);
  y += 6;

  // 합계 행
  fill(BG_GREEN);
  doc.rect(MARGIN, y - 1, CW, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  rgb(TEAL);
  doc.text('TOTAL (NZD eligible)', COL.charity, y + 6.5);
  doc.text(fmtCurrency(nzdTotal, 'NZD'), COL.amount, y + 6.5);
  y += 16;

  // ══════════════════════════════════════════════════════════════════════════
  // 5. 법적 면책 문구
  // ══════════════════════════════════════════════════════════════════════════
  if (y > 235) {
    doc.addPage();
    y = 20;
  }

  fill(BG_WARN);
  doc.rect(MARGIN, y, CW, 26, 'F');
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(MARGIN, y, 1.8, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(WARN_TEXT[0], WARN_TEXT[1], WARN_TEXT[2]);
  doc.text('IMPORTANT NOTICE', MARGIN + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const disclaimerLines = [
    'This Annual Tax Summary is prepared by DearGiver Limited on behalf of donors for use with',
    'Inland Revenue New Zealand (IRD). This document is NOT a tax invoice.',
    'The estimated tax credit is based on the 33.33% donation tax credit rate applicable to eligible',
    'NZD donations made to Charities Services–registered organisations.',
  ];
  disclaimerLines.forEach((line, i) => {
    doc.text(line, MARGIN + 6, y + 13 + i * 4.2);
  });

  y += 32;

  // ══════════════════════════════════════════════════════════════════════════
  // 6. IRD 청구 안내
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('HOW TO CLAIM YOUR TAX CREDIT', MARGIN, y);
  y += 6;

  const steps = [
    '1.  Log in to myIR at ird.govt.nz',
    '2.  Select "Income Tax" → "Donation Tax Credits"',
    '3.  Enter your total NZD donation amount from this summary',
    '4.  IRD calculates your 33.33% credit automatically',
    '5.  Your refund is deposited to your bank within 4–8 weeks',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  rgb(TEXT_DARK);
  steps.forEach((step) => {
    doc.text(step, MARGIN + 2, y);
    y += 5.5;
  });

  y += 4;
  hline(y);
  y += 6;

  // ══════════════════════════════════════════════════════════════════════════
  // 7. 푸터
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  rgb(TEXT_MUTED);
  doc.text(
    'DearGiver Limited  |  Helping New Zealanders give more, together  |  deargiver.nz',
    W / 2, y, { align: 'center' },
  );
  y += 4.5;
  doc.text(
    `Generated on ${todayNZ()}. Keep this summary with your tax records.`,
    W / 2, y, { align: 'center' },
  );

  // ── 저장 ───────────────────────────────────────────────────────────────
  doc.save(`deargiver-tax-summary-${taxYear}.pdf`);
}
