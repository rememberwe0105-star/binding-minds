'use client';

import { Container, Title, Text, Button, Group, Box, Card, Badge, ThemeIcon, SimpleGrid } from '@mantine/core';
import {
  IconSearch,
  IconShieldCheck,
  IconHeartHandshake,
  IconReceipt,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import classes from './Hero.module.css';

// 히어로는 특정 기관/캠페인을 노출하지 않는다 — 플랫폼 자체의 가치만 중립적으로 전달
const PLATFORM_HIGHLIGHTS = [
  {
    icon: IconShieldCheck,
    color: 'sage',
    title: 'Verified NZ charities',
    description: 'Every organisation is checked against the NZ Charities Register.',
  },
  {
    icon: IconHeartHandshake,
    color: 'terracotta',
    title: '100% goes to the charity',
    description: 'You pay exactly what you choose to give — nothing added at checkout.',
  },
  {
    icon: IconReceipt,
    color: 'sage',
    title: 'Effortless tax receipts',
    description: 'Donation receipts are stored for you, ready for your IRD tax credit claim.',
  },
  {
    icon: IconBuildingCommunity,
    color: 'terracotta',
    title: 'For every cause',
    description: 'From conservation to community wellbeing — find causes across Aotearoa.',
  },
];

export function Hero() {
  return (
    <>
      {/* ── 다크 틸 히어로 (저채도 청록 배경 + 이미지) ── */}
      <section className={classes.hero}>
        <div className={classes.blobTopRight} />
        <div className={classes.blobBottomLeft} />

        <Container size="xl" className={classes.container}>
          <div className={classes.content}>
            {/* 왼쪽: 텍스트 블록 */}
            <Box className={classes.textBlock}>
              <Badge
                variant="light"
                size="lg"
                radius="sm"
                className={classes.spotlightBadge}
                color="gray"
                styles={{
                  root: {
                    background: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.85)',
                  },
                }}
              >
                Thoughtful giving platform for Aotearoa
              </Badge>

              <Title order={1} className={classes.title}>
                Where <span className={classes.highlight}>generosity</span> meets good work
              </Title>

              <Text className={classes.subtitle} fz={19} maw={520}>
                Discover organisations across New Zealand, understand their work,
                and support the causes you care about with more confidence.
              </Text>

              <Group gap="md" mt={32} className={classes.ctaGroup}>
                <Button
                  component={Link}
                  href="/projects"
                  size="lg"
                  radius="xl"
                  color="terracotta"
                  leftSection={<IconSearch size={20} />}
                  className={classes.ctaPrimary}
                >
                  Find a Cause
                </Button>
                <Button
                  component={Link}
                  href="/about"
                  size="lg"
                  radius="xl"
                  variant="outline"
                  className={classes.ctaSecondaryLight}
                >
                  Learn More
                </Button>
              </Group>
            </Box>

            {/* 오른쪽: 일러스트 이미지 */}
            <div className={classes.campaignBlock}>
              <div className={classes.heroImageWrapper}>
                <NextImage
                  src="/images/hero-campaign.png"
                  alt="Native forest of Aotearoa — watercolour illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why give through DearGiver — 히어로 바로 아래 카드 행 ── */}
      <section className={classes.highlightsSection}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing={16} className={classes.highlightsRow}>
            {PLATFORM_HIGHLIGHTS.map((item) => (
              <Card key={item.title} padding="lg" radius="lg" className={classes.highlightCard}>
                <ThemeIcon size={40} radius="md" color={item.color} variant="light" mb={10}>
                  <item.icon size={22} />
                </ThemeIcon>
                <Text size="sm" fw={700} c="var(--bm-text-dark)" mb={4}>
                  {item.title}
                </Text>
                <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>
                  {item.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
}
