'use client';

import { useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Box,
  SimpleGrid,
  TextInput,
  Button,
} from '@mantine/core';
import { IconClock, IconUser, IconMail, IconArrowRight } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { blogPosts, formatBlogDate } from '@/data/blog';
import classes from './page.module.css';

const categoryColors: Record<string, string> = {
  'Impact Stories': 'terracotta',
  'Tax Tips': 'sage',
  'Community': 'blue',
  'Platform Updates': 'grape',
};

export default function BlogPage() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const el = sectionRef.current;
    if (el) {
      el.querySelectorAll('.reveal, .revealScale').forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);

  const featured = blogPosts[0]; // First post is featured
  const otherPosts = blogPosts.slice(1);

  return (
    <>
      <Header />
      <main className={classes.page} ref={sectionRef}>
        <Container size="lg">
          {/* Page header */}
          <Box ta="center" mb={48} className="reveal">
            <Text size="sm" fw={600} c="var(--bm-terracotta)" tt="uppercase" mb={8} style={{ letterSpacing: '2px' }}>
              Stories & Insights
            </Text>
            <Title order={1} className={classes.pageTitle}>
              The Binding Minds Blog
            </Title>
            <Text size="md" c="var(--bm-text-muted)" maw={500} mx="auto" mt={8}>
              Impact stories, tax tips, and community news from across Aotearoa.
            </Text>
          </Box>

          {/* Featured post (large) */}
          <Link href={`/blog/${featured.slug}`} className={classes.featuredLink}>
            <Card radius="lg" padding={0} className={`${classes.featuredCard} reveal`}>
              <div className={classes.featuredLayout}>
                <div className={classes.featuredImageWrapper}>
                  <NextImage
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    style={{ objectFit: 'cover' }}
                  />
                  <Badge className={classes.featuredBadge} color="terracotta" variant="filled">
                    Featured
                  </Badge>
                </div>
                <Box className={classes.featuredContent}>
                  <Badge color={categoryColors[featured.category]} variant="light" size="sm" mb={12}>
                    {featured.category}
                  </Badge>
                  <Title order={2} className={classes.featuredTitle}>
                    {featured.title}
                  </Title>
                  <Text size="md" c="var(--bm-text-muted)" lh={1.7} mb={16} lineClamp={3}>
                    {featured.excerpt}
                  </Text>
                  <Group gap={16}>
                    <Group gap={4}>
                      <IconUser size={14} color="var(--bm-text-muted)" />
                      <Text size="xs" c="var(--bm-text-muted)">{featured.author}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconClock size={14} color="var(--bm-text-muted)" />
                      <Text size="xs" c="var(--bm-text-muted)">{featured.readTime}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{formatBlogDate(featured.date)}</Text>
                  </Group>
                </Box>
              </div>
            </Card>
          </Link>

          {/* Other posts */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={24} mt={40}>
            {otherPosts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className={classes.postLink}>
                <Card
                  radius="lg"
                  padding={0}
                  className={`${classes.postCard} reveal revealDelay${i + 1}`}
                >
                  <div className={classes.postImageWrapper}>
                    <NextImage
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <Box p="lg">
                    <Badge color={categoryColors[post.category]} variant="light" size="sm" mb={8}>
                      {post.category}
                    </Badge>
                    <Title order={3} className={classes.postTitle} lineClamp={2}>
                      {post.title}
                    </Title>
                    <Text size="sm" c="var(--bm-text-muted)" lh={1.7} mb={12} lineClamp={2}>
                      {post.excerpt}
                    </Text>
                    <Group gap={12}>
                      <Text size="xs" c="var(--bm-text-muted)">{post.author}</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">{post.readTime}</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">{formatBlogDate(post.date)}</Text>
                    </Group>
                  </Box>
                </Card>
              </Link>
            ))}
          </SimpleGrid>

          {/* Newsletter CTA */}
          <Box className={`${classes.newsletter} reveal`} mt={64}>
            <Title order={3} c="white" mb={8}>
              Stay in the Loop
            </Title>
            <Text c="rgba(255,255,255,0.7)" size="md" mb={24} maw={400}>
              Get impact stories, tax tips, and platform updates delivered to your inbox.
            </Text>
            <Group gap="sm">
              <TextInput
                placeholder="your@email.com"
                size="md"
                radius="xl"
                leftSection={<IconMail size={18} />}
                className={classes.emailInput}
              />
              <Button
                color="terracotta"
                size="md"
                radius="xl"
                rightSection={<IconArrowRight size={16} />}
              >
                Subscribe
              </Button>
            </Group>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
