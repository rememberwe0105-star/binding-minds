// ==============================
// Binding Minds — 통합 캠페인 데이터 모듈
// ==============================

// --- 타입 정의 ---
export type Category =
  | 'Education'
  | 'Environment'
  | 'Health'
  | 'Arts & Culture'
  | 'Community'
  | 'Animal Welfare';

export type Region =
  | 'Auckland'
  | 'Wellington'
  | 'Canterbury'
  | 'Otago'
  | 'Southland'
  | 'Bay of Plenty'
  | 'Nationwide';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  category: Category;
  region: Region;
  description: string;
  longDescription: string;
  image: string;
  raised: number;
  goal: number;
  donorCount: number;
  daysLeft: number;
  organizer: string;
  verified: boolean;
  featured: boolean;
  trending: boolean;
  createdAt: string;
}

// --- 카테고리 목록 ---
export const CATEGORIES: Category[] = [
  'Education',
  'Environment',
  'Health',
  'Arts & Culture',
  'Community',
  'Animal Welfare',
];

// --- 지역 목록 ---
export const REGIONS: Region[] = [
  'Auckland',
  'Wellington',
  'Canterbury',
  'Otago',
  'Southland',
  'Bay of Plenty',
  'Nationwide',
];

// --- 정렬 옵션 ---
export type SortOption = 'popular' | 'newest' | 'ending-soon' | 'most-funded';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'most-funded', label: 'Most Funded' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest First' },
];

// --- 페이지네이션 상수 ---
export const CAMPAIGNS_PER_PAGE = 6;

// --- 캠페인 데이터 (10개) ---
export const campaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Restore Aotearoa\'s Native Forest',
    slug: 'restore-native-forest',
    category: 'Environment',
    region: 'Nationwide',
    description:
      'Join the movement to plant 50,000 native trees across Aotearoa, restoring biodiversity and protecting our native birds.',
    longDescription: `## Our Mission

New Zealand's native forests are home to unique species found nowhere else on Earth — the kiwi, the kākāpō, and ancient pōhutukawa trees that have stood for centuries.

But deforestation, invasive species, and climate change are threatening these irreplaceable ecosystems. **Restore Aotearoa** is a community-led initiative to plant 50,000 native trees across conservation areas nationwide.

### What Your Donation Funds
- **$25** — Plants 5 native seedlings (tōtara, rimu, kāhikatea)
- **$50** — Funds a volunteer planting day for 10 people
- **$100** — Sponsors a permanent conservation marker
- **$500** — Names a grove in your honour

### Our Progress So Far
We've already planted 12,000 trees across 15 conservation sites, with 200+ volunteers participating monthly. Every dollar brings us closer to a greener Aotearoa.

### Why It Matters
Native forests are not just trees — they're water filters, carbon sinks, and habitats. For every hectare restored, we protect the nesting grounds of 3-5 endangered bird species.`,
    image: '/images/hero-campaign.png',
    raised: 36400,
    goal: 50000,
    donorCount: 482,
    daysLeft: 45,
    organizer: 'Forest & Bird NZ',
    verified: true,
    featured: true,
    trending: true,
    createdAt: '2026-03-15',
  },
  {
    id: 'camp-002',
    name: 'Education For All',
    slug: 'education-for-all',
    category: 'Education',
    region: 'Canterbury',
    description:
      'Providing quality education and learning resources to underserved children across rural New Zealand communities.',
    longDescription: `## Bridging the Education Gap

In rural Canterbury, many schools lack basic resources — up-to-date textbooks, science equipment, and digital tools that urban students take for granted.

**Education For All** partners with 12 rural schools to provide:

### What We Deliver
- **Reading packs** with age-appropriate NZ literature
- **STEM kits** for hands-on science learning
- **Digital tablets** preloaded with educational apps
- **Teacher training** workshops on modern pedagogy

### Impact So Far
- 850 students receiving new learning materials
- 15 teachers trained in digital education
- 92% improvement in reading comprehension scores

### Your Contribution
Every dollar directly funds educational resources. We operate with less than 5% administrative overhead, ensuring maximum impact for every donation.`,
    image: '/images/charity-education.png',
    raised: 13600,
    goal: 20000,
    donorCount: 215,
    daysLeft: 30,
    organizer: 'Kiwi Education Trust',
    verified: true,
    featured: true,
    trending: false,
    createdAt: '2026-04-01',
  },
  {
    id: 'camp-003',
    name: 'Nurturing Nature',
    slug: 'nurturing-nature',
    category: 'Environment',
    region: 'Otago',
    description:
      'Protecting native bush, restoring wetlands, and planting native trees to preserve New Zealand\'s unique biodiversity.',
    longDescription: `## Protecting Otago's Wild Heart

The wetlands of Otago are among New Zealand's most ecologically significant areas, home to rare species including the Australasian bittern and the native mudfish.

### Our Conservation Work
- **Wetland restoration** across 3 key sites in Central Otago
- **Predator trapping** to protect nesting birds
- **Native planting** along riparian margins
- **Community education** programmes for local schools

### Why Wetlands Matter
Wetlands are Earth's kidneys — they filter water, prevent flooding, and store carbon. Yet New Zealand has lost 90% of its original wetlands.

### Join Us
Whether you donate, volunteer, or simply spread the word, you're part of a movement to protect what makes Aotearoa special.`,
    image: '/images/charity-nature.png',
    raised: 9120,
    goal: 20000,
    donorCount: 134,
    daysLeft: 60,
    organizer: 'Otago Conservation Network',
    verified: true,
    featured: true,
    trending: false,
    createdAt: '2026-03-20',
  },
  {
    id: 'camp-004',
    name: 'Supporting Local Art',
    slug: 'supporting-local-art',
    category: 'Arts & Culture',
    region: 'Wellington',
    description:
      'Empowering local artists and community muralists to bring colour, stories, and connection to neighbourhoods.',
    longDescription: `## Art That Brings Communities Together

Wellington's laneways and underpasses are being transformed into open-air galleries, celebrating our diverse cultural heritage through vibrant murals and installations.

### The Project
- Commission **12 large-scale murals** across 4 Wellington suburbs
- Support **25 local artists** with materials, scaffolding, and fair wages
- Host **community painting days** where anyone can contribute
- Create a **self-guided art trail** with QR codes linking to artist stories

### Artists Featured
Our muralists represent the full spectrum of Wellington's creative community — from established painters to emerging street artists, Māori and Pasifika creators, and youth apprentices.

### Impact Beyond Art
Public art reduces graffiti, increases foot traffic to local businesses, and creates a sense of pride and ownership in communities. Studies show that neighbourhoods with public art see a 15% increase in community engagement.`,
    image: '/images/charity-art.png',
    raised: 19250,
    goal: 24000,
    donorCount: 308,
    daysLeft: 20,
    organizer: 'Wellington Arts Collective',
    verified: true,
    featured: true,
    trending: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'camp-005',
    name: 'Clean Water for Southland',
    slug: 'clean-water-southland',
    category: 'Environment',
    region: 'Southland',
    description:
      'Installing water filtration systems and monitoring stations to ensure safe, clean drinking water for rural Southland communities.',
    longDescription: `## Every Drop Counts

In rural Southland, many families rely on untreated rainwater or aging bore water systems. Some communities have water quality that doesn't meet national standards.

### Our Solution
- Install **15 community water filtration systems** in rural areas
- Set up **real-time water quality monitoring** stations
- Provide **water testing kits** to 200 rural households
- Run **education workshops** on water conservation

### Technical Approach
We use UV filtration combined with activated carbon filters — a proven, low-maintenance technology that removes bacteria, heavy metals, and agricultural runoff contaminants.

### Current Status
3 systems installed and operational, serving 450 people. 12 more planned for installation over the next 6 months.`,
    image: '/images/trending-water.png',
    raised: 28800,
    goal: 40000,
    donorCount: 367,
    daysLeft: 55,
    organizer: 'Southland Water Trust',
    verified: true,
    featured: false,
    trending: true,
    createdAt: '2026-03-01',
  },
  {
    id: 'camp-006',
    name: 'Music for Youth',
    slug: 'music-for-youth',
    category: 'Education',
    region: 'Auckland',
    description:
      'Providing free music lessons and instruments to underprivileged youth across Auckland, building confidence and creativity.',
    longDescription: `## Every Child Deserves Music

Music education is proven to improve academic performance, social skills, and mental wellbeing. But for many Auckland families, private lessons and instruments are simply unaffordable.

### Programme Details
- **Weekly group lessons** in guitar, ukulele, drums, and keyboard
- **Free instrument lending** programme (500+ instruments available)
- **Performance opportunities** at community events and school concerts
- **Mentorship** pairing students with professional musicians

### Success Stories
Since launching, 340 young people have participated. 85% report increased confidence, and 12 students have gone on to pursue music professionally or earn scholarships.

### Locations
Currently operating in 8 community centres across South and West Auckland, with plans to expand to 15 by year-end.`,
    image: '/images/trending-music.png',
    raised: 8400,
    goal: 24000,
    donorCount: 156,
    daysLeft: 75,
    organizer: 'Auckland Youth Music Trust',
    verified: true,
    featured: false,
    trending: true,
    createdAt: '2026-04-10',
  },
  {
    id: 'camp-007',
    name: 'Coastal Cleanup NZ',
    slug: 'coastal-cleanup-nz',
    category: 'Environment',
    region: 'Bay of Plenty',
    description:
      'Organising monthly beach cleanups, installing waste collection infrastructure, and educating communities on marine conservation.',
    longDescription: `## Protecting Our Coastline

New Zealand's coastline stretches over 15,000 kilometres, and plastic pollution is one of the biggest threats to our marine ecosystem.

### Our Approach
- **Monthly beach cleanups** across 20 Bay of Plenty beaches
- **Permanent waste stations** at 10 high-traffic beach access points
- **School education programme** reaching 2,000 students annually
- **Marine debris tracking** using citizen science data

### Impact to Date
- 12 tonnes of waste removed from beaches
- 350 regular volunteers
- 8 new permanent waste stations installed
- 45% reduction in beach litter at monitored sites

### What Makes Us Different
We don't just clean — we track. Every cleanup is documented with GPS data, weight measurements, and debris categorisation. This data is shared with councils and researchers to drive systemic change.`,
    image: '/images/trending-beach.png',
    raised: 15600,
    goal: 24000,
    donorCount: 243,
    daysLeft: 40,
    organizer: 'Sustainable Coastlines',
    verified: true,
    featured: false,
    trending: true,
    createdAt: '2026-03-25',
  },
  {
    id: 'camp-008',
    name: 'Feed the Community',
    slug: 'feed-the-community',
    category: 'Community',
    region: 'Auckland',
    description:
      'Running community kitchens, food rescue operations, and nutrition education programmes to fight food insecurity in Auckland.',
    longDescription: `## No One Should Go Hungry

In Auckland, 1 in 5 children experience food insecurity. Meanwhile, supermarkets and restaurants discard tonnes of perfectly good food every week.

### What We Do
- **3 community kitchens** serving 500 hot meals per week
- **Food rescue** from 40 partner businesses, preventing 2 tonnes of waste weekly
- **Fresh produce boxes** delivered to 120 families monthly
- **Cooking classes** teaching healthy, budget-friendly meals

### Our Model
We rescue surplus food from supermarkets, bakeries, and restaurants, then transform it into nutritious meals through our volunteer-run kitchens. Nothing goes to waste.

### Volunteers
Our 200+ volunteers include professional chefs, students, retirees, and families. Everyone is welcome — no cooking experience needed.`,
    image: '/images/trending-food.png',
    raised: 21120,
    goal: 24000,
    donorCount: 412,
    daysLeft: 15,
    organizer: 'Kai Auckland',
    verified: true,
    featured: false,
    trending: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'camp-009',
    name: 'Wellness For Seniors',
    slug: 'wellness-for-seniors',
    category: 'Health',
    region: 'Wellington',
    description:
      'Engaging elderly people through wellness activities, social programmes, and health support for happier, healthier lives.',
    longDescription: `## Ageing with Joy and Connection

Loneliness is one of the biggest health risks for older New Zealanders, with studies showing it's as harmful as smoking 15 cigarettes a day.

### Our Programmes
- **Gentle exercise classes** (tai chi, yoga, walking groups)
- **Social morning teas** with guest speakers and activities
- **Home visit volunteers** for isolated seniors
- **Digital literacy workshops** to help stay connected with family
- **Health screening days** with free blood pressure and wellness checks

### Reach
Currently serving 450 seniors across 6 Wellington community centres, with 80 trained volunteers conducting weekly home visits.

### Outcomes
- 78% of participants report feeling less lonely
- 65% report improved physical health
- 92% say the programme has made them happier`,
    image: '/images/charity-seniors.png',
    raised: 11500,
    goal: 22000,
    donorCount: 189,
    daysLeft: 50,
    organizer: 'Age Concern Wellington',
    verified: true,
    featured: false,
    trending: false,
    createdAt: '2026-03-10',
  },
  {
    id: 'camp-010',
    name: 'Art in Schools',
    slug: 'art-in-schools',
    category: 'Arts & Culture',
    region: 'Canterbury',
    description:
      'Bringing professional artists into primary schools for workshops in painting, sculpture, and digital art across Canterbury.',
    longDescription: `## Inspiring the Next Generation of Creators

Art education in New Zealand schools has been declining, with fewer specialist art teachers and shrinking budgets for creative supplies.

### Our Programme
- **Artist residencies** in 20 Canterbury primary schools
- **8-week workshop series** covering painting, sculpture, printmaking, and digital art
- **Annual student exhibition** showcasing the best student work
- **Art supply grants** ensuring every student has quality materials

### Why Art Education Matters
Studies show that art education improves critical thinking, empathy, and problem-solving skills. Children who participate in arts programmes are 3x more likely to win awards for academic achievement.

### Partner Artists
We work with 15 professional Canterbury artists who bring real-world creative experience into the classroom, showing students that art can be a viable career path.`,
    image: '/images/trending-art.png',
    raised: 10080,
    goal: 24000,
    donorCount: 167,
    daysLeft: 65,
    organizer: 'Creative Canterbury',
    verified: true,
    featured: false,
    trending: true,
    createdAt: '2026-04-05',
  },
];

// --- 유틸리티 함수들 ---

/** 슬러그로 캠페인 찾기 */
export function getCampaignBySlug(slug: string): Campaign | undefined {
  return campaigns.find((c) => c.slug === slug);
}

/** Featured 캠페인 목록 */
export function getFeaturedCampaigns(): Campaign[] {
  return campaigns.filter((c) => c.featured);
}

/** Trending 캠페인 목록 */
export function getTrendingCampaigns(): Campaign[] {
  return campaigns.filter((c) => c.trending);
}

/** 관련 캠페인 추천 (같은 카테고리, 자기 자신 제외) */
export function getRelatedCampaigns(campaign: Campaign, limit = 3): Campaign[] {
  return campaigns
    .filter((c) => c.category === campaign.category && c.id !== campaign.id)
    .slice(0, limit);
}

/** 캠페인 진행률 계산 */
export function getProgress(campaign: Campaign): number {
  return Math.round((campaign.raised / campaign.goal) * 100);
}

/** 통화 포맷 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-NZ')}`;
}

/** 캠페인 필터링 + 정렬 */
export function filterAndSortCampaigns(options: {
  search?: string;
  categories?: Category[];
  region?: Region | '';
  sort?: SortOption;
}): Campaign[] {
  let result = [...campaigns];

  // 검색
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.organizer.toLowerCase().includes(q)
    );
  }

  // 카테고리 필터
  if (options.categories && options.categories.length > 0) {
    result = result.filter((c) => options.categories!.includes(c.category));
  }

  // 지역 필터
  if (options.region) {
    result = result.filter((c) => c.region === options.region);
  }

  // 정렬
  switch (options.sort) {
    case 'most-funded':
      result.sort((a, b) => getProgress(b) - getProgress(a));
      break;
    case 'ending-soon':
      result.sort((a, b) => a.daysLeft - b.daysLeft);
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'popular':
    default:
      result.sort((a, b) => b.donorCount - a.donorCount);
      break;
  }

  return result;
}
