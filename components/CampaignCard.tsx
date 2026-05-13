'use client';

import { Card, Text, Badge, Group, Progress, Box } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Campaign, getProgress, formatCurrency } from '@/data/campaigns';
import { FavoriteButton } from '@/components/FavoriteButton';
import classes from './CampaignCard.module.css';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = getProgress(campaign);

  return (
    <Link href={`/projects/${campaign.slug}`} className={classes.cardLink}>
      <Card
        shadow="sm"
        padding={0}
        radius="lg"
        withBorder
        className={classes.card}
      >
        {/* 이미지 */}
        <Card.Section className={classes.imageSection}>
          <div className={classes.imageWrapper}>
            <NextImage
              src={campaign.image}
              alt={campaign.name}
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <Badge
            className={classes.categoryBadge}
            color="sage"
            variant="filled"
            size="sm"
          >
            {campaign.category}
          </Badge>
          {campaign.daysLeft <= 15 && (
            <Badge
              className={classes.urgentBadge}
              color="terracotta"
              variant="filled"
              size="xs"
            >
              🔥 {campaign.daysLeft} days left
            </Badge>
          )}
          <FavoriteButton type="project" id={campaign.id} overlay />
        </Card.Section>

        {/* 콘텐츠 */}
        <Box p="md" className={classes.content}>
          <Group gap={6} mb={4}>
            {campaign.verified && (
              <IconShieldCheck size={16} color="var(--bm-sage)" />
            )}
            <Text size="xs" c="dimmed">
              {campaign.organizer} · {campaign.region}
            </Text>
          </Group>

          <Text fw={700} size="md" c="var(--bm-text-dark)" lh={1.3} lineClamp={2} mb={8}>
            {campaign.name}
          </Text>

          <Text size="xs" c="var(--bm-text-muted)" lh={1.6} lineClamp={2} mb="auto" className={classes.description}>
            {campaign.description}
          </Text>

          {/* 진행률 */}
          <Box mt={16}>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                {progress}% funded
              </Text>
              <Text size="xs" c="dimmed">
                {campaign.donorCount} donors
              </Text>
            </Group>
            <Progress
              value={progress}
              color={progress >= 75 ? 'terracotta' : 'sage'}
              size="sm"
              radius="xl"
            />
            <Group justify="space-between" mt={6}>
              <Text size="sm" fw={600} c="var(--bm-sage-dark)">
                {formatCurrency(campaign.raised)}
              </Text>
              <Text size="xs" c="dimmed">
                of {formatCurrency(campaign.goal)}
              </Text>
            </Group>
          </Box>
        </Box>
      </Card>
    </Link>
  );
}
