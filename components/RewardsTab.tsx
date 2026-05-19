'use client';

import { useState } from 'react';
import {
  Text,
  Box,
  Group,
  Card,
  Badge,
  Progress,
  Button,
  Loader,
  Alert,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconLock,
  IconStars,
  IconTrophy,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRewards } from '@/hooks/useRewards';
import { useBadgeUnlockNotifier } from '@/hooks/useBadgeUnlockNotifier';
import { BadgeUnlockCelebration } from '@/components/BadgeUnlockCelebration';
import { TIER_META, type BadgeTier } from '@/data/rewards';
import classes from './RewardsTab.module.css';

// ── 뱃지 카드 ──
function BadgeCard({ badge, unlocked, progress, progressLabel }: {
  badge: { id: string; name: string; emoji: string; conditionLabel: string; tier: BadgeTier };
  unlocked: boolean;
  progress: number;
  progressLabel: string;
}) {
  return (
    <div className={`${classes.badgeCard} ${unlocked ? classes.unlocked : classes.locked}`}>
      {unlocked && (
        <div className={classes.unlockedBadge}>
          <IconCheck size={10} color="white" stroke={3} />
        </div>
      )}

      <span className={classes.badgeEmoji}>{badge.emoji}</span>

      <Text className={classes.badgeName}>{badge.name}</Text>
      <Text className={classes.badgeCondition}>{badge.conditionLabel}</Text>

      {!unlocked && (
        <>
          <div className={classes.progressBarWrapper}>
            <div
              className={classes.progressBarFill}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <Text size="xs" c="var(--bm-text-muted)" mt={4} style={{ fontSize: '0.62rem' }}>
            {progressLabel}
          </Text>
        </>
      )}

      {unlocked && (
        <Badge size="xs" color="green" variant="light" mt={4}>
          Unlocked ✓
        </Badge>
      )}
    </div>
  );
}

// ── 메인 Rewards 탭 컴포넌트 ──
export function RewardsTab() {
  const {
    badges,
    unlockedCount,
    totalCount,
    currentTier,
    nextTier,
    badgesToNextTier,
    encouragement,
    loading,
    error,
  } = useRewards();

  // 뱃지 언락 감지 → 셀레브레이션 팝업
  const { current: celebBadge, dismiss: dismissCeleb } = useBadgeUnlockNotifier(badges, loading);
  const queueTotal = celebBadge ? badges.filter((b) => b.unlocked).length : 0;

  const [tierFilter, setTierFilter] = useState<BadgeTier | 'all'>('all');

  const filteredBadges = tierFilter === 'all'
    ? badges
    : badges.filter((b) => b.badge.tier === tierFilter);

  const progressToNext = nextTier
    ? ((unlockedCount - (nextTier.minBadges - badgesToNextTier)) / (nextTier.minBadges - (currentTier.minBadges))) * 100
    : 100;

  if (loading) {
    return (
      <Box ta="center" py={60}>
        <Loader size="lg" color="sage" />
        <Text c="var(--bm-text-muted)" mt={12}>Loading your rewards...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" radius="md">
        {error}
      </Alert>
    );
  }

  // 뱃지 언락 팝업 큐 인덱스
  const celebIndex = celebBadge
    ? badges.filter((b) => b.unlocked).indexOf(celebBadge)
    : 0;

  return (
    <>
      {/* 뱃지 언락 셀레브레이션 오버레이 */}
      {celebBadge && (
        <BadgeUnlockCelebration
          badgeStatus={celebBadge}
          onDismiss={dismissCeleb}
          index={celebIndex}
          total={queueTotal}
        />
      )}
      {/* 격려 배너 */}
      <div className={classes.encouragementBanner}>
        <Text size="sm" c="rgba(255,255,255,0.7)" mb={4}>Your giving story</Text>
        <Text fw={700} c="white" size="md" style={{ maxWidth: 520, lineHeight: 1.5 }}>
          {encouragement}
        </Text>
      </div>

      {/* 기부자 등급 카드 */}
      <Card padding="xl" radius="lg" withBorder className={classes.tierCard} mb={28}>
        <div className={classes.tierInfo}>
          <span className={classes.tierEmoji}>{currentTier.emoji}</span>

          <Box flex={1}>
            <Group gap={8} mb={4}>
              <Text fw={800} size="xl" c="var(--bm-text-dark)">{currentTier.label}</Text>
              <Badge size="sm" color={currentTier.color} variant="light">
                {currentTier.description}
              </Badge>
            </Group>

            <Text size="sm" c="var(--bm-text-muted)" mb={12}>
              {unlockedCount} of {totalCount} badges unlocked
            </Text>

            {nextTier ? (
              <div className={classes.tierProgressBar}>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="var(--bm-text-muted)">
                    Next: {nextTier.emoji} {nextTier.label}
                  </Text>
                  <Text size="xs" fw={600} c="var(--bm-sage-dark)">
                    {badgesToNextTier} badge{badgesToNextTier !== 1 ? 's' : ''} to go
                  </Text>
                </Group>
                <Progress
                  value={Math.max(progressToNext, 4)}
                  color="sage"
                  radius="xl"
                  size="sm"
                />
              </div>
            ) : (
              <Group gap={6}>
                <IconTrophy size={16} color="var(--bm-terracotta)" />
                <Text size="sm" fw={600} c="var(--bm-terracotta)">
                  Maximum tier reached! You&apos;re a Guardian of giving 🛡️
                </Text>
              </Group>
            )}
          </Box>

          {unlockedCount === 0 && (
            <Button
              component={Link}
              href="/projects"
              color="terracotta"
              radius="xl"
              size="sm"
            >
              Make First Donation →
            </Button>
          )}
        </div>
      </Card>

      {/* 통계 칩 */}
      <div className={classes.statsRow}>
        <div className={classes.statChip}>
          <IconStars size={14} color="var(--bm-terracotta)" />
          {unlockedCount}/{totalCount} Badges
        </div>
        <div className={classes.statChip}>
          {currentTier.emoji} {currentTier.label} Tier
        </div>
        {nextTier && (
          <div className={classes.statChip}>
            <IconLock size={14} color="var(--bm-text-muted)" />
            {badgesToNextTier} to {nextTier.label}
          </div>
        )}
      </div>

      {/* Tier 필터 버튼 */}
      <div className={classes.tierFilter}>
        <Button
          size="xs"
          radius="xl"
          variant={tierFilter === 'all' ? 'filled' : 'outline'}
          color="dark"
          onClick={() => setTierFilter('all')}
        >
          All ({badges.length})
        </Button>
        {(['beginner', 'intermediate', 'advanced'] as BadgeTier[]).map((tier) => {
          const meta = TIER_META[tier];
          const count = badges.filter((b) => b.badge.tier === tier).length;
          const unlocked = badges.filter((b) => b.badge.tier === tier && b.unlocked).length;
          return (
            <Button
              key={tier}
              size="xs"
              radius="xl"
              variant={tierFilter === tier ? 'filled' : 'outline'}
              color={tierFilter === tier ? meta.color : 'dark'}
              onClick={() => setTierFilter(tier)}
            >
              {meta.label} ({unlocked}/{count})
            </Button>
          );
        })}
      </div>

      {/* 뱃지 그리드 */}
      <div className={classes.badgeGrid}>
        {filteredBadges.map(({ badge, unlocked, progress, progressLabel }) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            unlocked={unlocked}
            progress={progress}
            progressLabel={progressLabel}
          />
        ))}
      </div>

      <Text size="xs" c="var(--bm-text-muted)" ta="center" mt={24}>
        Badges are based on donation frequency and diversity — not just amounts. Everyone can earn them! 🌱
      </Text>
    </>
  );
}
