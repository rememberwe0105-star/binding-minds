// ==============================
// DearGiver — 기관(Organization) 데이터 모듈
// ==============================

import type { Category, Region } from './campaigns';

// --- 기관 상태 ---
// unclaimed  : 공개 데이터 기반 프로필 — 기관이 아직 플랫폼에 참여하지 않음
// claimed    : 기관 관계자가 프로필 소유권을 주장함 — 심사 중
// partnered  : 기관이 Stripe Connect 온보딩을 완료하여 기부 수령 가능
export type OrgStatus = 'unclaimed' | 'claimed' | 'partnered';

// --- 타입 정의 ---
export interface Organization {
  id: string;
  name: string;
  slug: string;
  category: Category;
  region: Region;
  mission: string;          // 짧은 미션 (카드에 표시)
  description: string;      // 상세 소개 (상세 페이지)
  image: string;            // 대표 이미지
  verified: boolean;
  charityNumber: string;    // CC 등록번호
  website: string;
  yearFounded: number;
  totalRaised: number;      // 플랫폼 내 총 모금액
  donorCount: number;       // 플랫폼 내 기부자 수
  activeCampaigns: number;  // 활성 캠페인 수
  /** 기관의 플랫폼 참여 상태 */
  status: OrgStatus;
  /** "이 기관에 기부하고 싶어요!" 관심 표현 수 */
  interestCount: number;
}

// --- 10개 NZ 실제 기관 데이터 ---
// ⚠️ 공개 데이터 기반 프로필: NZ Charities Services 등록 정보 수준의 객관적 데이터만 포함
// 기관이 "Claim Profile"을 통해 합류한 후에만 상세 소개 및 기부 기능이 활성화됨
export const organizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Forest & Bird NZ',
    slug: 'forest-and-bird',
    category: 'Environment',
    region: 'Nationwide',
    mission:
      'Protecting New Zealand\'s native wildlife and wild places for future generations.',
    description: `A registered New Zealand charity focused on conservation and environmental protection. For more information, visit their official website.`,
    image: '/images/charity-nature.png',
    verified: true,
    charityNumber: 'CC26943',
    website: 'https://www.forestandbird.org.nz',
    yearFounded: 1923,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-002',
    name: 'SPCA New Zealand',
    slug: 'spca-new-zealand',
    category: 'Animal Welfare',
    region: 'Nationwide',
    mission:
      'Advancing the welfare of all animals in Aotearoa through rescue, rehabilitation, and advocacy.',
    description: `A registered New Zealand charity focused on animal welfare, rescue, and rehabilitation. For more information, visit their official website.`,
    image: '/images/charity-seniors.png',
    verified: true,
    charityNumber: 'CC56833',
    website: 'https://www.spca.nz',
    yearFounded: 1882,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-003',
    name: 'The Salvation Army NZ',
    slug: 'salvation-army-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Caring for people in need — providing food, shelter, addiction support, and community services across Aotearoa.',
    description: `A registered New Zealand charity providing community and social services. For more information, visit their official website.`,
    image: '/images/trending-food.png',
    verified: true,
    charityNumber: 'CC37322',
    website: 'https://www.salvationarmy.org.nz',
    yearFounded: 1883,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-004',
    name: 'World Vision NZ',
    slug: 'world-vision-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Partnering with communities worldwide to overcome poverty and injustice, with a special focus on children.',
    description: `A registered New Zealand charity focused on international humanitarian aid and child sponsorship. For more information, visit their official website.`,
    image: '/images/hero-campaign.png',
    verified: true,
    charityNumber: 'CC25984',
    website: 'https://www.worldvision.org.nz',
    yearFounded: 1973,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-005',
    name: 'New Zealand Red Cross',
    slug: 'nz-red-cross',
    category: 'Health',
    region: 'Nationwide',
    mission:
      'Improving the lives of vulnerable people by mobilising the power of humanity and the generosity of Kiwis.',
    description: `A registered New Zealand charity providing disaster response, refugee support, and community resilience services. For more information, visit their official website.`,
    image: '/images/trending-water.png',
    verified: true,
    charityNumber: 'CC21697',
    website: 'https://www.redcross.org.nz',
    yearFounded: 1915,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-006',
    name: 'Starship Foundation',
    slug: 'starship-foundation',
    category: 'Health',
    region: 'Auckland',
    mission:
      'Funding life-saving equipment, research, and family support at Starship Children\'s Hospital.',
    description: `A registered New Zealand charity supporting Starship Children's Hospital with equipment, research, and family services. For more information, visit their official website.`,
    image: '/images/charity-education.png',
    verified: true,
    charityNumber: 'CC24272',
    website: 'https://www.starship.org.nz',
    yearFounded: 1991,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-007',
    name: 'KidsCan Charitable Trust',
    slug: 'kidscan',
    category: 'Education',
    region: 'Nationwide',
    mission:
      'Ensuring every Kiwi child has the essentials they need to learn — food, clothing, and health products.',
    description: `A registered New Zealand charity focused on addressing child poverty through food, clothing, and health support in schools. For more information, visit their official website.`,
    image: '/images/charity-education.png',
    verified: true,
    charityNumber: 'CC10386',
    website: 'https://www.kidscan.org.nz',
    yearFounded: 2005,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-008',
    name: 'Greenpeace Aotearoa',
    slug: 'greenpeace-aotearoa',
    category: 'Environment',
    region: 'Nationwide',
    mission:
      'Campaigning for a green, peaceful future — protecting oceans, forests, and the climate.',
    description: `A registered New Zealand charity focused on environmental advocacy and climate action. For more information, visit their official website.`,
    image: '/images/charity-nature.png',
    verified: true,
    charityNumber: 'CC58459',
    website: 'https://www.greenpeace.org/aotearoa',
    yearFounded: 1974,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-009',
    name: 'Habitat for Humanity NZ',
    slug: 'habitat-for-humanity-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Building strength, stability, and self-reliance through affordable housing solutions.',
    description: `A registered New Zealand charity working to provide affordable housing solutions for families in need. For more information, visit their official website.`,
    image: '/images/trending-food.png',
    verified: true,
    charityNumber: 'CC28026',
    website: 'https://habitat.org.nz',
    yearFounded: 1993,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
  {
    id: 'org-010',
    name: 'Whānau Āwhina Plunket',
    slug: 'plunket',
    category: 'Health',
    region: 'Nationwide',
    mission:
      'Supporting the health and wellbeing of New Zealand children and their whānau from birth to five.',
    description: `A registered New Zealand charity providing well-child health services and parenting support for families with children under five. For more information, visit their official website.`,
    image: '/images/charity-seniors.png',
    verified: true,
    charityNumber: 'CC54853',
    website: 'https://www.plunket.org.nz',
    yearFounded: 1907,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  },
];

// --- 유틸리티 함수들 ---

/** 슬러그로 기관 찾기 */
export function getOrganizationBySlug(slug: string): Organization | undefined {
  return organizations.find((o) => o.slug === slug);
}

/** 기관에 속한 캠페인 슬러그 매핑 (campaignData의 organizer → organization slug) */
export const ORGANIZER_TO_ORG_SLUG: Record<string, string> = {
  'Forest & Bird NZ': 'forest-and-bird',
  'Otago Conservation Network': 'forest-and-bird', // 관련 기관
  'Sustainable Coastlines': 'greenpeace-aotearoa',  // 환경 관련
  'Kiwi Education Trust': 'kidscan',               // 교육 관련
  'Auckland Youth Music Trust': 'kidscan',          // 교육 관련
  'Southland Water Trust': 'nz-red-cross',          // 지역사회 관련
  'Wellington Arts Collective': 'habitat-for-humanity-nz',
  'Creative Canterbury': 'habitat-for-humanity-nz',
  'Kai Auckland': 'salvation-army-nz',              // 커뮤니티
  'Age Concern Wellington': 'plunket',              // 건강/복지
};

/** 기관 필터링 */
export function filterOrganizations(options: {
  search?: string;
  categories?: string[];
  region?: string;
}): Organization[] {
  let result = [...organizations];

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.mission.toLowerCase().includes(q)
    );
  }

  if (options.categories && options.categories.length > 0) {
    result = result.filter((o) => options.categories!.includes(o.category));
  }

  if (options.region) {
    result = result.filter((o) => o.region === options.region);
  }

  return result;
}

/** 통화 포맷 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-NZ')}`;
}
