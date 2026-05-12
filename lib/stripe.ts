import { loadStripe } from '@stripe/stripe-js';

// 클라이언트 사이드 Stripe 인스턴스 (Singleton)
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
