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
  IconFileText,
  IconUsers,
  IconWorld,
  IconLeaf,
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
              How It Works
            </Title>
            <Text size="md" c="var(--bm-text-muted)" mb={40} maw={500}>
              Three simple steps to make a difference and get rewarded.
            </Text>

            <Box maw={600}>
              <Timeline active={-1} bulletSize={40} lineWidth={2} color="sage">
                <Timeline.Item
                  title="Find a Cause"
                  bullet={<IconSearch size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Browse verified campaigns across Aotearoa. Filter by category, region, 
                    or search for causes that matter to you.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Donate Securely"
                  bullet={<IconCreditCard size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    Pay safely with card or bank transfer via Stripe. Your donation goes 
                    directly to the charity — we never hold your funds.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  title="Claim Your Tax Refund"
                  bullet={<IconFileText size={20} />}
                >
                  <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mt={4}>
                    We automatically consolidate your donation receipts. At tax time, 
                    claim your 33.33% tax credit with one click — it&apos;s that simple.
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

        {/* CTA */}
        <section className={classes.ctaSection}>
          <Container size="sm" style={{ textAlign: 'center' }}>
            <Title order={2} c="white" mb={12}>
              Ready to Make a Difference?
            </Title>
            <Text size="lg" c="rgba(255,255,255,0.7)" mb={32}>
              Explore verified campaigns and find a cause that speaks to you.
            </Text>
            <Button
              component={Link}
              href="/projects"
              size="lg"
              radius="xl"
              color="white"
              variant="white"
              className={classes.ctaBtn}
            >
              Explore Campaigns
            </Button>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
