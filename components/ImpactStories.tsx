'use client';

import { Container, SimpleGrid, Card, Text, Title, Badge, Group, Box } from '@mantine/core';
import { IconHeart, IconClock, IconLeaf } from '@tabler/icons-react';
import NextImage from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import classes from './ImpactStories.module.css';

const stories = [
  {
    id: 1,
    title: 'How $500 Changed a Classroom in Christchurch',
    image: '/images/trending-food.png',
    readTime: '3 min read',
    likes: 7371,
    category: 'Education',
  },
  {
    id: 2,
    title: 'Empowering Education: A New School Library Opens',
    image: '/images/trending-music.png',
    readTime: '4 min read',
    likes: 1738,
    category: 'Community',
  },
  {
    id: 3,
    title: 'Cleaning Our Coasts, One Beach at a Time',
    image: '/images/trending-beach.png',
    readTime: '3 min read',
    likes: 2306,
    category: 'Environment',
  },
];

function formatLikes(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function ImpactStories() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={classes.section} ref={ref}>
      <Container size="xl">
        <Group justify="space-between" mb={8}
          className={`${classes.sectionHeader} ${isVisible ? classes.visible : ''}`}
        >
          <Group gap={10}>
            <IconLeaf size={22} color="var(--bm-sage)" />
            <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
              Impact Stories
            </Text>
          </Group>
          <Text
            component="a"
            href="/blog"
            size="sm"
            fw={600}
            c="var(--bm-text-muted)"
            className={classes.readMore}
          >
            Read more stories →
          </Text>
        </Group>

        <Title order={2}
          className={`${classes.sectionTitle} ${isVisible ? classes.visible : ''}`}
          mb={36}
        >
          Real Change, Real People
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={{ base: 20, sm: 24 }}>
          {stories.map((story, index) => (
            <Card
              key={story.id}
              shadow="sm"
              radius="lg"
              padding={0}
              className={`${classes.storyCard} ${isVisible ? classes.visible : ''}`}
              style={{ transitionDelay: `${0.15 + index * 0.12}s` }}
              withBorder
            >
              <Card.Section className={classes.imageSection}>
                <div className={classes.imageWrapper}>
                  <NextImage
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <Badge
                  className={classes.categoryBadge}
                  color="sage"
                  variant="filled"
                  size="sm"
                >
                  {story.category}
                </Badge>
              </Card.Section>

              <Box p="md">
                <Text fw={700} size="md" c="var(--bm-text-dark)" lh={1.4} mb={12} lineClamp={2}>
                  {story.title}
                </Text>

                <Group justify="space-between">
                  <Badge
                    variant="light"
                    color="sage"
                    size="sm"
                    leftSection={<IconClock size={12} />}
                  >
                    {story.readTime}
                  </Badge>
                  <Group gap={4}>
                    <IconHeart size={14} color="var(--bm-terracotta)" />
                    <Text size="xs" c="dimmed">{formatLikes(story.likes)}</Text>
                  </Group>
                </Group>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
