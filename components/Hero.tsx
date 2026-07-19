'use client';

import { Container, Title, Text, Button, Group, Box, Card, Badge, Stack, ThemeIcon } from '@mantine/core';
import {
  IconSearch,
  IconShieldCheck,
  IconHeartHandshake,
  IconReceipt,
  IconBuildingCommunity,
} from '@tabler/icons-react';
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
    <section className={classes.hero}>
      {/* 유기적 배경 블롭 장식 */}
      <div className={classes.blobTopRight} />
      <div className={classes.blobBottomLeft} />

      <Container size="xl" className={classes.container}>
        <div className={classes.content}>
          {/* 왼쪽: 텍스트 블록 */}
          <Box className={classes.textBlock}>
            <Badge
              color="sage"
              variant="light"
              size="lg"
              radius="sm"
              className={classes.spotlightBadge}
            >
              Aotearoa&apos;s transparent giving platform
            </Badge>

            <Title order={1} className={classes.title}>
              Together, We Make a{' '}
              <span className={classes.highlight}>World</span> of Difference.
            </Title>

            <Text className={classes.subtitle} size="lg" c="var(--bm-text-muted)" maw={480}>
              Empower change across Aotearoa through community-driven initiatives.
              Find your cause and donate today.
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
                color="dark"
                className={classes.ctaSecondary}
              >
                Learn More
              </Button>
            </Group>
          </Box>

          {/* 오른쪽: 플랫폼 가치 카드 (특정 기관 노출 없음) */}
          <div className={classes.campaignBlock}>
            <Card
              shadow="xl"
              radius="lg"
              padding="xl"
              className={classes.campaignCard}
            >
              <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={16}>
                Why give through DearGiver?
              </Text>
              <Stack gap={16}>
                {PLATFORM_HIGHLIGHTS.map((item) => (
                  <Group key={item.title} gap={12} wrap="nowrap" align="flex-start">
                    <ThemeIcon size={38} radius="md" color={item.color} variant="light">
                      <item.icon size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={700} c="var(--bm-text-dark)">
                        {item.title}
                      </Text>
                      <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>
                        {item.description}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
