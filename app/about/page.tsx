'use client';

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

const values = [
  {
    icon: IconHeart,
    title: 'Transparency',
    description: 'Every dollar is tracked. See exactly where your donation goes and the impact it creates.',
  },
  {
    icon: IconShieldCheck,
    title: 'Trust & Verification',
    description: 'All charities are verified with NZ Charities Services. We display their CC registration number so you can confirm.',
  },
  {
    icon: IconReceipt,
    title: 'Tax Made Simple',
    description: 'Auto-generated receipts, annual tax summaries, and 33.33% tax credit calculations — all in your dashboard.',
  },
  {
    icon: IconEyeOff,
    title: 'Privacy & Choice',
    description: 'Donate anonymously or in your organisation\'s name — you decide how your generosity appears.',
  },
  {
    icon: IconSparkles,
    title: 'Impact Tracking',
    description: 'Milestones, giving streaks, and a personal journey timeline — watch your generosity grow over time.',
  },
  {
    icon: IconUsers,
    title: 'Community First',
    description: 'Built by and for Aotearoa. We connect Kiwi donors with local charities making a real difference.',
  },
];

const differentiators = [
  {
    icon: IconReceipt,
    color: 'sage',
    title: 'NZ Tax Credit Engine',
    description: 'Automatic 33.33% tax credit calculations, annual summaries, and IRD-ready PDF exports. No other NZ platform does this.',
    badge: 'NZ Exclusive',
  },
  {
    icon: IconSparkles,
    color: 'terracotta',
    title: 'Impact Dashboard & Milestones',
    description: '8 achievement badges, giving streaks, monthly trend charts, and personalised encouragement messages.',
    badge: 'Unique',
  },
  {
    icon: IconBuilding,
    color: 'blue',
    title: 'Personal & Organisation Giving',
    description: 'Donate as yourself or in your organisation\'s legal name, with receipts issued accordingly — and go anonymous whenever you prefer.',
    badge: 'Unique',
  },
  {
    icon: IconRoute,
    color: 'grape',
    title: 'Donor Journey Timeline',
    description: 'Track your relationship with every charity — first donation date, total given, per-charity timeline with visual dots.',
    badge: 'Unique',
  },
  {
    icon: IconRepeat,
    color: 'orange',
    title: 'Smart Recurring',
    description: 'Set up monthly giving with annual impact projections. Manage, pause, or adjust subscriptions from your dashboard.',
    badge: null,
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* Hero */}
        <section className={classes.heroSection}>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconLeaf size={22} color="var(--bm-terracotta)" />
              <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
                About Us
              </Text>
            </Group>
            <Title order={1} className={classes.heroTitle}>
              Connecting Hearts,<br />Changing the World
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={600} lh={1.8} mt={16}>
              DearGiver is a New Zealand-based giving platform that makes generosity effortless.
              We connect donors with verified charities, automate tax credits, and turn every
              donation into a meaningful journey — with impact milestones, donor journeys, and more.
            </Text>
          </Container>
        </section>

        {/* Our Values */}
        <section className={classes.section}>
          <Container size="lg">
            <Title order={2} className={classes.sectionTitle} mb={8}>
              What We Stand For
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={500}>
              Our platform is built on core principles that guide everything we do.
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
              How DearGiver Works
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={540} lh={1.7}>
              From heartfelt giving to hassle-free tax time — we handle the paperwork so you can focus on making a difference.
            </Text>

            <Box maw={600}>
              <Timeline active={-1} bulletSize={40} lineWidth={2} color="sage">
                <Timeline.Item
                  title="Explore"
                  bullet={<IconSearch size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Find verified charities and community projects across Aotearoa.
                    Every charity is registered with NZ Charities Services.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Give with Heart"
                  bullet={<IconCreditCard size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Choose one-time or monthly, personally or as an organisation.
                    Your donation goes directly to the charity through Stripe — we never touch your money.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="We Keep Track"
                  bullet={<IconFolderCheck size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Every donation receipt is saved to your personal dashboard
                    automatically. Nothing to print, nothing to lose.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Review & Prepare"
                  bullet={<IconChartBar size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    See your full giving history, check your tax credit estimate,
                    and download a year-end summary when you&apos;re ready.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Claim with Ease"
                  bullet={<IconCircleCheck size={20} />}
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
                  Making generosity effortless for every New Zealander
                </Title>
                <Text size="md" c="var(--bm-text-muted)" lh={1.8} mt={16}>
                  We believe that giving should be as easy as shopping online. By removing 
                  friction from the donation process and simplifying tax receipts, we help 
                  more Kiwis give more — and feel great about it.
                </Text>
              </Box>
              <Box>
                <Group gap={8} mb={12}>
                  <IconLeaf size={20} color="var(--bm-sage)" />
                  <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)">Our Vision</Text>
                </Group>
                <Title order={3} className={classes.missionTitle}>
                  A connected community where every act of kindness counts
                </Title>
                <Text size="md" c="var(--bm-text-muted)" lh={1.8} mt={16}>
                  We envision a future where donors can see the tangible impact of their 
                  contributions, charities can focus on their mission instead of admin, 
                  and communities thrive through collective generosity.
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
              Honest. Simple. Transparent.
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={560} lh={1.8}>
              We believe you deserve to know exactly what happens to every dollar.
              Donors never pay mandatory fees — here&apos;s our full breakdown.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={20} mb={32}>
              <Card padding="xl" radius="lg" withBorder className={classes.valueCard}>
                <ThemeIcon size={48} radius="md" color="sage" variant="light" mb={16}>
                  <IconHeart size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>Your Donation</Text>
                <Text size="xl" fw={900} c="var(--bm-terracotta)" mb={8}>100%</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Every cent you choose to donate goes directly to your chosen charity via Stripe.
                  We never touch or hold your funds.
                </Text>
              </Card>

              <Card padding="xl" radius="lg" withBorder className={classes.valueCard} style={{ borderColor: 'var(--bm-sage)', borderWidth: 2 }}>
                <ThemeIcon size={48} radius="md" color="sage" variant="filled" mb={16}>
                  <IconShieldCheck size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>For Donors</Text>
                <Text size="xl" fw={900} c="var(--bm-sage-dark)" mb={8}>$0 Added</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  You pay <strong>exactly what you choose to give</strong> — nothing is added
                  at checkout. Your donation receipts are stored automatically, ready for
                  your IRD tax credit claim.
                </Text>
              </Card>

              <Card padding="xl" radius="lg" withBorder className={classes.valueCard}>
                <ThemeIcon size={48} radius="md" color="terracotta" variant="light" mb={16}>
                  <IconChartBar size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>For Charities</Text>
                <Text size="xl" fw={900} c="var(--bm-terracotta)" mb={8}>From $0</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Charities start completely free — a small service cost only applies when
                  donations come through. Full plan details are on the{' '}
                  <Link href="/charity/apply" style={{ color: 'var(--bm-sage-dark)' }}>charity registration page</Link>.
                </Text>
              </Card>
            </SimpleGrid>

            <Card padding="lg" radius="lg" withBorder style={{ borderLeft: '4px solid var(--bm-sage)', background: 'white' }}>
              <Group gap={10} mb={12}>
                <IconShieldCheck size={18} color="var(--bm-sage-dark)" />
                <Text fw={700} size="sm" c="var(--bm-sage-dark)">Real Example: A $50 NZD donation</Text>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 4 }} spacing={12}>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Donor pays</Text>
                  <Text fw={700} size="md" c="var(--bm-text-dark)">$50.00</Text>
                  <Text size="xs" c="var(--bm-text-muted)">Exactly what you chose — nothing added</Text>
                </Box>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Payment processing</Text>
                  <Text fw={700} size="md" c="dimmed">~$1.65</Text>
                  <Text size="xs" c="var(--bm-text-muted)">Stripe ~2.7% + $0.30, handled charity-side</Text>
                </Box>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Charity receives</Text>
                  <Text fw={700} size="md" c="var(--bm-terracotta)">$50 − costs</Text>
                  <Text size="xs" c="var(--bm-text-muted)">Processing & service costs come from the charity side</Text>
                </Box>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Your IRD tax credit</Text>
                  <Text fw={700} size="md" c="var(--bm-sage-dark)">~$16.65</Text>
                  <Text size="xs" c="var(--bm-text-muted)">33.33% of $50 via myIR</Text>
                </Box>
              </SimpleGrid>
            </Card>
          </Container>
        </section>

        {/* Why DearGiver Is Different */}
        <section className={classes.section}>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconSparkles size={20} color="var(--bm-terracotta)" />
              <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
                What Sets Us Apart
              </Text>
            </Group>
            <Title order={2} className={classes.sectionTitle} mb={8}>
              Features You Won&apos;t Find Elsewhere
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={560} lh={1.8}>
              We built DearGiver with features that no other NZ giving platform offers.
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
              Whether you&apos;re here to give or to grow — DearGiver is for you.
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
