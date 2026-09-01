'use client';

import { useRef, useEffect, useState } from 'react';
import { Container, Text, Group, Card, Progress, Box, ActionIcon, Loader } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getPublicProjects } from '@/lib/api';
import { adaptProject, type AdaptedProject } from '@/lib/adapters';
import classes from './TrendingNow.module.css';

export function TrendingNow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();

  // 백엔드 실데이터 (FE-009) — 모금액 높은 순 상위 노출
  const [trendingCampaigns, setTrendingCampaigns] = useState<AdaptedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublicProjects({ pageSize: 24 })
      .then((res) => {
        if (cancelled) return;
        const items = res.items
          .map(adaptProject)
          .sort((a, b) => {
            const pa = a.goal > 0 ? a.raised / a.goal : 0;
            const pb = b.goal > 0 ? b.raised / b.goal : 0;
            return pb - pa;
          })
          .slice(0, 8);
        setTrendingCampaigns(items);
      })
      .catch(() => { /* 홈 섹션 — 실패 시 조용히 */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && trendingCampaigns.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section
      className={`${classes.section} ${isVisible ? classes.visible : classes.hidden}`}
      ref={sectionRef}
    >
      <Container size="xl">
        <Group justify="space-between" mb={20}>
          <Group gap={10}>
            <Text size="xl" fw={800} c="var(--bm-text-dark)">
              🌿 Explore Causes
            </Text>
          </Group>
          <Group gap={8}>
            <ActionIcon
              variant="subtle"
              color="dark"
              size="lg"
              radius="xl"
              onClick={() => scroll('left')}
              className={classes.scrollBtn}
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="dark"
              size="lg"
              radius="xl"
              onClick={() => scroll('right')}
              className={classes.scrollBtn}
            >
              <IconChevronRight size={20} />
            </ActionIcon>
            <Text
              component={Link}
              href="/projects"
              size="sm"
              fw={600}
              c="var(--bm-terracotta)"
              className={classes.seeAll}
            >
              See all →
            </Text>
          </Group>
        </Group>

        {loading ? (
          <Box ta="center" py={30}><Loader color="sage" size="md" /></Box>
        ) : (
        <div className={classes.scrollContainer} ref={scrollRef}>
          {trendingCampaigns.map((campaign) => {
            const progress = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
            return (
            <Link key={campaign.id} href={`/projects/${campaign.slug}`} style={{ textDecoration: 'none' }}>
            <Card
              shadow="sm"
              radius="lg"
              padding={0}
              className={classes.miniCard}
              withBorder
            >
              <Card.Section className={classes.miniImageSection}>
                <div className={classes.miniImageWrapper}>
                  <NextImage
                    src={campaign.image}
                    alt={campaign.name}
                    fill
                    sizes="210px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Card.Section>
              <Box p="sm">
                <Text fw={600} size="sm" c="var(--bm-text-dark)" lineClamp={1} mb={8}>
                  {campaign.name}
                </Text>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Funded</Text>
                  <Text size="xs" fw={600} c="var(--bm-sage-dark)">{progress}%</Text>
                </Group>
                <Progress value={progress} color="sage" size="xs" radius="xl" />
              </Box>
            </Card>
            </Link>
            );
          })}
        </div>
        )}
      </Container>
    </section>
  );
}
