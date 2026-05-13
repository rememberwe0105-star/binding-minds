'use client';

import {
  Container,
  SimpleGrid,
  Card,
  Text,
  Title,
  Badge,
  Button,
  Progress,
  Group,
  Box,
} from '@mantine/core';
import NextImage from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getFeaturedCampaigns, getProgress, formatCurrency } from '@/data/campaigns';
import classes from './FeaturedCharities.module.css';

const charities = getFeaturedCampaigns();



export function FeaturedCharities() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={classes.section} id="charities" ref={ref}>
      <Container size="xl">
        <Box className={`${classes.header} ${isVisible ? classes.visible : classes.hidden}`}>
          <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" mb={8}>
            Featured Campaigns
          </Text>
          <Title order={2} className={classes.sectionTitle}>
            Where Your Heart Is Needed
          </Title>
          <Text size="lg" c="var(--bm-text-muted)" maw={550} mx="auto" mt={12}>
            Every contribution makes a difference. Explore active campaigns and find a cause that
            speaks to you.
          </Text>
        </Box>

        <SimpleGrid
          cols={{ base: 1, xs: 2, md: 4 }}
          spacing={{ base: 20, md: 24 }}
          mt={48}
        >
          {charities.map((charity, index) => {
            const progress = getProgress(charity);
            return (
              <Link key={charity.id} href={`/projects/${charity.slug}`} style={{ textDecoration: 'none' }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                withBorder
                className={`${classes.card} ${isVisible ? classes.visible : classes.hidden}`}
                style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* 실제 이미지 */}
                <Card.Section className={classes.imageSection}>
                  <div className={classes.imageWrapper}>
                    <NextImage
                      src={charity.image}
                      alt={charity.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Card.Section>

                {/* 카드 콘텐츠 */}
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={600} size="md" className={classes.charityName}>
                    {charity.name}
                  </Text>
                </Group>

                <Badge
                  color={progress >= 75 ? 'terracotta' : 'sage'}
                  variant="light"
                  size="sm"
                  mb="sm"
                >
                  {charity.category}
                </Badge>

                <Text size="xs" c="var(--bm-text-muted)" lh={1.6} className={classes.description}>
                  {charity.description}
                </Text>

                {/* 진행률 */}
                <Box mt="auto" pt="md">
                  <Group justify="space-between" mb={6}>
                    <Text size="xs" c="dimmed">
                      Progress: {progress}%
                    </Text>
                  </Group>
                  <Progress
                    value={progress}
                    color={progress >= 75 ? 'terracotta' : 'sage'}
                    size="sm"
                    radius="xl"
                  />
                  <Group justify="space-between" mt={8}>
                    <Text size="xs" c="dimmed">
                      {formatCurrency(charity.raised)} raised
                    </Text>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      {formatCurrency(charity.goal)}
                    </Text>
                  </Group>
                </Box>

                <Button
                  color="terracotta"
                  fullWidth
                  mt="md"
                  radius="md"
                  className={classes.donateBtn}
                >
                  Donate Now
                </Button>
              </Card>
              </Link>
            );
          })}
        </SimpleGrid>
      </Container>
    </section>
  );
}
