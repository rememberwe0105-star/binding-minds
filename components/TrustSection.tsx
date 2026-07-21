'use client';

import { Container, Text, Title, Box, Group, ThemeIcon, Button } from '@mantine/core';
import {
  IconHeartHandshake,
  IconEyeCheck,
  IconLockOpen,
  IconBuilding,
  IconArrowRight,
  IconRosetteDiscountCheck,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import classes from './TrustSection.module.css';

const promises = [
  {
    icon: IconHeartHandshake,
    title: 'Your money goes straight to the cause',
    description: 'We use Stripe Connect so donations are routed directly to each charity. DearGiver never holds, redirects, or touches your funds at any point.',
  },
  {
    icon: IconEyeCheck,
    title: 'Only real, registered charities',
    description: 'Every charity on DearGiver is cross-checked against the NZ Charities Register. If it\'s not verified, it\'s not on our platform.',
  },
  {
    icon: IconLockOpen,
    title: 'We keep things minimal and private',
    description: 'We collect only what\'s needed to generate your donation receipts. No tracking, no selling data, no surprises.',
  },
];

const charityPerks = [
  { icon: IconRosetteDiscountCheck, text: 'Start growing with no monthly fees' },
  { icon: IconUsers, text: 'Connect with Kiwi supporters where generosity begins' },
  { icon: IconBuilding, text: 'Spend less time on admin, more time creating impact' },
];

export function TrustSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={classes.section} ref={ref}>
      <Container size="lg">
        <div className={`${classes.grid} ${isVisible ? classes.visible : ''}`}>
          {/* 좌측 7 — Our Promise */}
          <div className={classes.trustCard}>
            <Group gap={10} mb={16}>
              <IconHeartHandshake size={22} color="var(--bm-sage-dark)" />
              <Text size="sm" fw={700} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                Our promise to every giver
              </Text>
            </Group>

            <Text size="md" c="var(--bm-text-muted)" lh={1.7} mb={28} maw={500}>
              We built DearGiver because giving should feel simple, safe, and honest.
              Here&apos;s how we hold ourselves to that standard.
            </Text>

            <div className={classes.trustList}>
              {promises.map((point) => (
                <div key={point.title} className={classes.trustItem}>
                  <ThemeIcon size={36} radius="md" color="sage" variant="light" className={classes.trustIcon}>
                    <point.icon size={18} stroke={1.5} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm" c="var(--bm-text-dark)" mb={2}>
                      {point.title}
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>
                      {point.description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>

            <Button
              component={Link}
              href="/about#how-we-work"
              variant="subtle"
              color="dark"
              size="sm"
              mt={20}
              rightSection={<IconArrowRight size={14} />}
              className={classes.learnMoreBtn}
            >
              Read more about how DearGiver works
            </Button>
          </div>

          {/* 우측 3 — Charity CTA */}
          <div className={classes.charityCard}>
            <div className={classes.charityBlob} />

            <Box style={{ position: 'relative', zIndex: 1 }}>
              <Group gap={8} mb={12}>
                <IconBuilding size={18} color="#b9dcc9" />
                {/* 어두운 카드 배경 대비 가독성을 위해 밝은 민트 톤 사용 */}
                <Text size="xs" fw={700} tt="uppercase" c="#b9dcc9" style={{ letterSpacing: '1px' }}>
                  For Charities
                </Text>
              </Group>

              <Title order={3} className={classes.charityTitle}>
                Your charity is already on DearGiver
              </Title>

              <Text size="sm" c="rgba(255,255,255,0.75)" lh={1.7} mt={10} mb={20}>
                Your organisation may already appear on DearGiver to help supporters
                find your work. Claim your profile to manage your details, share your
                story, and make it easier for them to give directly.
              </Text>

              <div className={classes.benefitsList}>
                {charityPerks.map(({ icon: Icon, text }) => (
                  <Group key={text} gap={8} mb={6}>
                    <ThemeIcon size={22} radius="sm" color="sage" variant="light">
                      <Icon size={12} />
                    </ThemeIcon>
                    <Text size="xs" c="rgba(255,255,255,0.85)">{text}</Text>
                  </Group>
                ))}
              </div>

              <Button
                component={Link}
                href="/charity/apply"
                size="sm"
                radius="xl"
                color="white"
                variant="white"
                fullWidth
                mt={20}
                rightSection={<IconArrowRight size={14} />}
                className={classes.claimBtn}
              >
                Claim your page
              </Button>
            </Box>
          </div>
        </div>
      </Container>
    </section>
  );
}
