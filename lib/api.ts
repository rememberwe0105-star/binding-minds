/**
 * DearGiver — 백엔드 API 클라이언트 래퍼
 *
 * 백엔드 REST API (/api/v1) 와 통신하기 위한 인증 래퍼.
 * Firebase ID 토큰을 자동으로 Bearer 헤더에 포함합니다.
 *
 * @see API_FOR_FRONTEND_DEVELOPERS.md
 */

import { auth } from '@/lib/firebase';

// ---------------------------------------------------------------------------
// 환경 변수
// ---------------------------------------------------------------------------

/**
 * 백엔드 API 베이스 URL.
 * - 클라이언트 환경: 브라우저 보안 정책(Mixed Content) 회피를 위해 Next.js 프록시(/api/proxy) 사용
 * - 서버 환경: 직접 API 호출
 */
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/proxy' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://libertron.iptime.org:8787');

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/** 백엔드 공통 에러 응답 */
export interface ApiError {
  code: string;
  message: string;
  detail?: string;
}

/** 사용자 정보 (서비스 DB) */
export interface ServiceUser {
  id: number;
  email: string;
  name: string;
  status: string;
}

/** GET /me/registration 응답 — 등록됨 */
export interface RegistrationFound {
  registered: true;
  user: ServiceUser;
}

/** GET /me/registration 응답 — 미등록 */
export interface RegistrationNotFound {
  registered: false;
  needsProfileCompletion: true;
  suggestedEmail: string;
  suggestedName: string;
}

export type RegistrationResponse = RegistrationFound | RegistrationNotFound;

/** POST /me/registration 응답 */
export interface RegistrationResult {
  ok: true;
  alreadyRegistered: boolean;
  user: ServiceUser;
}

/** POST /checkout/donations 응답 */
export interface CheckoutSession {
  sessionId: string;
  url: string;
}

/** GET /me/donations 응답 */
export interface DonationsPage {
  page: number;
  pageSize: number;
  total: number;
  items: DonationItem[];
}

/** 기부 내역 개별 항목 */
export interface DonationItem {
  donation_amount_minor: number;
  currency_code: string;
  donation_status: string;
  paid_at: string | null;
  created_at: string | null;
  charity_display_name: string;
  receipt_no?: string;
  receipt_status?: string;
  [key: string]: unknown; // 백엔드 추가 필드 대비
}

// ---------------------------------------------------------------------------
// 헬퍼: Firebase ID 토큰 획득
// ---------------------------------------------------------------------------

async function getIdToken(forceRefresh = false): Promise<string> {
  if (!auth) {
    throw new Error('Firebase가 설정되지 않았습니다.');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  return user.getIdToken(forceRefresh);
}

// ---------------------------------------------------------------------------
// 코어: 인증 fetch 래퍼
// ---------------------------------------------------------------------------

/**
 * 백엔드 API 에 인증된 요청을 보냅니다.
 *
 * - 자동으로 Firebase ID 토큰을 Bearer 헤더에 포함
 * - 401 발생 시 토큰 갱신 후 1회 재시도
 * - 에러 시 ApiError 구조를 파싱하여 throw
 *
 * @param path  - API 경로 (예: '/api/v1/me/registration')
 * @param options - fetch 옵션 (method, body 등)
 * @returns 파싱된 JSON 응답
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getIdToken();

  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  let res = await fetch(url, { ...options, headers });

  // 401 → 토큰 갱신 후 1회 재시도
  if (res.status === 401) {
    const freshToken = await getIdToken(true);
    headers.Authorization = `Bearer ${freshToken}`;
    res = await fetch(url, { ...options, headers });
  }

  // 응답 파싱
  const text = await res.text();
  let body: T & { error?: ApiError };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`서버 응답을 파싱할 수 없습니다: ${text.slice(0, 200)}`);
  }

  // 에러 처리
  if (!res.ok) {
    const err = body?.error;
    const message = err?.message ?? `API 오류 (${res.status})`;
    const error = new Error(message) as Error & {
      code?: string;
      status?: number;
      detail?: string;
    };
    error.code = err?.code;
    error.status = res.status;
    error.detail = err?.detail;
    throw error;
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// API 함수들
// ---------------------------------------------------------------------------

/**
 * 서비스 DB 등록 여부 조회
 * @see API_FOR_FRONTEND_DEVELOPERS.md §5.1
 */
export async function getRegistration(): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>('/api/v1/me/registration');
}

/**
 * 서비스 DB에 사용자 등록
 * @see API_FOR_FRONTEND_DEVELOPERS.md §5.2
 */
export async function postRegistration(data: {
  email: string;
  name: string;
}): Promise<RegistrationResult> {
  return apiFetch<RegistrationResult>('/api/v1/me/registration', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Stripe Checkout 세션 생성
 * @see API_FOR_FRONTEND_DEVELOPERS.md §5.3
 */
export async function createCheckoutSession(data: {
  amount: number;
  charityAccountId: string;
  charityName?: string;
  frequency?: 'one-time' | 'monthly';
}): Promise<CheckoutSession> {
  return apiFetch<CheckoutSession>('/api/v1/checkout/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 기부 내역 조회 (페이지네이션)
 * @see API_FOR_FRONTEND_DEVELOPERS.md §5.4
 */
export async function getDonations(
  page = 1,
  pageSize = 20,
): Promise<DonationsPage> {
  return apiFetch<DonationsPage>(
    `/api/v1/me/donations?page=${page}&pageSize=${pageSize}`,
  );
}

/**
 * 서버 헬스 체크 (인증 불필요)
 * @see API_FOR_FRONTEND_DEVELOPERS.md §4
 */
export async function checkHealth(): Promise<{ ok: boolean; service: string }> {
  const url = `${API_BASE_URL}/health`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// 유틸: 금액 변환 (minor → display)
// ---------------------------------------------------------------------------

/**
 * 센트(minor) 단위를 달러(display) 단위로 변환
 * @example minorToDisplay(5000) → 50.00
 */
export function minorToDisplay(amountMinor: number): number {
  return amountMinor / 100;
}

/**
 * 달러(display) 단위를 센트(minor) 단위로 변환
 * @example displayToMinor(50) → 5000
 */
export function displayToMinor(amountDisplay: number): number {
  return Math.round(amountDisplay * 100);
}
