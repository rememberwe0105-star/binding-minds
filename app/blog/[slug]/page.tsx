'use client';

import { use } from 'react';
import {
  Container,
  Title,
  Text,
  Box,
  Group,
  Badge,
  Button,
  Divider,
  Avatar,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconClock,
  IconUser,
  IconCalendar,
  IconArrowRight,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getBlogBySlug, blogPosts, formatBlogDate } from '@/data/blog';
import classes from './page.module.css';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const categoryColors: Record<string, string> = {
  'Impact Stories': 'terracotta',
  'Tax Tips': 'sage',
  'Community': 'blue',
  'Platform Updates': 'grape',
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = use(params);
  const post = getBlogBySlug(slug);

  if (!post) {
    return (
      <>
        <Header />
        <main className={classes.page}>
          <Container size="sm" ta="center" py={80}>
            <Title order={2}>Blog post not found</Title>
            <Text c="dimmed" mt={8} mb={24}>The article you&apos;re looking for doesn&apos;t exist.</Text>
            <Button component={Link} href="/blog" variant="outline" color="sage" radius="xl">
              Back to Blog
            </Button>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  // Get next/prev post for navigation
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const nextPost = blogPosts[currentIndex + 1] || null;
  const prevPost = blogPosts[currentIndex - 1] || null;

  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* Hero image */}
        <div className={classes.heroImage}>
          <NextImage
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className={classes.heroOverlay} />
        </div>

        <Container size="sm" className={classes.articleContainer}>
          {/* Back link */}
          <Link href="/blog" className={classes.backLink}>
            <Group gap={6}>
              <IconArrowLeft size={16} />
              <Text size="sm" fw={500}>Back to Blog</Text>
            </Group>
          </Link>

          {/* Article header */}
          <Box mb={32}>
            <Badge color={categoryColors[post.category]} variant="light" size="sm" mb={16}>
              {post.category}
            </Badge>
            <Title order={1} className={classes.articleTitle}>
              {post.title}
            </Title>
            <Group gap={20} mt={16}>
              <Group gap={8}>
                <Avatar size={32} radius="xl" color="sage">
                  {post.author.charAt(0)}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600} c="var(--bm-text-dark)">{post.author}</Text>
                  <Text size="xs" c="var(--bm-text-muted)">{post.authorRole}</Text>
                </Box>
              </Group>
              <Group gap={4}>
                <IconCalendar size={14} color="var(--bm-text-muted)" />
                <Text size="sm" c="var(--bm-text-muted)">{formatBlogDate(post.date)}</Text>
              </Group>
              <Group gap={4}>
                <IconClock size={14} color="var(--bm-text-muted)" />
                <Text size="sm" c="var(--bm-text-muted)">{post.readTime}</Text>
              </Group>
            </Group>
          </Box>

          <Divider mb={32} color="rgba(143, 151, 121, 0.1)" />

          {/* Article content */}
          <div className={classes.articleContent}>
            {post.content.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('## ')) {
                return <Title key={i} order={2} className={classes.h2} mt={40} mb={16}>{trimmed.slice(3)}</Title>;
              }
              if (trimmed.startsWith('### ')) {
                return <Title key={i} order={3} className={classes.h3} mt={28} mb={12}>{trimmed.slice(4)}</Title>;
              }
              if (trimmed.startsWith('- **')) {
                const parts = trimmed.slice(2).split('**');
                return (
                  <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.9} mb={6} pl={20} className={classes.listItem}>
                    • <strong>{parts[1]}</strong>{parts[2]}
                  </Text>
                );
              }
              if (trimmed.startsWith('- ✅') || trimmed.startsWith('- ')) {
                return (
                  <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.9} mb={6} pl={20} className={classes.listItem}>
                    • {trimmed.slice(2)}
                  </Text>
                );
              }
              if (trimmed === '') return <Box key={i} h={8} />;
              if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
                return (
                  <Text key={i} size="md" c="var(--bm-terracotta)" lh={1.9} mb={8} fs="italic" fw={500}>
                    {trimmed.slice(1, -1)}
                  </Text>
                );
              }
              if (trimmed.startsWith('"') || trimmed.startsWith('"')) {
                return (
                  <Box key={i} className={classes.blockquote}>
                    <Text size="md" c="var(--bm-text-dark)" lh={1.9} fs="italic">
                      {trimmed}
                    </Text>
                  </Box>
                );
              }
              // Handle bold text
              const boldParts = trimmed.split(/\*\*(.*?)\*\*/g);
              return (
                <Text key={i} size="md" c="var(--bm-text-muted)" lh={1.9} mb={12}>
                  {boldParts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j} style={{ color: 'var(--bm-text-dark)' }}>{part}</strong> : part
                  )}
                </Text>
              );
            })}
          </div>

          <Divider my={40} color="rgba(143, 151, 121, 0.1)" />

          {/* Post navigation */}
          <Group justify="space-between" mb={40}>
            {prevPost ? (
              <Button
                component={Link}
                href={`/blog/${prevPost.slug}`}
                variant="subtle"
                color="dark"
                leftSection={<IconArrowLeft size={16} />}
              >
                Previous
              </Button>
            ) : <div />}
            {nextPost ? (
              <Button
                component={Link}
                href={`/blog/${nextPost.slug}`}
                variant="subtle"
                color="dark"
                rightSection={<IconArrowRight size={16} />}
              >
                Next
              </Button>
            ) : <div />}
          </Group>
        </Container>
      </main>
      <Footer />
    </>
  );
}
