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
    description: 'All charities on our platform are verified and registered with New Zealand\'s Charities Services.',
  },
  {
    icon: IconReceipt,
    title: 'Tax Made Simple',
    description: 'We automatically generate your donation receipts and help you claim your 33.33% tax refund.',
  },
  {
    icon: IconUsers,
    title: 'Community First',
    description: 'We\'re built by and for the communities of Aotearoa, with a focus on local impact.',
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
              DearGiver is a New Zealand-based platform that makes giving effortless.
              We connect donors with verified charities, simplify payments, and help you
              claim your tax refund — all in one place.
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
              Our platform is built on four core principles that guide everything we do.
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
                    Choose one-time or monthly. Your donation goes directly to the
                    charity through Stripe — we never touch your money.
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
              We believe you deserve to know exactly what happens to every dollar you give.
              Here&apos;s a complete breakdown — no fine print, no surprises.
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
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>DearGiver Fee</Text>
                <Text size="xl" fw={900} c="var(--bm-sage-dark)" mb={8}>Just 1%</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  A simple 1% fee per donation (min $0.50). No subscriptions,
                  no hidden fees. This is how we keep the lights on — simply and fairly.
                </Text>
              </Card>

              <Card padding="xl" radius="lg" withBorder className={classes.valueCard}>
                <ThemeIcon size={48} radius="md" color="orange" variant="light" mb={16}>
                  <IconCreditCard size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>Stripe Processing</Text>
                <Text size="xl" fw={900} c="var(--bm-text-dark)" mb={8}>~1.5%</Text>
                <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                  Stripe charges a standard payment processing fee. You can choose to cover
                  this so 100% of your donation reaches the charity.
                </Text>
              </Card>
            </SimpleGrid>

            <Card padding="lg" radius="lg" withBorder style={{ borderLeft: '4px solid var(--bm-sage)', background: 'white' }}>
              <Group gap={10} mb={12}>
                <IconShieldCheck size={18} color="var(--bm-sage-dark)" />
                <Text fw={700} size="sm" c="var(--bm-sage-dark)">Real Example: A $50 NZD donation</Text>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={12}>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>You pay in total</Text>
                  <Text fw={700} size="md" c="var(--bm-text-dark)">$50.50</Text>
                  <Text size="xs" c="var(--bm-text-muted)">$50 donation + $0.50 DearGiver fee (1%)</Text>
                </Box>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Charity receives</Text>
                  <Text fw={700} size="md" c="var(--bm-terracotta)">$49.75</Text>
                  <Text size="xs" c="var(--bm-text-muted)">After Stripe processing (~1.5%)</Text>
                </Box>
                <Box>
                  <Text size="xs" c="var(--bm-text-muted)" mb={2}>Your IRD tax credit</Text>
                  <Text fw={700} size="md" c="var(--bm-sage-dark)">~$16.65</Text>
                  <Text size="xs" c="var(--bm-text-muted)">33.33% of $50 claimed via myIR</Text>
                </Box>
              </SimpleGrid>
            </Card>
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
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16} maw={520} mx="auto">
              <div style={{ textAlign: 'center' }}>
                <Text size="xs" fw={600} tt="uppercase" c="rgba(255,255,255,0.5)" mb={8} style={{ letterSpacing: '1px' }}>
                  For Donors
                </Text>
                <Button
                  component={Link}
                  href="/projects"
                  size="lg"
                  radius="xl"
                  color="white"
                  variant="white"
                  className={classes.ctaBtn}
                  fullWidth
                >
                  Explore Campaigns
                </Button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xs" fw={600} tt="uppercase" c="rgba(255,255,255,0.5)" mb={8} style={{ letterSpacing: '1px' }}>
                  For Charities
                </Text>
                <Button
                  component={Link}
                  href="/charity/apply"
                  size="lg"
                  radius="xl"
                  variant="outline"
                  color="white"
                  fullWidth
                  style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                >
                  Register Your Charity
                </Button>
              </div>
            </SimpleGrid>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
