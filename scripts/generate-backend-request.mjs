/**
 * 백엔드팀 요청 사항 PDF 생성 스크립트
 * 실행: node scripts/generate-backend-request.mjs
 */

import { jsPDF } from 'jspdf';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../docs/BACKEND_REQUEST.pdf');

// ── 색상 ──────────────────────────────────────────────────────
const TEAL   = [74, 124, 113];
const GOLD   = [196, 154, 82];
const RED    = [180, 60, 60];
const GREEN  = [60, 140, 100];
const TEXT   = [30, 40, 35];
const MUTED  = [110, 125, 118];
const DIVIDER= [218, 228, 222];
const BG     = [247, 251, 249];
const BG_WARN= [255, 248, 230];
const BG_RED = [255, 242, 242];

function today() {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date());
}

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const W = 210, M = 18, CW = W - M * 2;
let y = 0;

const rgb  = (c) => doc.setTextColor(c[0], c[1], c[2]);
const fill = (c) => doc.setFillColor(c[0], c[1], c[2]);
const draw = (c) => doc.setDrawColor(c[0], c[1], c[2]);
const hline = (yy) => { draw(DIVIDER); doc.line(M, yy, W - M, yy); };

// ══════════════════════════════════════════════
// 1. 헤더
// ══════════════════════════════════════════════
fill(TEAL);
doc.rect(0, 0, W, 44, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(255, 255, 255);
doc.text('DearGiver', M, 17);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(190, 225, 215);
doc.text('deargiver.nz  |  Backend Integration Request', M, 25);

doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(255, 255, 255);
doc.text('BACKEND TEAM REQUEST', W - M, 16, { align: 'right' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(190, 225, 215);
doc.text(`Issued: ${today()}`, W - M, 24, { align: 'right' });
doc.text('From: Frontend Team  →  To: Backend Team', W - M, 30, { align: 'right' });

doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
doc.rect(W - M - 94, 35, 94, 0.9, 'F');

y = 52;

// ══════════════════════════════════════════════
// 2. 개요
// ══════════════════════════════════════════════
fill(BG);
doc.rect(M, y - 3, CW, 16, 'F');
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
rgb(MUTED);
doc.text(
  'The following items are required from the backend team to complete the DearGiver production deployment.',
  M + 4, y + 4,
);
doc.text(
  'Items are listed in priority order. Please action items 1 and 2 as soon as possible.',
  M + 4, y + 10,
);
y += 22;
hline(y); y += 8;

// ── 요청 항목 렌더 헬퍼 ─────────────────────────────────
function section(no, title, priority, priorityColor, bgColor, body) {
  if (y > 245) { doc.addPage(); y = 20; }

  // 번호 + 제목 헤더
  fill(priorityColor);
  doc.rect(M, y, CW, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${no}.  ${title}`, M + 5, y + 7.5);
  doc.setFontSize(8);
  doc.text(`Priority: ${priority}`, W - M - 4, y + 7.5, { align: 'right' });
  y += 13;

  // 본문
  fill(bgColor);
  const startY = y;
  body(startY);
  y += 5;
  hline(y); y += 8;
}

function row(label, value, bold = false) {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  rgb(MUTED);
  doc.text(label, M + 4, y);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(9);
  rgb(TEXT);
  const lines = doc.splitTextToSize(value, CW - 40);
  doc.text(lines, M + 55, y);
  y += Math.max(6, lines.length * 5);
}

function codeBlock(code) {
  if (y > 255) { doc.addPage(); y = 20; }
  fill([240, 245, 243]);
  draw([200, 215, 210]);
  const lines = code.trim().split('\n');
  const h = lines.length * 5.5 + 6;
  doc.rect(M + 4, y, CW - 8, h, 'FD');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  rgb(TEXT);
  lines.forEach((line, i) => {
    doc.text(line, M + 8, y + 5 + i * 5.5);
  });
  y += h + 4;
}

function note(text) {
  if (y > 265) { doc.addPage(); y = 20; }
  fill(BG_WARN);
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(M + 4, y - 1, 1.5, 8, 'F');
  fill(BG_WARN);
  doc.rect(M + 4, y - 1, CW - 8, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 90, 20);
  doc.text(text, M + 10, y + 4.5);
  y += 12;
}

function para(text, color = TEXT) {
  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  rgb(color);
  const lines = doc.splitTextToSize(text, CW - 8);
  doc.text(lines, M + 4, y);
  y += lines.length * 5.5 + 3;
}

// ══════════════════════════════════════════════
// 요청 1: Stripe 퍼블릭 키 제공
// ══════════════════════════════════════════════
section('1', 'Stripe Publishable Key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)', '🔴 HIGH — Blocking Deployment', RED, BG_RED, () => {
  y += 2;
  para('The frontend requires the Stripe publishable key to initialise the Stripe.js SDK and process payments. Since the Stripe account is managed by the backend team, please provide this key.');
  row('What is needed:', 'Stripe Publishable Key — starts with pk_test_... (test) or pk_live_... (production)');
  row('Where to find it:', 'Stripe Dashboard → Developers → API Keys → Publishable key');
  row('How to apply:', 'Provide the key to the frontend team → we will add it to Vercel environment variables');
  para('Please provide BOTH keys if available:', MUTED);
  codeBlock(`# Test environment (for staging/development)\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...\n\n# Production environment (for live payments)\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`);
  note('Without this key, the donation/payment feature is completely non-functional in production.');
});

// ══════════════════════════════════════════════
// 요청 2: Stripe 리다이렉트 URL
// ══════════════════════════════════════════════
section('2', 'Stripe Checkout Redirect URL Configuration', '🔴 HIGH — Action Required', RED, BG_RED, () => {
  y += 2;
  para('After a Stripe Checkout payment completes or is cancelled, Stripe redirects the user back to the frontend. Currently the backend derives this URL from the request Origin header, which works locally (localhost:3000) but fails in production.');
  row('Issue:', 'Production redirects land on localhost:3000/success instead of binding-minds.vercel.app/donation/success');
  row('Impact:', 'Users completing a real payment cannot return to the app — they see a browser error page');
  para('Please add the following environment variables to the backend server:', MUTED);
  codeBlock(`PUBLIC_FRONTEND_URL=https://binding-minds.vercel.app\n# OR explicitly:\nCHECKOUT_SUCCESS_URL=https://binding-minds.vercel.app/donation/success\nCHECKOUT_CANCEL_URL=https://binding-minds.vercel.app/donation/cancel`);
  note('This is the highest priority item. Without this, the donation flow is broken in production.');
});

// ══════════════════════════════════════════════
// 요청 2: API pageSize 제한 완화
// ══════════════════════════════════════════════
section('3', 'Increase API pageSize Limit (50 → 500+)', '🟡 MEDIUM', [180, 130, 20], BG_WARN, () => {
  y += 2;
  para('The frontend Tax Summary PDF feature downloads all donations for a given NZ tax year in a single PDF document. The current API limit of 50 records per page means users with more than 50 donations will have an incomplete tax summary.');
  row('Endpoint:', 'GET /api/v1/me/donations?page=1&pageSize=500');
  row('Current limit:', '50 records per page (as per API_FOR_FRONTEND_DEVELOPERS.md §5.4)');
  row('Requested limit:', '500 records per page (or configurable upper bound ≥ 500)');
  note('Tax year runs 1 Apr – 31 Mar. Power users may have 50+ donations in a year.');
});

// ══════════════════════════════════════════════
// 요청 3: Stripe Connect 계정 ID 목록
// ══════════════════════════════════════════════
section('4', 'Charity Stripe Connect Account IDs', '🟡 MEDIUM', [60, 110, 160], [240, 245, 255], () => {
  y += 2;
  para('Each charity on the platform needs its own Stripe Connect account ID to receive donations. Currently all donations use a single test account ID. We need the real IDs for each registered charity.');
  row('Current state:', 'All campaigns use acct_1TLekBRHr11OamkF (test only)');
  row('Required format:', 'acct_xxxxxxxxxxxxxxxxx (Stripe Connected Account ID)');
  row('Source:', 'DB table: charity_payment_accounts.stripe_account_id');
  para('Please provide a mapping of charity name → Stripe Connect account ID so the frontend can update the campaign data file.', MUTED);
  note('Without correct account IDs, donations are not recorded in the DB (server-side warning only).');
});

// ══════════════════════════════════════════════
// 요청 4: 단체 등록번호 필드
// ══════════════════════════════════════════════
section('5', 'Add charity_registration_no to Donations API', '🟢 LOW', GREEN, BG, () => {
  y += 2;
  para('NZ donation receipts (required for IRD tax credit claims) must include the charity\'s Charities Services registration number (CC number). Currently this field is not included in the donations API response.');
  row('Endpoint:', 'GET /api/v1/me/donations');
  row('Missing field:', 'charity_registration_no (e.g. "CC12345")');
  para('Requested response shape (addition only):', MUTED);
  codeBlock(`{\n  "charity_display_name": "Auckland City Mission",\n  "charity_registration_no": "CC12345",   // ← ADD THIS\n  "donation_amount_minor": 5000,\n  ...\n}`);
  note('Currently receipts show "CC No: Pending". This is cosmetic but important for IRD compliance.');
});

// ══════════════════════════════════════════════
// 요청 5: 최소 기부금 백엔드 검증
// ══════════════════════════════════════════════
section('6', 'Backend Validation: Minimum Donation $20', '🟢 LOW', GREEN, BG, () => {
  y += 2;
  para('The frontend enforces a minimum donation of NZD $20 (per business decision). However, a user calling the API directly (bypassing the UI) could submit a smaller amount. Please add server-side validation.');
  row('Endpoint:', 'POST /api/v1/checkout/donations');
  row('Rule:', 'amount < 20 → HTTP 400 with error.code = "minimum-amount-not-met"');
  codeBlock(`// Suggested error response\n{\n  "error": {\n    "code": "minimum-amount-not-met",\n    "message": "Minimum donation amount is $20"\n  }\n}`);
});

// ══════════════════════════════════════════════
// 미결 사항
// ══════════════════════════════════════════════
if (y > 230) { doc.addPage(); y = 20; }
hline(y); y += 8;
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
rgb(TEAL);
doc.text('OPEN QUESTION — Requires Decision', M, y);
y += 8;

fill(BG_WARN);
doc.rect(M, y, CW, 22, 'F');
doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
doc.rect(M, y, 2, 22, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(130, 90, 20);
doc.text('Tax Receipt Amount Basis', M + 6, y + 7);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
const qLines = doc.splitTextToSize(
  'What amount should appear on NZ donation tax receipts? Option A: Donor\'s payment amount (e.g. $50.00). Option B: Charity\'s net received amount after fees (e.g. $47.37 after Stripe + platform fee). NZ IRD guidance preferred. Currently using Option A.',
  CW - 12,
);
qLines.forEach((line, i) => doc.text(line, M + 6, y + 13 + i * 4.5));
y += 28;

// ── 푸터 ─────────────────────────────────────
hline(y); y += 6;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
rgb(MUTED);
doc.text('DearGiver Frontend Team  |  deargiver.nz  |  For internal use only', W / 2, y, { align: 'center' });
y += 4.5;
doc.text(`Generated on ${today()}. Please direct questions to the frontend team lead.`, W / 2, y, { align: 'center' });

// ── 저장 ─────────────────────────────────────
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
const buffer = Buffer.from(doc.output('arraybuffer'));
writeFileSync(OUTPUT_PATH, buffer);
console.log(`✅ PDF saved to: ${OUTPUT_PATH}`);
