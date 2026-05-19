'use client';

import { useRef } from 'react';
import { Container, Text, Group, Card, Progress, Box, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getTrendingCampaigns, getProgress } from '@/data/campaigns';
import classes from './TrendingNow.module.css';

const trendingCampaigns = getTrendingCampaigns();

export function TrendingNow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();

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

        <div className={classes.scrollContainer} ref={scrollRef}>
          {trendingCampaigns.map((campaign) => {
            const progress = getProgress(campaign);
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
      </Container>
    </section>
  );
}
