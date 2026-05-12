// ==============================
// Binding Minds — 기관(Organization) 데이터 모듈
// ==============================

import type { Category, Region } from './campaigns';

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
  totalRaised: number;      // 플랫폼 내 총 모금액 (목업)
  donorCount: number;       // 플랫폼 내 기부자 수 (목업)
  activeCampaigns: number;  // 활성 캠페인 수
}

// --- 10개 NZ 실제 기관 데이터 ---
export const organizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Forest & Bird NZ',
    slug: 'forest-and-bird',
    category: 'Environment',
    region: 'Nationwide',
    mission:
      'Protecting New Zealand\'s native wildlife and wild places for future generations.',
    description: `## About Forest & Bird

Forest & Bird (Royal Forest and Bird Protection Society of New Zealand) is Aotearoa's leading independent conservation organisation. Since 1923, we've been the voice for nature — advocating for the protection of native forests, wetlands, marine reserves, and the countless species that call them home.

### What We Do
- **Advocacy & Policy** — Campaigning for stronger environmental protections at local and national government level
- **Habitat Restoration** — Running community-led restoration projects across 50+ reserves nationwide
- **Predator Control** — Operating trap lines and supporting predator-free initiatives
- **Marine Protection** — Advocating for marine reserves around Aotearoa's coastline
- **Youth Engagement** — Kiwi Conservation Club for young nature lovers

### Our Impact
With over 100,000 supporters and 80+ branches across the country, Forest & Bird has been instrumental in protecting some of NZ's most treasured landscapes, from the Waituna Lagoon in Southland to the Hauraki Gulf.

### Why Support Us
Every dollar funds direct conservation work — from planting native trees to protecting endangered species like the kākāpō, kiwi, and Hector's dolphin.`,
    image: '/images/charity-nature.png',
    verified: true,
    charityNumber: 'CC26943',
    website: 'https://www.forestandbird.org.nz',
    yearFounded: 1923,
    totalRaised: 45520,
    donorCount: 616,
    activeCampaigns: 2,
  },
  {
    id: 'org-002',
    name: 'SPCA New Zealand',
    slug: 'spca-new-zealand',
    category: 'Animal Welfare',
    region: 'Nationwide',
    mission:
      'Advancing the welfare of all animals in Aotearoa through rescue, rehabilitation, and advocacy.',
    description: `## About SPCA New Zealand

The SPCA (Society for the Prevention of Cruelty to Animals) is New Zealand's largest and oldest animal welfare charity. We rescue, rehabilitate, and rehome thousands of animals every year while advocating for stronger animal protection laws.

### What We Do
- **Rescue & Shelter** — Operating 30+ centres nationwide, caring for 40,000+ animals annually
- **Inspectorate** — Investigating animal cruelty complaints and enforcing the Animal Welfare Act
- **Desexing Programmes** — Subsidised desexing to reduce unwanted litters
- **Education** — School programmes teaching kindness to animals
- **Advocacy** — Lobbying for stronger animal welfare legislation

### Our Impact
In 2024, we found loving homes for over 28,000 animals, responded to 15,000 animal welfare complaints, and provided veterinary care to thousands more through our community outreach programmes.

### Why Support Us
Your donation directly funds the food, shelter, and medical care that rescued animals need while they wait for their forever homes.`,
    image: '/images/charity-seniors.png',
    verified: true,
    charityNumber: 'CC56833',
    website: 'https://www.spca.nz',
    yearFounded: 1882,
    totalRaised: 92400,
    donorCount: 1243,
    activeCampaigns: 0,
  },
  {
    id: 'org-003',
    name: 'The Salvation Army NZ',
    slug: 'salvation-army-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Caring for people in need — providing food, shelter, addiction support, and community services across Aotearoa.',
    description: `## About The Salvation Army NZ

The Salvation Army has been serving New Zealand communities since 1883. We are one of the country's largest social service providers, offering practical support to people facing hardship, addiction, homelessness, and family difficulties.

### What We Do
- **Food Banks & Community Meals** — Distributing 300,000+ food parcels annually
- **Housing & Homelessness** — Transitional housing and emergency shelters
- **Addiction Services** — Residential treatment, counselling, and recovery support
- **Family Services** — Budgeting, parenting programmes, and emergency welfare
- **Employment Support** — Training, CV support, and job placement assistance

### Our Impact
With 95 community ministries across NZ, we are present in communities from Kaitaia to Invercargill, ensuring no one is left without help when they need it most.

### Why Support Us
88 cents of every dollar goes directly to frontline services. We are transparent, accountable, and committed to making a lasting difference.`,
    image: '/images/trending-food.png',
    verified: true,
    charityNumber: 'CC37322',
    website: 'https://www.salvationarmy.org.nz',
    yearFounded: 1883,
    totalRaised: 128750,
    donorCount: 1890,
    activeCampaigns: 1,
  },
  {
    id: 'org-004',
    name: 'World Vision NZ',
    slug: 'world-vision-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Partnering with communities worldwide to overcome poverty and injustice, with a special focus on children.',
    description: `## About World Vision New Zealand

World Vision is a global humanitarian organisation dedicated to working with children, families, and communities to overcome poverty and injustice. In New Zealand, we connect generous Kiwis with communities in need around the world.

### What We Do
- **Child Sponsorship** — Connecting NZ donors with children in developing countries
- **Emergency Relief** — Rapid response to disasters, conflicts, and crises worldwide
- **Clean Water** — Building wells and sanitation systems in water-scarce communities
- **Education** — Supporting schools and teacher training in developing nations
- **Local Advocacy** — Raising awareness of global poverty issues within NZ

### Our Impact
World Vision NZ supporters currently sponsor over 50,000 children worldwide and have contributed to clean water, education, and healthcare projects across 30+ countries.

### Why Support Us
World Vision maintains the highest standards of financial accountability, with 82% of funds going directly to programme work in the field.`,
    image: '/images/hero-campaign.png',
    verified: true,
    charityNumber: 'CC25984',
    website: 'https://www.worldvision.org.nz',
    yearFounded: 1973,
    totalRaised: 67200,
    donorCount: 845,
    activeCampaigns: 0,
  },
  {
    id: 'org-005',
    name: 'New Zealand Red Cross',
    slug: 'nz-red-cross',
    category: 'Health',
    region: 'Nationwide',
    mission:
      'Improving the lives of vulnerable people by mobilising the power of humanity and the generosity of Kiwis.',
    description: `## About New Zealand Red Cross

New Zealand Red Cross is part of the world's largest humanitarian network — the International Red Cross and Red Crescent Movement. We help people affected by disasters, conflicts, and hardship, both in Aotearoa and around the world.

### What We Do
- **Disaster Response** — First responders to earthquakes, floods, and cyclones in NZ
- **Refugee Support** — Settling and supporting refugee families arriving in NZ
- **Community Resilience** — Training communities in first aid and disaster preparedness
- **International Aid** — Emergency relief and long-term recovery in crisis zones
- **Meals on Wheels** — Delivering nutritious meals to isolated and elderly people

### Our Impact
In 2024, we supported 12,000+ disaster-affected New Zealanders, settled 350 refugee families, and trained 45,000 people in first aid.

### Why Support Us
As part of the global Red Cross network, your donation reaches those who need it most through a trusted, 160-year-old humanitarian institution.`,
    image: '/images/trending-water.png',
    verified: true,
    charityNumber: 'CC21697',
    website: 'https://www.redcross.org.nz',
    yearFounded: 1915,
    totalRaised: 54800,
    donorCount: 723,
    activeCampaigns: 0,
  },
  {
    id: 'org-006',
    name: 'Starship Foundation',
    slug: 'starship-foundation',
    category: 'Health',
    region: 'Auckland',
    mission:
      'Funding life-saving equipment, research, and family support at Starship Children\'s Hospital.',
    description: `## About Starship Foundation

Starship Foundation raises vital funds for Starship Children's Hospital — New Zealand's national children's hospital based in Auckland. Every year, Starship treats over 135,000 children from across Aotearoa.

### What We Do
- **Medical Equipment** — Funding cutting-edge technology and specialised equipment
- **Research** — Supporting paediatric research to improve treatments and outcomes
- **Family Support** — Accommodation, transport, and emotional support for families
- **Child Life Therapy** — Play specialists who help children cope with hospital stays
- **Building Projects** — Expanding and upgrading hospital facilities

### Our Impact
Since inception, Starship Foundation has raised over $150 million, funding everything from life-saving ventilators to NZ's first paediatric hybrid operating theatre.

### Why Support Us
When a child is critically ill, Starship is often their only hope. Your donation helps ensure every child gets the best possible care, regardless of where they live in NZ.`,
    image: '/images/charity-education.png',
    verified: true,
    charityNumber: 'CC24272',
    website: 'https://www.starship.org.nz',
    yearFounded: 1991,
    totalRaised: 38600,
    donorCount: 512,
    activeCampaigns: 0,
  },
  {
    id: 'org-007',
    name: 'KidsCan Charitable Trust',
    slug: 'kidscan',
    category: 'Education',
    region: 'Nationwide',
    mission:
      'Ensuring every Kiwi child has the essentials they need to learn — food, clothing, and health products.',
    description: `## About KidsCan

KidsCan is New Zealand's leading charity dedicated to helping children affected by poverty. We provide food, warm clothing, shoes, and basic health items to children in low-decile schools and early childhood centres across the country.

### What We Do
- **Food for Kids** — Providing breakfast, lunch, and snacks in 800+ schools
- **Warm Clothing** — Distributing jackets, shoes, and socks to children in need
- **Health Products** — Providing basic hygiene items, raincoats, and sanitary products
- **Early Childhood** — Supporting pre-schoolers with food and resources
- **Community Hubs** — Extending support beyond schools to families and whānau

### Our Impact
KidsCan currently supports over 33,000 children in 800+ schools and early childhood centres. In 2024, we distributed 3.5 million food items and 120,000 clothing items.

### Why Support Us
1 in 5 Kiwi kids live in poverty. KidsCan bridges the gap so that no child misses out on learning because they're hungry, cold, or unwell.`,
    image: '/images/charity-education.png',
    verified: true,
    charityNumber: 'CC10386',
    website: 'https://www.kidscan.org.nz',
    yearFounded: 2005,
    totalRaised: 41300,
    donorCount: 578,
    activeCampaigns: 0,
  },
  {
    id: 'org-008',
    name: 'Greenpeace Aotearoa',
    slug: 'greenpeace-aotearoa',
    category: 'Environment',
    region: 'Nationwide',
    mission:
      'Campaigning for a green, peaceful future — protecting oceans, forests, and the climate.',
    description: `## About Greenpeace Aotearoa

Greenpeace Aotearoa is the New Zealand branch of the global Greenpeace network. We use peaceful protest, creative confrontation, and scientific research to expose environmental problems and push for solutions.

### What We Do
- **Climate Action** — Campaigning for a just transition to 100% renewable energy
- **Ocean Protection** — Fighting against deep-sea mining and overfishing
- **Forest Defence** — Opposing native forest destruction and promoting sustainable forestry
- **Plastic-Free Seas** — Advocating for legislation to reduce single-use plastics
- **Agricultural Reform** — Pushing for regenerative farming practices

### Our Impact
Greenpeace Aotearoa has been instrumental in NZ's deep-sea oil exploration ban, the landmark zero-carbon legislation, and the protection of marine reserves around the Kermadec Islands.

### Why Support Us
We accept no government or corporate funding — our independence is guaranteed by the support of individuals like you. This means we can always speak truth to power.`,
    image: '/images/charity-nature.png',
    verified: true,
    charityNumber: 'CC58459',
    website: 'https://www.greenpeace.org/aotearoa',
    yearFounded: 1974,
    totalRaised: 29700,
    donorCount: 398,
    activeCampaigns: 0,
  },
  {
    id: 'org-009',
    name: 'Habitat for Humanity NZ',
    slug: 'habitat-for-humanity-nz',
    category: 'Community',
    region: 'Nationwide',
    mission:
      'Building strength, stability, and self-reliance through affordable housing solutions.',
    description: `## About Habitat for Humanity NZ

Habitat for Humanity New Zealand works alongside families and communities to help them build or improve the places they call home. We believe everyone deserves a safe, decent, and affordable place to live.

### What We Do
- **New Builds** — Constructing affordable homes with volunteer labour and donated materials
- **Home Repairs** — Critical repairs for families living in substandard housing
- **ReStore** — Operating retail stores selling donated building materials and furniture
- **Community Development** — Neighbourhood revitalisation and community building
- **Disaster Recovery** — Rebuilding homes after natural disasters

### Our Impact
Since 1993, Habitat NZ has helped over 3,500 families with new homes, repairs, and housing solutions. Our 14 ReStore locations also divert thousands of tonnes of building materials from landfill each year.

### Why Support Us
With NZ facing a critical housing crisis, your donation directly helps families move from overcrowded, cold, and damp conditions into warm, dry, safe homes.`,
    image: '/images/trending-food.png',
    verified: true,
    charityNumber: 'CC28026',
    website: 'https://habitat.org.nz',
    yearFounded: 1993,
    totalRaised: 35200,
    donorCount: 467,
    activeCampaigns: 0,
  },
  {
    id: 'org-010',
    name: 'Whānau Āwhina Plunket',
    slug: 'plunket',
    category: 'Health',
    region: 'Nationwide',
    mission:
      'Supporting the health and wellbeing of New Zealand children and their whānau from birth to five.',
    description: `## About Whānau Āwhina Plunket

Plunket is New Zealand's largest provider of support services for children under five and their families. For over 117 years, Plunket has been a trusted presence in the lives of Kiwi families, providing free well-child health checks, parenting support, and early childhood education.

### What We Do
- **Well Child Checks** — Free health and development assessments for babies and toddlers
- **PlunketLine** — 24/7 phone support for parents and caregivers
- **Home Visits** — Trained nurses visiting families in their homes
- **Parenting Education** — Workshops on nutrition, sleep, and child development
- **Early Childhood Education** — Operating 28 Plunket early learning centres

### Our Impact
Plunket reaches over 90% of all newborns in New Zealand, conducting 300,000+ well-child contacts annually. Our PlunketLine answers 80,000+ calls from worried parents each year.

### Why Support Us
The first 1,000 days of a child's life shape their entire future. Plunket ensures every child in Aotearoa gets the healthiest possible start, regardless of their family's circumstances.`,
    image: '/images/charity-seniors.png',
    verified: true,
    charityNumber: 'CC54853',
    website: 'https://www.plunket.org.nz',
    yearFounded: 1907,
    totalRaised: 22800,
    donorCount: 312,
    activeCampaigns: 0,
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
