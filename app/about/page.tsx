'use client';

import { Fraunces } from 'next/font/google';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Box,
  Group,
  ThemeIcon,
  Button,
  Timeline,
  Badge,
} from '@mantine/core';
import {
  IconHeart,
  IconShieldCheck,
  IconReceipt,
  IconSearch,
  IconCreditCard,
  IconUsers,
  IconWorld,
  IconLeaf,
  IconFolderCheck,
  IconChartBar,
  IconCircleCheck,
  IconEyeOff,
  IconBuilding,
  IconSparkles,
  IconRepeat,
  IconRoute,
  IconArrowRight,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// 히어로/워드마크와 통일된 디스플레이 세리프
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], style: ['normal'] });

const values = [
  {
    icon: IconShieldCheck,
    title: 'Confidence Through Clarity',
    description: 'We focus on approved donee organisations, making the details people need easier to find, understand, and trust.',
  },
  {
    icon: IconBuilding,
    title: 'Respect for Organisations',
    description: 'Organisations deserve space to share their work, manage their presence, and be represented with care.',
  },
  {
    icon: IconReceipt,
    title: 'Tax Time, Simplified',
    description: 'Receipts and giving details stay organised, making donation tax credit claims easier to manage.',
  },
  {
    icon: IconEyeOff,
    title: 'Privacy With Choice',
    description: 'Giving is personal. We treat information with care and give people choice over how their support appears.',
  },
  {
    icon: IconSparkles,
    title: 'Generosity Made Visible',
    description: 'We help people keep sight of their giving journey, so the impact they support feels more tangible.',
  },
  {
    icon: IconUsers,
    title: 'Giving, More Connected',
    description: 'We help generosity feel closer to the people, communities, and work behind each cause.',
  },
];

const differentiators = [
  {
    icon: IconSearch,
    color: 'sage',
    title: 'Meaningful Discovery',
    description: 'Find important work happening in communities across New Zealand, including smaller organisations that can be harder to discover.',
    badge: null,
  },
  {
    icon: IconReceipt,
    color: 'terracotta',
    title: 'Donation Tax Credit Support',
    description: 'Donation records and annual summaries are carefully organised, helping people keep track of tax credit claims and sustain their giving.',
    badge: null,
  },
  {
    icon: IconChartBar,
    color: 'blue',
    title: 'Giving Journey Insights',
    description: 'See your giving through a personal impact dashboard with giving trends, milestones, and gentle prompts that keep your generosity visible.',
    badge: null,
  },
  {
    icon: IconEyeOff,
    color: 'grape',
    title: 'Give Your Way',
    description: 'Give personally, on behalf of your organisation, or privately when you prefer — with receipt details shaped around how you choose to support.',
    badge: null,
  },
  {
    icon: IconRepeat,
    color: 'orange',
    title: 'Flexible Recurring Giving',
    description: 'Set up regular giving that works for you, with the freedom to manage, pause, or adjust your giving whenever you need.',
    badge: null,
  },
  {
    icon: IconRoute,
    color: 'sage',
    title: 'Support Connections',
    description: 'Track your relationship with each organisation you support — your first gift, total given, and key moments along the way.',
    badge: null,
  },
];

/**
 * 편지를 주고받는 손 — 라인아트 일러스트 (update 4).
 * 'Dear someone,'으로 시작하는 개인적인 편지를 건네는 장면을
 * 별도 이미지 박스 없이 배경 위에 자연스럽게 얹는다.
 */
function LetterExchangeArt() {
  return (
    <svg viewBox="0 0 380 320" fill="none" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      {/* 배경 소프트 블롭 */}
      <ellipse cx="200" cy="175" rx="165" ry="130" fill="rgba(143,151,121,0.09)" />
      <ellipse cx="235" cy="150" rx="105" ry="85" fill="rgba(216,169,95,0.07)" />

      {/* 점선 궤적 + 작은 하트 */}
      <path d="M105 118 C150 62 255 56 308 98" stroke="#c9a05c" strokeWidth="1.6" strokeDasharray="1.5 8" strokeLinecap="round" />
      <path d="M296 78 c2.6-4 8-4 10 0 c2-4 7.4-4 10 0 c2.6 4-2 9-10 14 c-8-5-12.6-10-10-14z" fill="#e2725b" opacity="0.8" transform="scale(0.72) translate(118 22)" />
      <path d="M118 96 c2.6-4 8-4 10 0 c2-4 7.4-4 10 0 c2.6 4-2 9-10 14 c-8-5-12.6-10-10-14z" fill="#8f9779" opacity="0.65" transform="scale(0.55) translate(88 62)" />

      {/* 봉투 (살짝 기울임) */}
      <g transform="rotate(-7 205 185)">
        <rect x="128" y="146" width="154" height="96" rx="10" fill="#faf6ee" stroke="#c9a05c" strokeWidth="2" />
        <path d="M130 152 L205 204 L280 152" stroke="#c9a05c" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* 하트 실링 */}
        <path d="M205 196 c3.4-5.2 10.4-5.2 13 0 c2.6-5.2 9.6-5.2 13 0 c3.4 5.2-2.6 11.7-13 18.2 c-10.4-6.5-16.4-13-13-18.2z" fill="#e2725b" transform="translate(-13 -6) scale(0.92)" />
        {/* Dear friend, 손글씨 */}
        <text x="205" y="232" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="14.5" fill="#a9814e">Dear friend,</text>
      </g>

      {/* 건네는 손 (좌하단) — 미니멀 라인 */}
      <g stroke="#4a7c71" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M16 268 C58 276 104 268 138 244 C148 237 158 234 167 238" />
        <path d="M132 250 C140 260 154 263 165 256" />
        <path d="M42 276 C74 282 108 276 134 262" opacity="0.55" />
      </g>

      {/* 받는 손 (우상단) — 미니멀 라인 */}
      <g stroke="#4a7c71" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M366 84 C330 76 296 86 272 108 C264 115 255 118 247 115" />
        <path d="M280 100 C274 90 262 86 252 91" />
        <path d="M352 66 C324 62 298 70 278 86" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* Hero */}
        <section className={classes.heroSection} style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 우측 여백에 배경처럼 얹히는 편지 일러스트 */}
          <Box
            visibleFrom="md"
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 330,
              pointerEvents: 'none',
            }}
          >
            <LetterExchangeArt />
          </Box>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconLeaf size={24} color="var(--bm-terracotta)" />
              <Text size="md" fw={800} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
                About Us
              </Text>
            </Group>
            <Title order={1} className={`${classes.heroTitle} ${fraunces.className}`}>
              Helping generosity<br />find its way
            </Title>
            <Text fz={19} c="var(--bm-text-muted)" maw={640} lh={1.8} mt={16}>
              Dear Giver is a New Zealand-based social-impact platform designed for both
              sides of giving — donors and organisations. We help people give with confidence
              and keep their giving records organised, while helping organisations share
              their work, simplify donation admin, and build stronger supporter relationships.
            </Text>
          </Container>
        </section>

        {/* Our Values */}
        <section className={classes.section}>
          <Container size="lg">
            <Title order={2} className={classes.sectionTitle} mb={8}>
              What We Stand For
            </Title>
            <Text fz={17} c="var(--bm-text-muted)" mb={40} maw={620} lh={1.8}>
              Good intentions deserve a clearer path — one that helps people give with
              understanding and helps organisations be seen and supported with care.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={24}>
              {values.map((item) => (
                <Card key={item.title} padding="xl" radius="lg" withBorder className={classes.valueCard}>
                  <ThemeIcon size={48} radius="md" color="sage" variant="light" mb={16}>
                    <item.icon size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>
                    {item.title}
                  </Text>
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                    {item.description}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </section>

        {/* How It Works */}
        <section className={classes.section} id="how-it-works">
          <Container size="lg">
            <Title order={2} className={classes.sectionTitle} mb={8}>
              How Dear Giver Works
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={560} lh={1.7}>
              From heartfelt giving to organised tax time — we help keep the details
              together, so you can stay close to the causes you care about.
            </Text>

            <Box maw={600}>
              <Timeline active={-1} bulletSize={40} lineWidth={2} color="sage">
                <Timeline.Item
                  title="Explore"
                  bullet={<IconSearch size={20} />}
                  styles={{ itemBullet: { backgroundColor: '#3f6f60', borderColor: '#3f6f60' } }}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Find verified charities and community projects across Aotearoa.
                    Every charity is registered with NZ Charities Services.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Give with Heart"
                  bullet={<IconCreditCard size={20} />}
                  styles={{ itemBullet: { backgroundColor: '#5d8266', borderColor: '#5d8266' } }}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Choose one-time or monthly, personally or as an organisation.
                    Your donation goes directly to the charity through Stripe — we never touch your money.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="We Keep Track"
                  bullet={<IconFolderCheck size={20} />}
                  styles={{ itemBullet: { backgroundColor: '#8f9779', borderColor: '#8f9779' } }}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Every donation receipt is saved to your personal dashboard
                    automatically. Nothing to print, nothing to lose.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Review & Prepare"
                  bullet={<IconChartBar size={20} />}
                  styles={{ itemBullet: { backgroundColor: '#b99f5e', borderColor: '#b99f5e' } }}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    See your full giving history, check your tax credit estimate,
                    and download a year-end summary when you&apos;re ready.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Claim with Ease"
                  bullet={<IconCircleCheck size={20} />}
                  styles={{ itemBullet: { backgroundColor: '#d8a95f', borderColor: '#d8a95f' } }}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Use your organised records to file your Donation Tax Credit
                    with IRD — it takes minutes, not hours.
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Box>
          </Container>
        </section>

        {/* Mission & Vision */}
        <section className={classes.section} id="community" style={{ background: 'white' }}>
          <Container size="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={48}>
              <Box>
                <Group gap={8} mb={12}>
                  <IconWorld size={20} color="var(--bm-terracotta)" />
                  <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)">Our Mission</Text>
                </Group>
                <Title order={3} className={classes.missionTitle}>
                  To help generosity across New Zealand grow into lasting support
                </Title>
                <Text size="md" c="var(--bm-text-muted)" lh={1.8} mt={16}>
                  We believe giving should feel easy, connected, and thoughtfully supported.
                  By empowering people to give with confidence and equipping organisations
                  with tools to manage giving, we help keep generosity moving.
                </Text>
              </Box>
              <Box>
                <Group gap={8} mb={12}>
                  <IconLeaf size={20} color="var(--bm-sage)" />
                  <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)">Our Vision</Text>
                </Group>
                <Title order={3} className={classes.missionTitle}>
                  A connected giving culture where every act of kindness goes further
                </Title>
                <Text size="md" c="var(--bm-text-muted)" lh={1.8} mt={16}>
                  We envision a future where people can see how their contributions are
                  helping, organisations can focus more on their mission and less on admin,
                  and communities are strengthened by collective generosity.
                </Text>
              </Box>
            </SimpleGrid>
          </Container>
        </section>

        {/* 수수료 투명성 섹션 */}
        <section className={classes.section} id="how-we-work" style={{ background: 'var(--bm-sage-bg, #f4f8f6)' }}>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
              <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                How We&apos;re Funded
              </Text>
            </Group>
            <Title order={2} className={classes.sectionTitle} mb={8}>
              Built on Transparency
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={620} lh={1.8}>
              Dear Giver is funded through organisation subscriptions and service fees,
              so we can build and maintain thoughtful tools for giving and donation admin.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={20}>
              <Card padding="xl" radius="lg" withBorder className={classes.valueCard}>
                <ThemeIcon size={48} radius="md" color="sage" variant="light" mb={16}>
                  <IconHeart size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>Donations stay direct</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Donations are processed through the organisation&apos;s own payment setup,
                  not held by us in a pooled fund for later redistribution.
                </Text>
              </Card>

              <Card padding="xl" radius="lg" withBorder className={classes.valueCard} style={{ borderColor: 'var(--bm-sage)', borderWidth: 2 }}>
                <ThemeIcon size={48} radius="md" color="sage" variant="filled" mb={16}>
                  <IconShieldCheck size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>Donors choose what they give</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Give what you choose, with no required platform fee at checkout.
                  Receipts are stored automatically, with standardised details to support
                  your IRD tax credit claim.
                </Text>
              </Card>

              <Card padding="xl" radius="lg" withBorder className={classes.valueCard}>
                <ThemeIcon size={48} radius="md" color="terracotta" variant="light" mb={16}>
                  <IconChartBar size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>Supported by organisations</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Claim and manage a profile for free. A service fee applies only to
                  donations processed through our platform. Full plan details are on the{' '}
                  <Link href="/charity/apply" style={{ color: 'var(--bm-sage-dark)' }}>organisation registration page</Link>.
                </Text>
              </Card>
            </SimpleGrid>
          </Container>
        </section>

        {/* Why Dear Giver Is Different */}
        <section className={classes.section}>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconSparkles size={20} color="var(--bm-terracotta)" />
              <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
                What Sets Us Apart
              </Text>
            </Group>
            <Title order={2} className={classes.sectionTitle} mb={8}>
              Thoughtful Features for Giving
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={620} lh={1.8}>
              Dear Giver brings practical tools together in one place — making giving
              easier to manage and follow over time.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
              {differentiators.map((item) => (
                <Card key={item.title} padding="xl" radius="lg" withBorder className={classes.valueCard}>
                  <Group justify="space-between" mb={12}>
                    <ThemeIcon size={44} radius="md" color={item.color} variant="light">
                      <item.icon size={22} />
                    </ThemeIcon>
                    {item.badge && (
                      <Badge size="xs" variant="light" color={item.color}>{item.badge}</Badge>
                    )}
                  </Group>
                  <Text fw={700} size="md" c="var(--bm-text-dark)" mb={6}>
                    {item.title}
                  </Text>
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                    {item.description}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </section>

        {/* CTA - 기부자 + 단체 이중 */}
        <section className={classes.ctaSection}>
          <Container size="md" style={{ textAlign: 'center' }}>
            <Title order={2} c="white" mb={12}>
              Ready to Get Started?
            </Title>
            <Text size="lg" c="rgba(255,255,255,0.7)" mb={40}>
              Whether you&apos;re here to give or to grow — Dear Giver is for you.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={24} maw={700} mx="auto">
              <Card padding="xl" radius="lg" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Text size="xs" fw={600} tt="uppercase" c="rgba(255,255,255,0.6)" mb={16} style={{ letterSpacing: '1px' }}>
                  For Donors
                </Text>
                <Text size="sm" c="rgba(255,255,255,0.8)" lh={1.7} mb={20}>
                  Explore verified NZ charities, earn milestones, auto-calculate your tax credits,
                  and follow your giving journey over time.
                </Text>
                <Button
                  component={Link}
                  href="/projects"
                  size="md"
                  radius="xl"
                  color="white"
                  variant="white"
                  className={classes.ctaBtn}
                  fullWidth
                >
                  Explore Campaigns
                </Button>
              </Card>
              <Card padding="xl" radius="lg" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Text size="xs" fw={600} tt="uppercase" c="rgba(255,255,255,0.6)" mb={16} style={{ letterSpacing: '1px' }}>
                  For Charities
                </Text>
                <Text size="sm" c="rgba(255,255,255,0.8)" lh={1.7} mb={4}>
                  Register for free. No donations = no cost.
                </Text>
                <Text size="sm" c="rgba(255,255,255,0.6)" lh={1.7} mb={20}>
                  Early Access spots are open now — join early for founding-charity benefits
                  and a 30-day free trial of our paid plan.
                </Text>
                <Button
                  component={Link}
                  href="/charity/apply"
                  size="md"
                  radius="xl"
                  variant="outline"
                  color="white"
                  fullWidth
                  style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
                >
                  Register Charity
                </Button>
              </Card>
            </SimpleGrid>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
