'use client';

import { Container, Title, Text, Button, Group, Box, Card, Badge, ThemeIcon, SimpleGrid } from '@mantine/core';
import {
  IconSearch,
  IconHeartHandshake,
  IconReceipt,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { fraunces } from '@/lib/fonts';
import classes from './Hero.module.css';

// 히어로는 특정 기관/캠페인을 노출하지 않는다 — 플랫폼 자체의 가치만 중립적으로 전달
const PLATFORM_HIGHLIGHTS = [
  {
    icon: IconSearch,
    color: 'sage',
    title: 'Good work, easier to discover',
    description: 'Find meaningful work happening in communities across New Zealand.',
  },
  {
    icon: IconBuildingCommunity,
    color: 'terracotta',
    title: 'Know the work before you give',
    description: 'A clearer picture of who you\'re supporting and why it matters.',
  },
  {
    icon: IconHeartHandshake,
    color: 'sage',
    title: 'Direct to the organisation',
    description: 'Donations go to the organisation — not held for later redistribution.',
  },
  {
    icon: IconReceipt,
    color: 'terracotta',
    title: 'Giving records, kept together',
    description: 'Your giving details in one place, ready when you need them.',
  },
];

export function Hero() {
  // 카드 행 스크롤 리빌 — 순차적으로 떠오르는 스태거 모션
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

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

              <Title order={1} className={`${classes.title} ${fraunces.className}`}>
                Where <span className={classes.highlight}>generosity</span><br />meets good work
              </Title>

              <Text className={classes.subtitle} fz={20} fw={500} maw={540}>
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
                  Explore Causes
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

            {/* 오른쪽: 아치형 이미지 + 오프셋 프레임 + 플로팅 칩 */}
            <div className={classes.campaignBlock}>
              <div className={classes.heroImageOuter}>
                <div className={classes.heroImageFrame} />
                <div className={classes.heroImageWrapper}>
                  <NextImage
                    src="/images/charity-art.png"
                    alt="Community artists painting a tui mural on Cuba Street, Wellington"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    style={{ objectFit: 'cover', objectPosition: '68% 42%' }}
                    priority
                  />
                  <div className={classes.heroImageScrim} />
                </div>
                <div className={classes.floatingChip}>
                  <span className={classes.floatingChipDot} />
                  Kindness, made visible.
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why give through Dear Giver — 히어로 바로 아래 카드 행 (스태거 리빌) ── */}
      <section className={classes.highlightsSection}>
        <Container size="xl">
          <SimpleGrid
            ref={cardsRef}
            cols={{ base: 1, xs: 2, md: 4 }}
            spacing={16}
            className={`${classes.highlightsRow} ${cardsVisible ? classes.cardsVisible : ''}`}
          >
            {PLATFORM_HIGHLIGHTS.map((item, index) => (
              <Card
                key={item.title}
                padding="lg"
                radius="lg"
                className={classes.highlightCard}
                style={{ transitionDelay: `${index * 110}ms` }}
              >
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
