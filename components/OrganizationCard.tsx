'use client';

import { Card, Text, Badge, Group, Box, ThemeIcon } from '@mantine/core';
import { IconShieldCheck, IconBuilding, IconHeart, IconUsers, IconLock } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import type { Organization } from '@/data/organizations';
import { CATEGORY_META } from '@/data/categoryMeta';
import type { Category } from '@/data/campaigns';
import { FavoriteButton } from '@/components/FavoriteButton';
import classes from './OrganizationCard.module.css';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const CategoryIcon = CATEGORY_META[organization.category as Category]?.icon ?? IconBuilding;
  return (
    <Link href={`/charities/${organization.slug}`} className={classes.cardLink}>
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
              src={organization.image}
              alt={organization.name}
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
            {/* 오버레이 그라디언트 */}
            <div className={classes.imageOverlay} />
          </div>
          <Badge
            className={classes.typeBadge}
            color={organization.status === 'partnered' ? 'dark' : 'orange'}
            variant="filled"
            size="sm"
            leftSection={organization.status === 'partnered' ? <IconBuilding size={10} /> : <IconLock size={10} />}
          >
            {organization.status === 'partnered' ? 'Charity' : 'Unclaimed'}
          </Badge>
          <Badge
            className={classes.categoryBadge}
            color="sage"
            variant="filled"
            size="sm"
            leftSection={<CategoryIcon size={11} stroke={2} />}
          >
            {organization.category}
          </Badge>
          <FavoriteButton type="organization" id={organization.id} overlay />
        </Card.Section>

        {/* 콘텐츠 */}
        <Box p="md" className={classes.content}>
          <Group gap={6} mb={4}>
            {organization.verified && (
              <IconShieldCheck size={16} color="var(--bm-sage)" />
            )}
            <Text size="xs" c="dimmed">
              Est. {organization.yearFounded} · {organization.region}
            </Text>
          </Group>

          <Text fw={700} size="md" c="var(--bm-text-dark)" lh={1.3} lineClamp={2} mb={8}>
            {organization.name}
          </Text>

          <Text size="xs" c="var(--bm-text-muted)" lh={1.6} lineClamp={2} mb="auto" className={classes.description}>
            {organization.mission}
          </Text>

          {/* 통계 — partnered 기관만 표시 */}
          {organization.status === 'partnered' ? (
            <Box mt={16}>
              <Group justify="space-between" mb={8}>
                <Group gap={6}>
                  <ThemeIcon size={20} radius="xl" color="sage" variant="light">
                    <IconHeart size={10} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    <Text component="span" fw={600} c="var(--bm-sage-dark)" size="xs">
                      {organization.donorCount.toLocaleString()}
                    </Text>{' '}
                    donors
                  </Text>
                </Group>
                <Group gap={6}>
                  <ThemeIcon size={20} radius="xl" color="terracotta" variant="light">
                    <IconUsers size={10} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    <Text component="span" fw={600} c="var(--bm-terracotta)" size="xs">
                      {organization.activeCampaigns}
                    </Text>{' '}
                    {organization.activeCampaigns === 1 ? 'project' : 'projects'}
                  </Text>
                </Group>
              </Group>

              <div className={classes.raisedBar}>
                <Text size="sm" fw={600} c="var(--bm-sage-dark)">
                  ${organization.totalRaised.toLocaleString('en-NZ')}
                </Text>
                <Text size="xs" c="dimmed">
                  total raised
                </Text>
              </div>
            </Box>
          ) : (
            <Box mt={16}>
              <Text size="xs" c="dimmed" lh={1.6}>
                Est. {organization.yearFounded} · {organization.charityNumber}
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    </Link>
  );
}
