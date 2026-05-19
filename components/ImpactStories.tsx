'use client';

import { Container, SimpleGrid, Card, Text, Title, Badge, Group, Box } from '@mantine/core';
import { IconClock, IconLeaf } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { blogPosts } from '@/data/blog';
import classes from './ImpactStories.module.css';

// Impact Stories 카테고리의 글 먼저, 그 다음 최신 글 순으로 최대 3개 표시
const stories = [
  ...blogPosts.filter((p) => p.category === 'Impact Stories'),
  ...blogPosts.filter((p) => p.category !== 'Impact Stories'),
]
  .slice(0, 3)
  .map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.image,
    readTime: p.readTime,
    category: p.category,
    date: p.date,
  }));

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
            <Link
              key={story.id}
              href={`/blog/${story.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
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
                    <Text size="xs" c="dimmed">
                      {new Date(story.date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                    </Text>
                  </Group>
                </Box>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
