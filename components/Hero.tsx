'use client';

import { Container, Title, Text, Button, Group, Box, Card, Progress, Badge } from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import classes from './Hero.module.css';

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
              color="terracotta"
              variant="light"
              size="lg"
              radius="sm"
              className={classes.spotlightBadge}
            >
              Spotlight Campaign
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

          {/* 오른쪽: Spotlight Campaign 카드 */}
          <div className={classes.campaignBlock}>
            <Card
              shadow="xl"
              radius="lg"
              padding={0}
              className={classes.campaignCard}
            >
              <Card.Section className={classes.campaignImageSection}>
                <div className={classes.campaignImageWrapper}>
                  <NextImage
                    src="/images/hero-campaign.png"
                    alt="Restore Aotearoa's Native Forest"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              </Card.Section>

              <Box p="lg">
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={4}>
                  Restore Aotearoa&apos;s Native Forest
                </Text>

                <Group justify="space-between" mb={6}>
                  <Text size="xs" c="dimmed">Progress</Text>
                  <Text size="xs" fw={600} c="var(--bm-sage-dark)">72%</Text>
                </Group>
                <Progress value={72} color="sage" size="sm" radius="xl" mb={8} />

                <Group justify="space-between" mb={16}>
                  <Text size="sm" c="dimmed">$36,400 raised</Text>
                  <Text size="sm" fw={700} c="var(--bm-text-dark)">$50,000</Text>
                </Group>

                <Button
                  component={Link}
                  href="/projects/restore-native-forest"
                  color="terracotta"
                  fullWidth
                  radius="md"
                  size="md"
                  rightSection={<IconArrowRight size={18} />}
                  className={classes.supportBtn}
                >
                  Support This Campaign
                </Button>
              </Box>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
