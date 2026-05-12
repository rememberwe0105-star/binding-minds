import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 런타임에만 초기화 (빌드 타임 에러 방지)
function getStripeServer() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeServer();

    const body = await req.json();
    const {
      amount,        // NZD 단위 (정수, e.g. 50)
      campaignName,  // 캠페인 이름
      campaignSlug,  // 캠페인 슬러그
      donorName,     // 기부자 이름
      donorEmail,    // 기부자 이메일
      isMonthly,     // 월정기 여부
      anonymous,     // 익명 여부
      taxReceipt,    // 세금 영수증 요청 여부
      message,       // 기부 메시지
    } = body;

    // 유효성 검사
    if (!amount || amount < 5) {
      return NextResponse.json(
        { error: 'Minimum donation amount is $5 NZD' },
        { status: 400 }
      );
    }

    // 센트 단위로 변환 (Stripe는 센트 단위)
    const amountInCents = Math.round(amount * 100);

    // PaymentIntent 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'nzd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        campaign_name: campaignName || '',
        campaign_slug: campaignSlug || '',
        donor_name: anonymous ? 'Anonymous' : (donorName || ''),
        donor_email: donorEmail || '',
        is_monthly: isMonthly ? 'true' : 'false',
        anonymous: anonymous ? 'true' : 'false',
        tax_receipt: taxReceipt ? 'true' : 'false',
        message: message || '',
      },
      receipt_email: donorEmail || undefined,
      description: `Donation to ${campaignName}${isMonthly ? ' (Monthly)' : ''}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error('Stripe PaymentIntent creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
