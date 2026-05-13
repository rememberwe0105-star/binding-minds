'use client';

import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { IconLeaf, IconArrowRight, IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './not-found.module.css';

export default function NotFoundPage() {
  return (
    <main className={classes.page}>
      {/* Background decorations */}
      <div className={classes.blobTop} />
      <div className={classes.blobBottom} />
      <div className={classes.gridLines} />

      <Container size="sm" className={classes.container}>
        <div className={classes.card}>
          {/* Leaf animation */}
          <div className={classes.leafWrapper}>
            <IconLeaf size={64} color="var(--bm-terracotta)" stroke={1.2} />
          </div>

          <Text className={classes.errorCode}>404</Text>

          <Title order={1} className={classes.heading}>
            Page Not Found
          </Title>

          <Text c="var(--bm-text-muted)" size="lg" lh={1.7} ta="center" mb={32} maw={380} mx="auto">
            The page you&apos;re looking for seems to have wandered off.
            Let&apos;s get you back on track.
          </Text>

          <Group justify="center" gap="md">
            <Button
              component={Link}
              href="/"
              size="lg"
              radius="xl"
              color="terracotta"
              leftSection={<IconHome size={18} />}
              className={classes.ctaBtn}
            >
              Go Home
            </Button>
            <Button
              component={Link}
              href="/projects"
              size="lg"
              radius="xl"
              variant="outline"
              color="dark"
              rightSection={<IconArrowRight size={18} />}
            >
              Browse Campaigns
            </Button>
          </Group>
        </div>
      </Container>
    </main>
  );
}
