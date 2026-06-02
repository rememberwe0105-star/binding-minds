import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// ── 스팸 방지: 메모리 캐시 (서버 재시작 시 초기화) ──
const sentLog = new Map<string, { lastSent: number; monthCount: number; monthStart: number }>();

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24시간
const MAX_PER_MONTH = 3;

function canSend(charityId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const record = sentLog.get(charityId);

  if (!record) return { allowed: true };

  // 24시간 쿨다운
  if (now - record.lastSent < COOLDOWN_MS) {
    return { allowed: false, reason: 'cooldown' };
  }

  // 월 최대 발송 체크
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  if (now - record.monthStart > monthMs) {
    // 새 달 시작
    record.monthCount = 0;
    record.monthStart = now;
  }

  if (record.monthCount >= MAX_PER_MONTH) {
    return { allowed: false, reason: 'monthly_limit' };
  }

  return { allowed: true };
}

function recordSend(charityId: string) {
  const now = Date.now();
  const record = sentLog.get(charityId);

  if (!record) {
    sentLog.set(charityId, { lastSent: now, monthCount: 1, monthStart: now });
  } else {
    record.lastSent = now;
    record.monthCount += 1;
    sentLog.set(charityId, record);
  }
}

// ── 이메일 HTML 생성 ──
function buildEmailHtml({
  donorName,
  charityName,
  charitySlug,
}: {
  donorName: string;
  charityName: string;
  charitySlug: string;
}) {
  const claimUrl = `https://deargiver.co.nz/charity/apply`;
  const profileUrl = `https://deargiver.co.nz/charities/${charitySlug}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Someone wants to support ${charityName}!</title>
</head>
<body style="margin:0; padding:0; background:#f8f7f5; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #4A7C71 0%, #5a8f83 100%); padding:32px 40px; text-align:center;">
              <h1 style="color:#ffffff; font-size:24px; margin:0 0 4px 0; font-weight:700;">🌿 DearGiver</h1>
              <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">Every Giver Matters</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:18px; color:#2c2c2c; margin:0 0 24px 0; line-height:1.6;">
                Hi <strong>${charityName}</strong> team 👋
              </p>

              <p style="font-size:15px; color:#555; margin:0 0 16px 0; line-height:1.7;">
                Great news! <strong style="color:#C4724A;">${donorName}</strong> wants to donate to 
                <strong>${charityName}</strong> — but they can't yet because your organisation 
                hasn't claimed its profile on DearGiver.
              </p>

              <p style="font-size:15px; color:#555; margin:0 0 28px 0; line-height:1.7;">
                DearGiver is a modern donation platform built for New Zealand charities. 
                Claiming your profile is <strong>free</strong> and takes less than 5 minutes.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display:inline-block; background:#4A7C71; color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:50px; font-size:16px; font-weight:600; letter-spacing:0.3px;">
                      Claim Your Profile →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5; border-radius:12px; padding:24px; margin:0 0 28px 0;">
                <tr>
                  <td style="padding:24px;">
                    <p style="font-size:14px; color:#2c2c2c; font-weight:700; margin:0 0 12px 0;">What you get:</p>
                    <p style="font-size:14px; color:#555; margin:0 0 8px 0; line-height:1.6;">✓ Accept donations with <strong>0% platform fee</strong></p>
                    <p style="font-size:14px; color:#555; margin:0 0 8px 0; line-height:1.6;">✓ Automatic NZ tax receipts for donors</p>
                    <p style="font-size:14px; color:#555; margin:0 0 8px 0; line-height:1.6;">✓ Your own charity dashboard & analytics</p>
                    <p style="font-size:14px; color:#555; margin:0; line-height:1.6;">✓ Appear in NZ's growing giving community</p>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px; color:#555; margin:0 0 8px 0; line-height:1.7;">
                Don't keep your supporters waiting! 🌿
              </p>

              <p style="font-size:14px; color:#999; margin:32px 0 0 0;">
                — The DearGiver Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7f5; padding:20px 40px; border-top:1px solid #eee;">
              <p style="font-size:11px; color:#999; margin:0 0 4px 0; line-height:1.5;">
                This email was sent because a donor expressed interest in supporting 
                <a href="${profileUrl}" style="color:#4A7C71; text-decoration:none;">${charityName}</a> 
                through DearGiver.
              </p>
              <p style="font-size:11px; color:#999; margin:0; line-height:1.5;">
                If you believe this was sent in error or wish to opt out, please reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── POST Handler ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      charityId,
      charityName,
      charitySlug,
      charityEmail,
      donorName,
    } = body as {
      charityId: string;
      charityName: string;
      charitySlug: string;
      charityEmail?: string;
      donorName: string;
    };

    // Validation
    if (!charityId || !charityName || !donorName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 스팸 방지 체크
    const spamCheck = canSend(charityId);
    if (!spamCheck.allowed) {
      // 이메일은 안 보내지만 관심 표현은 성공으로 처리
      return NextResponse.json({
        ok: true,
        emailSent: false,
        reason: spamCheck.reason,
        message: 'Interest recorded. Email already sent recently.',
      });
    }

    // 이메일 주소가 없으면 기록만 하고 성공 반환
    if (!charityEmail) {
      return NextResponse.json({
        ok: true,
        emailSent: false,
        reason: 'no_email',
        message: 'Interest recorded. No contact email available for this charity.',
      });
    }

    // Resend API Key 확인
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('[interest-notify] RESEND_API_KEY not set. Email skipped.');
      return NextResponse.json({
        ok: true,
        emailSent: false,
        reason: 'no_api_key',
        message: 'Interest recorded. Email service not configured.',
      });
    }

    // 이메일 발송
    const resend = new Resend(resendApiKey);
    const fromAddress = process.env.INTEREST_EMAIL_FROM || 'DearGiver <onboarding@resend.dev>';

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: charityEmail,
      subject: `🌿 ${donorName} is waiting to support ${charityName} on DearGiver!`,
      html: buildEmailHtml({ donorName, charityName, charitySlug }),
    });

    if (error) {
      console.error('[interest-notify] Resend error:', error);
      // 이메일 실패해도 관심 표현은 성공
      return NextResponse.json({
        ok: true,
        emailSent: false,
        reason: 'send_failed',
        message: 'Interest recorded. Email delivery failed.',
      });
    }

    // 발송 기록
    recordSend(charityId);

    return NextResponse.json({
      ok: true,
      emailSent: true,
      message: `Interest recorded and ${charityName} has been notified!`,
    });

  } catch (err) {
    console.error('[interest-notify] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
