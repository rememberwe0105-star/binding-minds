// ===========================================================================
// API 응답 → 기존 카드/페이지 타입 어댑터
//
// 공개 단체/프로젝트 화면을 백엔드 실데이터로 교체하되(FE-004/FE-009),
// 기존 카드·필터·정렬 UI 로직을 최대한 보존하기 위해 API 응답을
// Organization / Campaign 형태로 매핑한다. slug 는 API 값 그대로 사용.
// ===========================================================================

import type { Organization, OrgStatus } from '@/data/organizations';
import type { Campaign, Category, Region } from '@/data/campaigns';
import { CATEGORIES, REGIONS } from '@/data/campaigns';
import {
  mediaUrl,
  type ApiCharityListItem,
  type ApiProjectListItem,
} from '@/lib/api';

const CATEGORY_IMAGE: Record<string, string> = {
  'Environment': '/images/categories/environment.png',
  'Education': '/images/categories/education.png',
  'Health & Wellbeing': '/images/categories/health.png',
  'Arts & Culture': '/images/categories/arts-culture.png',
  'Community': '/images/categories/community.png',
  'Animal Welfare': '/images/categories/animal-welfare.png',
};

function safeCategory(c?: string | null): Category {
  if (c && (CATEGORIES as string[]).includes(c)) return c as Category;
  return 'Community';
}

function safeRegion(r?: string | null): Region {
  if (r && (REGIONS as string[]).includes(r)) return r as Region;
  return 'Nationwide';
}

function categoryImage(c?: string | null): string {
  return CATEGORY_IMAGE[c ?? ''] ?? '/images/categories/community.png';
}

/** 프로젝트/단체 카드가 쓰는 Campaign 을 확장 — 실기부 페이로드에 필요한 필드 포함 */
export interface AdaptedProject extends Campaign {
  /** 백엔드 프로젝트 ID (숫자) — 기부 페이로드 projectId 용 */
  backendProjectId: number;
  /** 주최 단체 slug / id / Stripe 계정 */
  charitySlug: string;
  charityId: number;
}

/** API 단체 → Organization (카드/상세용) */
export function adaptCharity(a: ApiCharityListItem): Organization {
  return {
    id: String(a.id),
    name: a.display_name,
    slug: a.slug,
    category: safeCategory(a.category),
    region: safeRegion(a.region),
    mission: a.description ?? '',
    description: a.description ?? '',
    image: mediaUrl(a.logo_url ?? a.banner_url) ?? categoryImage(a.category),
    verified: !!a.registration_no,
    charityNumber: a.registration_no ?? '',
    website: a.website_url ?? '',
    yearFounded: 0, // API 미제공 — 카드에서 0이면 표기 생략
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: (a.claim_status as OrgStatus) ?? 'unclaimed',
    lastUpdated: a.profile_updated_at ?? undefined,
    interestCount: 0,
  };
}

/** API 프로젝트 → AdaptedProject (카드/상세/기부용) */
export function adaptProject(p: ApiProjectListItem): AdaptedProject {
  const end = p.end_date ? new Date(p.end_date).getTime() : 0;
  const daysLeft = end ? Math.max(0, Math.ceil((end - Date.now()) / 86400000)) : 0;
  return {
    id: String(p.id),
    name: p.title,
    slug: p.slug,
    category: safeCategory(p.charity?.category),
    region: safeRegion(p.charity?.region),
    description: p.description ?? '',
    longDescription: p.description ?? '',
    image: mediaUrl(p.charity?.logo_url) ?? categoryImage(p.charity?.category),
    raised: Math.round((p.current_amount_minor ?? 0) / 100),
    goal: Math.round((p.goal_amount_minor ?? 0) / 100),
    donorCount: p.donor_count ?? 0,
    daysLeft,
    organizer: p.charity?.display_name ?? '',
    verified: true,
    featured: false,
    trending: false,
    createdAt: p.start_date ?? '',
    stripeAccountId: p.charity?.stripe_account_id ?? undefined,
    backendProjectId: p.id,
    charitySlug: p.charity?.slug ?? '',
    charityId: p.charity?.id ?? 0,
  };
}
