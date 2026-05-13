// ==============================
// DearGiver — 블로그 데이터 모듈
// ==============================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Impact Stories' | 'Tax Tips' | 'Community' | 'Platform Updates';
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  featured: boolean;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-001',
    slug: 'how-your-donations-helped-plant-12000-trees',
    title: 'How Your Donations Helped Plant 12,000 Trees Across Aotearoa',
    excerpt: 'In just six months, the Restore Aotearoa campaign has exceeded expectations, planting native tōtara, rimu, and kāhikatea across 15 conservation sites nationwide.',
    category: 'Impact Stories',
    author: 'Sarah Mitchell',
    authorRole: 'Impact Manager',
    date: '2026-05-08',
    readTime: '5 min read',
    image: '/images/hero-campaign.png',
    featured: true,
    content: `When we launched the Restore Aotearoa campaign in March 2026, we set an ambitious goal: plant 50,000 native trees across conservation sites nationwide. Six months later, we're thrilled to report that we've already reached 12,000 trees — and we're accelerating.

## The Numbers Tell a Story

Thanks to 482 generous donors on DearGiver, the campaign has raised $36,400 of its $50,000 goal. But beyond the financials, the real story is in the impact:

- **12,000 native seedlings** planted across 15 conservation sites
- **200+ volunteers** participating in monthly planting days
- **3 endangered bird species** showing increased nesting activity in restored areas
- **15 hectares** of native bush under active restoration

## What We're Planting

Our focus is on species native to Aotearoa — the trees that formed the original forests before deforestation:

- **Tōtara** — A sacred tree in Māori culture, known for its durability
- **Rimu** — New Zealand's tallest native tree, reaching 50 meters
- **Kāhikatea** — The tallest native tree, crucial for wetland ecosystems

## Community Impact

The planting days have become more than conservation events — they're community gatherings. Families, school groups, and corporate teams come together every weekend, building connections while building forests.

"I bring my kids every Saturday," says Auckland volunteer Emma Chen. "They're learning that one person really can make a difference."

## What's Next

With your continued support, we're targeting 25,000 trees by December 2026. Every $25 plants 5 native seedlings. Every donation, no matter the size, brings us closer to a greener Aotearoa.

*Ready to contribute? [Find the campaign on DearGiver](/campaigns/restore-native-forest) and make your donation today.*`,
  },
  {
    id: 'blog-002',
    slug: 'maximise-your-tax-refund-nz-donation-guide',
    title: 'Maximise Your Tax Refund: The Complete NZ Donation Guide',
    excerpt: 'Did you know you can claim back 33.33% of your charitable donations? Our step-by-step guide makes it easy to get the most from your generosity.',
    category: 'Tax Tips',
    author: 'James Walker',
    authorRole: 'Financial Advisor',
    date: '2026-05-03',
    readTime: '7 min read',
    image: '/images/charity-education.png',
    featured: true,
    content: `If you're donating to charity in New Zealand, you could be leaving money on the table. The IRD offers a generous 33.33% tax credit on donations to approved organisations — and with DearGiver, claiming it has never been easier.

## Understanding the Tax Credit

New Zealand's donation tax credit is one of the most generous in the world:

- **Rate**: 33.33% of your total qualifying donations
- **Cap**: You can claim up to your taxable income
- **Minimum**: Donations of $5 or more qualify
- **Deadline**: Claims must be submitted by 31 March of the following tax year

### Real-World Example

If you donated **$1,500** throughout the year:
- Tax credit = $1,500 × 33.33% = **$500**
- Your effective donation cost = **$1,000**
- That's $500 back in your pocket!

## Step-by-Step Claiming Process

### 1. Gather Your Receipts
With DearGiver, this step is automated. Your Receipt Vault consolidates all your donations into a single, IRD-ready tax summary. No more hunting through emails.

### 2. Log In to myIR
Visit [ird.govt.nz](https://ird.govt.nz) and sign in to your myIR account.

### 3. Navigate to Donations
Under "Income Tax", select "Request a donation tax credit (TA)".

### 4. Enter Your Details
Upload your DearGiver tax summary or manually enter:
- Organisation name
- Donation amount
- Date of donation

### 5. Submit and Wait
IRD typically processes claims within 4-8 weeks. Your refund is deposited directly to your bank account.

## Pro Tips

1. **Don't forget monthly donations** — They add up! $50/month = $600/year = $200 tax refund
2. **Keep records for 7 years** — IRD can request proof for up to 7 years
3. **Claim for your partner too** — If you file separately, ensure each partner claims their own donations
4. **Set a reminder** — Mark 31 March in your calendar as the annual claim deadline

## How DearGiver Makes It Easy

Our platform automatically:
- ✅ Issues IRD-approved receipts for every donation
- ✅ Consolidates your annual giving into a downloadable summary
- ✅ Calculates your estimated tax refund in real-time
- ✅ Stores receipts securely in your Receipt Vault

*Visit your [Dashboard](/dashboard) to see your current tax refund estimate and download your tax summary.*`,
  },
  {
    id: 'blog-003',
    slug: 'wellington-mural-project-transforms-neighbourhoods',
    title: 'Wellington Mural Project Transforms 4 Neighbourhoods Through Art',
    excerpt: 'The "Supporting Local Art" campaign has commissioned 12 murals across Wellington, turning grey walls into vibrant celebrations of community and culture.',
    category: 'Community',
    author: 'Aroha Tūhoe',
    authorRole: 'Community Editor',
    date: '2026-04-28',
    readTime: '4 min read',
    image: '/images/charity-art.png',
    featured: false,
    content: `Walk down Cuba Street on any given day and you'll notice something different. Where once stood blank concrete walls, there are now explosions of colour — a 10-metre-tall pōhutukawa tree, a pod of Hector's dolphins, and a portrait of a kuia telling stories to her mokopuna.

## The Transformation

The "Supporting Local Art" campaign, funded through DearGiver, has commissioned 12 large-scale murals across four Wellington suburbs:

- **Newtown** — 3 murals celebrating the suburb's multicultural heritage
- **Island Bay** — 2 marine-themed murals along the coastal walkway
- **Aro Valley** — 4 murals by emerging local artists
- **Kilbirnie** — 3 murals depicting community stories

## The Artists

Twenty-five local artists have been involved, each bringing their unique perspective:

"For me, public art is about giving something back to the community that raised me," says muralist Kahu Williams. "Every time someone smiles at my mural, that's the payoff."

## Beyond Aesthetics

The impact extends beyond visual beauty:

- **Foot traffic** to local businesses near murals increased by 22%
- **Community engagement** in mural areas rose by 15%
- **Graffiti incidents** dropped by 40% on muralled surfaces
- **12 youth apprentices** gained real-world art experience

## What's Next

With $19,250 raised of the $24,000 goal and only 20 days remaining, the campaign is in its final push. The last 3 murals are scheduled for completion in June 2026.

*Support Wellington's creative community — [donate to the campaign](/campaigns/supporting-local-art) today.*`,
  },
];

// --- 유틸리티 함수 ---

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((p) => p.featured);
}

export function formatBlogDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
