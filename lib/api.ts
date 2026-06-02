/**
 * DearGiver — 백엔드 API 클라이언트 래퍼
 *
 * 백엔드 REST API (/api/v1) 와 통신하기 위한 인증 래퍼.
 * Firebase ID 토큰을 자동으로 Bearer 헤더에 포함합니다.
 *
 * @see API_FOR_FRONTEND_DEVELOPERS.md
 * @see deargiver_api_specification.md
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
  role?: 'donor' | 'charity_admin' | 'platform_admin';
  /** charity_admin 역할일 때 소속 단체 ID */
  charity_id?: number;
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
  id?: number;
  donation_amount_minor: number;
  platform_fee_amount_minor?: number;
  charity_net_amount_minor?: number;
  currency_code: string;
  donation_status: string;
  paid_at: string | null;
  created_at: string | null;
  charity_display_name: string;
  charity_id?: number;
  cc_number?: string;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  receipt_no?: string;
  receipt_status?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Charity Apply 타입 (공개 API)
// ---------------------------------------------------------------------------

/** POST /charities/apply 요청 */
export interface CharityApplyRequest {
  legal_name: string;
  display_name: string;
  cc_number: string;
  category: string;
  bank_account_number: string;
  ird_number: string;
  gst_registered: 'yes' | 'no' | 'exempt';
  contact_name: string;
  contact_email: string;
}

/** POST /charities/apply 응답 */
export interface CharityApplyResponse {
  ok: true;
  message: string;
  applicationId: number;
}

// ---------------------------------------------------------------------------
// Charity Dashboard 타입 (charity_admin)
// ---------------------------------------------------------------------------

/** GET /charity/dashboard/analytics 응답 */
export interface CharityAnalytics {
  charity_id: number;
  total_donations: number;
  total_amount_minor: number;
  avg_donation_minor: number;
  donor_count: number;
  repeat_donor_ratio: number;
  monthly_trend: { month: string; amount_minor: number; count: number }[];
  by_project: { name: string; value_minor: number }[];
}

/** 단체 기부 내역 아이템 (단체 관점) */
export interface CharityDonationItem {
  id: number;
  donation_status: string;
  currency_code: string;
  donation_amount_minor: number;
  charity_net_amount_minor: number;
  paid_at: string | null;
  is_anonymous: number;
  donor_name: string;
  donor_email: string | null;
  [key: string]: unknown;
}

/** GET /charities/:id/donations 응답 */
export interface CharityDonationsPage {
  page: number;
  pageSize: number;
  total: number;
  items: CharityDonationItem[];
}

/** PATCH /charities/:id 요청 */
export interface CharityProfileUpdate {
  display_name?: string;
  description?: string;
  website_url?: string;
}

/** 캠페인/프로젝트 아이템 */
export interface CharityProject {
  id: number;
  title: string;
  description: string;
  goal_amount_minor: number;
  current_amount_minor: number;
  currency_code: string;
  project_status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  cover_image_url?: string;
  images?: {
    url: string;
    thumbnailUrl?: string;
    isPrimary: boolean;
    order: number;
  }[];
}

/** 파일 업로드 응답 */
export interface FileUploadResponse {
  ok: true;
  imageUrl: string;
  thumbnailUrl?: string;
}

/** 다중 이미지 업로드 응답 */
export interface MultiImageUploadResponse {
  ok: true;
  images: {
    url: string;
    thumbnailUrl?: string;
    isPrimary: boolean;
    order: number;
  }[];
}

/** 문서 업로드 응답 */
export interface DocumentUploadResponse {
  ok: true;
  document: {
    id: number;
    title: string;
    document_type: string;
    file_url: string;
    file_size: number;
    uploaded_at: string;
  };
}

/** GET /charities/:id/projects 응답 */
export interface CharityProjectsResponse {
  items: CharityProject[];
}

/** POST /charities/:id/projects 요청 */
export interface CreateProjectRequest {
  title: string;
  description: string;
  goal_amount_minor: number;
  currency_code: 'NZD' | 'AUD' | 'USD';
  start_date: string;
  end_date: string;
}

// ---------------------------------------------------------------------------
// Platform Admin 타입
// ---------------------------------------------------------------------------

/** 단체 신청 아이템 */
export interface AdminCharityApplication {
  id: number;
  legal_name: string;
  display_name: string;
  cc_number: string;
  category: string;
  contact_name: string;
  contact_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'consultation';
  applied_at: string;
}

/** GET /admin/charities 응답 */
export interface AdminCharitiesResponse {
  page: number;
  pageSize: number;
  total: number;
  items: AdminCharityApplication[];
}

/** PATCH /admin/charities/:id/status 승인 응답 */
export interface AdminCharityApprovalResponse {
  ok: true;
  message: string;
  applicationId: number;
  charityId?: number;
  stripeAccountId?: string;
  onboardingUrl?: string;
  onboardingExpiresAt?: string;
}

/** 관리자 기부 아이템 */
export interface AdminDonation {
  id: number;
  donor_name: string;
  donor_email: string;
  charity_name: string;
  charity_id: number;
  project_title?: string;
  project_id?: number;
  amount_minor: number;
  currency_code: string;
  platform_fee_minor: number;
  net_amount_minor: number;
  status: 'succeeded' | 'pending' | 'refunded' | 'disputed' | 'failed';
  stripe_payment_intent_id?: string;
  created_at: string;
}

/** GET /admin/donations 응답 */
export interface AdminDonationsResponse {
  page: number;
  pageSize: number;
  total: number;
  total_amount_minor: number;
  items: AdminDonation[];
}

/** GET /admin/analytics/platform 응답 */
export interface PlatformAnalytics {
  total_donations: number;
  total_amount_minor: number;
  total_platform_fee_minor: number;
  avg_donation_minor: number;
  active_charities: number;
  active_donors: number;
  pending_applications: number;
  monthly_trend: {
    month: string;
    donation_count: number;
    donations_minor: number;
    new_donors: number;
  }[];
}

/** Admin 기부자 아이템 */
export interface AdminDonorItem {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'flagged' | 'suspended';
  role: string;
  created_at: string;
  last_login_at: string | null;
  donation_count: number;
  total_donated_minor: number;
}

/** GET /admin/donors 응답 */
export interface AdminDonorsResponse {
  page: number;
  page_size: number;
  total: number;
  items: AdminDonorItem[];
}

/** 범용 OK 응답 */
export interface GenericOkResponse {
  ok: true;
  message: string;
  [key: string]: unknown;
}

// ── Admin: Project Management ──

export type AdminProjectStatus = 'pending_review' | 'active' | 'rejected' | 'suspended' | 'completed' | 'cancelled' | 'draft';

export interface AdminProject {
  id: number;
  charity_id: number;
  charity_name: string;
  title: string;
  description: string;
  goal_amount_minor: number;
  current_amount_minor: number;
  currency_code: string;
  project_status: AdminProjectStatus;
  start_date: string;
  end_date: string;
  cover_image_url?: string;
  donor_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface AdminProjectsResponse {
  page: number;
  pageSize: number;
  total: number;
  items: AdminProject[];
}

// ── Admin: Active Charities ──

export interface AdminActiveCharity {
  id: number;
  legal_name: string;
  display_name: string;
  cc_number: string;
  category: string;
  contact_email: string;
  status: 'active' | 'suspended' | 'deactivated';
  stripe_status: 'pending' | 'active' | 'restricted' | 'disabled';
  approved_at: string;
  total_received_minor: number;
  active_projects: number;
  total_projects: number;
  donor_count: number;
  last_activity_at?: string;
}

export interface AdminActiveCharitiesResponse {
  page: number;
  pageSize: number;
  total: number;
  items: AdminActiveCharity[];
}

// ── Admin: Finance ──

export interface AdminCharitySettlement {
  charity_id: number;
  charity_name: string;
  total_received_minor: number;
  total_fees_minor: number;
  total_settled_minor: number;
  pending_settlement_minor: number;
  stripe_balance_minor: number;
  next_payout_date?: string;
  stripe_status: 'active' | 'restricted' | 'disabled';
}

export interface AdminFinanceOverview {
  total_platform_revenue_minor: number;
  total_donations_minor: number;
  total_settled_minor: number;
  pending_settlements_minor: number;
  avg_fee_rate: number;
  settlements: AdminCharitySettlement[];
}

// ── Admin: Activity Log ──

export interface AdminActivityItem {
  id: string;
  type: 'charity_approved' | 'charity_rejected' | 'donation_received' | 'project_created' | 'project_reviewed' | 'donor_suspended' | 'refund_issued' | 'system_event';
  message: string;
  actor?: string;
  target_id?: number;
  target_type?: string;
  created_at: string;
}

export interface AdminActivityResponse {
  items: AdminActivityItem[];
  total: number;
}

// ── Admin: Settings ──

export interface PlatformSettings {
  platform_fee_rate: number;
  min_donation_minor: number;
  max_donation_minor: number;
  categories: string[];
  regions: string[];
  auto_approve_projects: boolean;
  require_stripe_onboarding: boolean;
}

// ── Admin: Notifications ──

export interface AdminNotification {
  id: string;
  type: 'new_application' | 'project_review' | 'large_donation' | 'refund_request' | 'stripe_issue' | 'system';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface AdminNotificationsResponse {
  items: AdminNotification[];
  unread_count: number;
}

// ── Admin: Message ──

export interface AdminMessage {
  recipient_type: 'charity' | 'donor';
  recipient_id: number;
  subject: string;
  body: string;
  template_id?: string;
}

/** POST /admin/messages 응답 (B-3 보강) */
export interface AdminMessageResponse {
  ok: true;
  message_id: string;
  delivered_at: string;
}

// ── 통합 알림 시스템 (역할별) ──

/** Donor 알림 종류 */
export type DonorNotificationType =
  | 'donation_confirmed'
  | 'receipt_ready'
  | 'badge_unlocked'
  | 'project_milestone'
  | 'campaign_update'
  | 'tax_reminder'
  | 'monthly_report'
  | 'charity_news';

/** Charity 알림 종류 */
export type CharityNotificationType =
  | 'donation_received'
  | 'project_approved'
  | 'project_rejected'
  | 'project_suspended'
  | 'fundraising_milestone'
  | 'settlement_complete'
  | 'stripe_issue'
  | 'admin_message'
  | 'document_expiry'
  | 'refund_issued';

/** Admin 알림 종류 (기존 AdminNotification.type 확장) */
export type AdminNotificationType = AdminNotification['type'] | 'daily_summary' | 'anomaly_detection';

/** 통합 알림 인터페이스 */
export interface UserNotification {
  id: string;
  type: DonorNotificationType | CharityNotificationType | AdminNotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface UserNotificationsResponse {
  items: UserNotification[];
  unread_count: number;
}

/** 알림 설정 인터페이스 */
export interface NotificationPreferences {
  // Donor
  donation_receipts: boolean;
  monthly_report: boolean;
  campaign_updates: boolean;
  tax_reminders: boolean;
  badge_notifications: boolean;
  milestone_updates: boolean;
  charity_news: boolean;
  // Charity
  donation_received: boolean;
  project_status_change: boolean; // 끌 수 없음
  fundraising_milestones: boolean;
  settlement_complete: boolean;
  stripe_alerts: boolean;          // 끌 수 없음
  admin_messages: boolean;          // 끌 수 없음
  document_expiry: boolean;
  refund_alerts: boolean;
  // Admin
  new_applications: boolean;        // 끌 수 없음
  project_reviews: boolean;         // 끌 수 없음
  large_donations: boolean;
  refund_requests: boolean;
  stripe_issues: boolean;
  daily_summary: boolean;
  anomaly_detection: boolean;       // 끌 수 없음
  system_events: boolean;
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

/**
 * 백엔드 API에 multipart/form-data 요청을 보냅니다 (파일 업로드용).
 * Content-Type 헤더를 설정하지 않습니다 (브라우저가 boundary를 자동 생성).
 */
export async function apiFetchMultipart<T = unknown>(
  path: string,
  formData: FormData,
  method: string = 'POST',
): Promise<T> {
  const token = await getIdToken();
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    // NOTE: Do NOT set Content-Type — browser sets it with boundary for multipart
  };

  let res = await fetch(url, { method, headers, body: formData });

  // 401 → token refresh + retry
  if (res.status === 401) {
    const freshToken = await getIdToken(true);
    headers.Authorization = `Bearer ${freshToken}`;
    res = await fetch(url, { method, headers, body: formData });
  }

  const text = await res.text();
  let body: T & { error?: ApiError };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`서버 응답을 파싱할 수 없습니다: ${text.slice(0, 200)}`);
  }

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

/**
 * 인증 없이 JSON POST 요청을 보냅니다 (공개 API 용).
 */
export async function publicFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  const text = await res.text();
  let body: T & { error?: ApiError };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`서버 응답을 파싱할 수 없습니다: ${text.slice(0, 200)}`);
  }

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
// API 함수들 — 인증 및 내 정보
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
 * @see deargiver_api_specification.md §2.2
 */
export async function createCheckoutSession(data: {
  amount: number;
  currency: 'NZD' | 'AUD' | 'USD';
  charityAccountId: string;
  charityName?: string;
  coverStripeFee?: boolean;
  addSupport?: boolean;
  recurring?: boolean;
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
// API 함수들 — Charity Apply (공개 API)
// ---------------------------------------------------------------------------

/**
 * 신규 기부 단체 가입 신청 (로그인 불필요)
 * @see deargiver_api_specification.md §2.3
 */
export async function applyCharity(
  data: CharityApplyRequest,
): Promise<CharityApplyResponse> {
  return publicFetch<CharityApplyResponse>('/api/v1/charities/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// API 함수들 — Charity Dashboard (charity_admin)
// ---------------------------------------------------------------------------

/**
 * 단체 통계 지표 조회
 * @see deargiver_api_specification.md §2.4-1
 */
export async function getCharityAnalytics(): Promise<CharityAnalytics> {
  return apiFetch<CharityAnalytics>('/api/v1/charity/dashboard/analytics');
}

/**
 * 단체 수령 기부 내역 조회
 * @see deargiver_api_specification.md §2.4-2
 */
export async function getCharityDonations(
  charityId: number,
  page = 1,
  pageSize = 20,
): Promise<CharityDonationsPage> {
  return apiFetch<CharityDonationsPage>(
    `/api/v1/charities/${charityId}/donations?page=${page}&pageSize=${pageSize}`,
  );
}

/**
 * 단체 프로필 정보 수정
 * @see deargiver_api_specification.md §2.4-3
 */
export async function updateCharityProfile(
  charityId: number,
  data: CharityProfileUpdate,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(`/api/v1/charities/${charityId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * 캠페인/프로젝트 목록 조회
 * @see deargiver_api_specification.md §2.4-4
 */
export async function getCharityProjects(
  charityId: number,
): Promise<CharityProjectsResponse> {
  return apiFetch<CharityProjectsResponse>(
    `/api/v1/charities/${charityId}/projects`,
  );
}

/**
 * 신규 캠페인 등록
 * @see deargiver_api_specification.md §2.4-4
 */
export async function createCharityProject(
  charityId: number,
  data: CreateProjectRequest,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/charities/${charityId}/projects`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

/**
 * 캠페인 수정
 * @see deargiver_api_specification.md §2.4-4
 */
export async function updateCharityProject(
  charityId: number,
  projectId: number,
  data: Partial<CreateProjectRequest>,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/charities/${charityId}/projects/${projectId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

/**
 * 캠페인 삭제 (Soft Delete)
 * @see deargiver_api_specification.md §2.4-4
 */
export async function deleteCharityProject(
  charityId: number,
  projectId: number,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/charities/${charityId}/projects/${projectId}`,
    { method: 'DELETE' },
  );
}

// ---------------------------------------------------------------------------
// API 함수들 — 파일 업로드 (charity_admin)
// ---------------------------------------------------------------------------

/**
 * 단체 로고 업로드
 * @see FILE_UPLOAD_API_REQUEST.md §1
 */
export async function uploadCharityLogo(
  charityId: number,
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetchMultipart<FileUploadResponse>(
    `/api/v1/charities/${charityId}/logo`,
    formData,
  );
}

/**
 * 단체 배너 이미지 업로드
 * @see FILE_UPLOAD_API_REQUEST.md §2
 */
export async function uploadCharityBanner(
  charityId: number,
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetchMultipart<FileUploadResponse>(
    `/api/v1/charities/${charityId}/banner`,
    formData,
  );
}

/**
 * 프로젝트 커버 이미지 업로드
 * @see FILE_UPLOAD_API_REQUEST.md §3
 */
export async function uploadProjectCoverImage(
  charityId: number,
  projectId: number,
  file: File,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetchMultipart<FileUploadResponse>(
    `/api/v1/charities/${charityId}/projects/${projectId}/image`,
    formData,
  );
}

/**
 * 프로젝트 다중 이미지 업로드 (최대 10장, 대표사진 지정)
 */
export async function uploadProjectImages(
  charityId: number,
  projectId: number,
  files: File[],
  primaryIndex: number = 0,
): Promise<MultiImageUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  formData.append('primary_index', String(primaryIndex));
  return apiFetchMultipart<MultiImageUploadResponse>(
    `/api/v1/charities/${charityId}/projects/${projectId}/images`,
    formData,
  );
}

/**
 * 단체 갤러리 이미지 업로드 (최대 10장, 대표사진 지정)
 */
export async function uploadCharityImages(
  charityId: number,
  files: File[],
  primaryIndex: number = 0,
): Promise<MultiImageUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  formData.append('primary_index', String(primaryIndex));
  return apiFetchMultipart<MultiImageUploadResponse>(
    `/api/v1/charities/${charityId}/images`,
    formData,
  );
}

/**
 * 단체 문서 업로드
 * @see FILE_UPLOAD_API_REQUEST.md §4
 */
export async function uploadCharityDocument(
  charityId: number,
  file: File,
  documentType: 'annual_report' | 'financial_statement' | 'impact_report' | 'other',
  title?: string,
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  if (title) formData.append('title', title);
  return apiFetchMultipart<DocumentUploadResponse>(
    `/api/v1/charities/${charityId}/documents`,
    formData,
  );
}

// ---------------------------------------------------------------------------
// API 함수들 — Platform Admin
// ---------------------------------------------------------------------------

/**
 * 단체 신청 목록 조회
 * @see deargiver_api_specification.md §2.5-1
 */
export async function getAdminCharities(
  status = 'pending',
  page = 1,
  pageSize = 30,
): Promise<AdminCharitiesResponse> {
  return apiFetch<AdminCharitiesResponse>(
    `/api/v1/admin/charities?status=${status}&page=${page}&page_size=${pageSize}`,
  );
}

/**
 * 처리 완료된 단체 신청 이력 조회
 */
export async function getAdminCharitiesHistory(
  page = 1,
  pageSize = 30,
): Promise<AdminCharitiesResponse> {
  return apiFetch<AdminCharitiesResponse>(
    `/api/v1/admin/charities/history?page=${page}&page_size=${pageSize}`,
  );
}

/**
 * 단체 신청 승인/거절
 * @see deargiver_api_specification.md §2.5-2
 */
export async function updateCharityApplicationStatus(
  id: number,
  data: { status: 'approved' | 'rejected' | 'consultation'; admin_note?: string },
): Promise<AdminCharityApprovalResponse> {
  return apiFetch<AdminCharityApprovalResponse>(
    `/api/v1/admin/charities/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

/**
 * 플랫폼 전체 성장 지표 및 통계
 * @see deargiver_api_specification.md §2.5-3
 */
export async function getAdminPlatformAnalytics(): Promise<PlatformAnalytics> {
  return apiFetch<PlatformAnalytics>('/api/v1/admin/analytics/platform');
}

/**
 * 기부자 목록 조회
 * @see deargiver_api_specification.md §2.5-4
 */
export async function getAdminDonors(
  page = 1,
  pageSize = 30,
): Promise<AdminDonorsResponse> {
  return apiFetch<AdminDonorsResponse>(
    `/api/v1/admin/donors?page=${page}&page_size=${pageSize}`,
  );
}

/**
 * 기부자 상태 변경
 * @see deargiver_api_specification.md §2.5-4
 */
export async function updateDonorStatus(
  id: number,
  data: { status: 'active' | 'flagged' | 'suspended'; reason?: string },
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/admin/donors/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

// ── Admin: Project Management ──

/**
 * 관리자 프로젝트 목록 조회 (상태별 필터링 가능)
 */
export async function getAdminProjects(
  status?: AdminProjectStatus,
  page = 1,
  pageSize = 30,
): Promise<AdminProjectsResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set('status', status);
  return apiFetch<AdminProjectsResponse>(`/api/v1/admin/projects?${params}`);
}

/**
 * 관리자 프로젝트 상태 변경 (승인/거절/정지 등)
 */
export async function updateAdminProjectStatus(
  projectId: number,
  data: { status: AdminProjectStatus; admin_note?: string },
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/admin/projects/${projectId}/status`,
    { method: 'PATCH', body: JSON.stringify(data) },
  );
}

// ── Admin: Active Charities ──

/**
 * 활성 단체 목록 조회
 */
export async function getAdminActiveCharities(
  page = 1,
  pageSize = 30,
): Promise<AdminActiveCharitiesResponse> {
  return apiFetch<AdminActiveCharitiesResponse>(
    `/api/v1/admin/charities/active?page=${page}&page_size=${pageSize}`,
  );
}

/**
 * 특정 단체의 프로젝트 목록 조회
 */
export async function getAdminCharityProjects(
  charityId: number,
  page = 1,
  pageSize = 30,
): Promise<AdminProjectsResponse> {
  return apiFetch<AdminProjectsResponse>(
    `/api/v1/admin/charities/${charityId}/projects?page=${page}&page_size=${pageSize}`,
  );
}

/**
 * 단체 계정 상태 변경 (활성/정지/비활성화)
 */
export async function updateAdminCharityStatus(
  charityId: number,
  data: { status: 'active' | 'suspended' | 'deactivated'; admin_note?: string },
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/admin/charities/${charityId}/account-status`,
    { method: 'PATCH', body: JSON.stringify(data) },
  );
}

// ── Admin: Donations ──

/**
 * 관리자 기부 내역 조회 (상태/날짜 필터링 가능)
 */
export async function getAdminDonations(
  page = 1,
  pageSize = 30,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<AdminDonationsResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set('status', status);
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  return apiFetch<AdminDonationsResponse>(`/api/v1/admin/donations?${params}`);
}

/**
 * 기부 환불 처리
 */
export async function refundDonation(
  donationId: number,
  data: { reason: string; amount_minor?: number },
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/admin/donations/${donationId}/refund`,
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ── Admin: Finance ──

/**
 * 플랫폼 재무 개요 조회
 */
export async function getAdminFinanceOverview(): Promise<AdminFinanceOverview> {
  return apiFetch<AdminFinanceOverview>('/api/v1/admin/finance/overview');
}

// ── Admin: Activity Log ──

/**
 * 관리자 활동 로그 조회
 */
export async function getAdminActivityLog(
  page = 1,
  pageSize = 20,
): Promise<AdminActivityResponse> {
  return apiFetch<AdminActivityResponse>(
    `/api/v1/admin/activity?page=${page}&pageSize=${pageSize}`,
  );
}

// ── Admin: Settings ──

/**
 * 플랫폼 설정 조회
 */
export async function getAdminSettings(): Promise<PlatformSettings> {
  return apiFetch<PlatformSettings>('/api/v1/admin/settings');
}

/**
 * 플랫폼 설정 수정
 */
export async function updateAdminSettings(
  data: Partial<PlatformSettings>,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    '/api/v1/admin/settings',
    { method: 'PATCH', body: JSON.stringify(data) },
  );
}

// ── Admin: Notifications ──

/**
 * 관리자 알림 목록 조회
 */
export async function getAdminNotifications(): Promise<AdminNotificationsResponse> {
  return apiFetch<AdminNotificationsResponse>('/api/v1/admin/notifications');
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationRead(
  notificationId: string,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/admin/notifications/${notificationId}/read`,
    { method: 'PATCH' },
  );
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsRead(): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    '/api/v1/admin/notifications/read-all',
    { method: 'PATCH' },
  );
}

// ── Admin: Messaging ──

/**
 * 관리자 메시지 전송
 */
export async function sendAdminMessage(
  data: AdminMessage,
): Promise<AdminMessageResponse> {
  return apiFetch<AdminMessageResponse>(
    '/api/v1/admin/messages',
    { method: 'POST', body: JSON.stringify(data) },
  );
}

// ---------------------------------------------------------------------------
// API 함수들 — 통합 알림 시스템
// ---------------------------------------------------------------------------

/**
 * Donor 알림 목록 조회
 */
export async function getDonorNotifications(): Promise<UserNotificationsResponse> {
  return apiFetch<UserNotificationsResponse>('/api/v1/notifications');
}

/**
 * Charity 알림 목록 조회
 */
export async function getCharityNotifications(
  charityId: number,
): Promise<UserNotificationsResponse> {
  return apiFetch<UserNotificationsResponse>(
    `/api/v1/charities/${charityId}/notifications`,
  );
}

/**
 * 알림 읽음 처리 (역할 공통)
 */
export async function markUserNotificationRead(
  notificationId: string,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    `/api/v1/notifications/${notificationId}/read`,
    { method: 'PATCH' },
  );
}

/**
 * 모든 알림 읽음 처리 (역할 공통)
 */
export async function markAllUserNotificationsRead(): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    '/api/v1/notifications/read-all',
    { method: 'PATCH' },
  );
}

/**
 * 알림 설정 조회
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>('/api/v1/notifications/preferences');
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationPreferences(
  data: Partial<NotificationPreferences>,
): Promise<GenericOkResponse> {
  return apiFetch<GenericOkResponse>(
    '/api/v1/notifications/preferences',
    { method: 'PATCH', body: JSON.stringify(data) },
  );
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

// ---------------------------------------------------------------------------
// API 함수들 — 이메일 템플릿 + 영수증 (감사 이메일 자동화)
// ---------------------------------------------------------------------------

/** 감사 이메일 템플릿 */
export interface EmailTemplate {
  id: number;
  charity_id: number;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplatesResponse {
  items: EmailTemplate[];
  total: number;
}

export interface CreateEmailTemplateRequest {
  title: string;
  body: string;
  is_active?: boolean;
}

/** 영수증 다운로드 정보 */
export interface ReceiptInfo {
  receipt_no: string;
  receipt_url: string | null;
  receipt_status: 'pending' | 'generated' | 'emailed';
}

// ── 감사 이메일 템플릿 CRUD ──

const TEMPLATE_STORAGE_KEY = 'dg-email-templates';

function loadLocalTemplates(charityId: number): EmailTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${TEMPLATE_STORAGE_KEY}-${charityId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalTemplates(charityId: number, templates: EmailTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${TEMPLATE_STORAGE_KEY}-${charityId}`, JSON.stringify(templates));
  } catch { /* ignore */ }
}

/**
 * 감사 이메일 템플릿 목록 조회
 * - 백엔드 연동 시: GET /api/v1/charities/:id/email-templates
 * - 백엔드 미연동 시: localStorage fallback
 */
export async function getEmailTemplates(
  charityId: number,
): Promise<EmailTemplatesResponse> {
  try {
    return await apiFetch<EmailTemplatesResponse>(
      `/api/v1/charities/${charityId}/email-templates`,
    );
  } catch {
    // Fallback to localStorage
    const items = loadLocalTemplates(charityId);
    return { items, total: items.length };
  }
}

/**
 * 감사 이메일 템플릿 생성
 */
export async function createEmailTemplate(
  charityId: number,
  data: CreateEmailTemplateRequest,
): Promise<EmailTemplate> {
  try {
    return await apiFetch<EmailTemplate>(
      `/api/v1/charities/${charityId}/email-templates`,
      { method: 'POST', body: JSON.stringify(data) },
    );
  } catch {
    // Fallback: save to localStorage
    const items = loadLocalTemplates(charityId);
    const newTemplate: EmailTemplate = {
      id: Date.now(),
      charity_id: charityId,
      title: data.title,
      body: data.body,
      is_active: data.is_active ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.push(newTemplate);
    saveLocalTemplates(charityId, items);
    return newTemplate;
  }
}

/**
 * 감사 이메일 템플릿 수정
 */
export async function updateEmailTemplate(
  charityId: number,
  templateId: number,
  data: Partial<CreateEmailTemplateRequest>,
): Promise<EmailTemplate> {
  try {
    return await apiFetch<EmailTemplate>(
      `/api/v1/charities/${charityId}/email-templates/${templateId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
  } catch {
    // Fallback
    const items = loadLocalTemplates(charityId);
    const idx = items.findIndex(t => t.id === templateId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
      saveLocalTemplates(charityId, items);
      return items[idx];
    }
    throw new Error('Template not found');
  }
}

/**
 * 감사 이메일 템플릿 삭제
 */
export async function deleteEmailTemplate(
  charityId: number,
  templateId: number,
): Promise<GenericOkResponse> {
  try {
    return await apiFetch<GenericOkResponse>(
      `/api/v1/charities/${charityId}/email-templates/${templateId}`,
      { method: 'DELETE' },
    );
  } catch {
    // Fallback
    const items = loadLocalTemplates(charityId);
    const filtered = items.filter(t => t.id !== templateId);
    saveLocalTemplates(charityId, filtered);
    return { ok: true, message: 'Template deleted' } as GenericOkResponse;
  }
}

/**
 * 영수증 다운로드 URL 조회
 * - 백엔드가 PDF를 생성/저장했다면 URL을 반환
 * - 아직 미생성이면 null 반환
 */
export async function getReceiptDownloadUrl(
  donationId: number,
): Promise<ReceiptInfo | null> {
  try {
    return await apiFetch<ReceiptInfo>(
      `/api/v1/receipts/${donationId}/pdf`,
    );
  } catch {
    return null;
  }
}
