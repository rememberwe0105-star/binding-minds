'use client';

import { Text } from '@mantine/core';
import { IconAward } from '@tabler/icons-react';
import { TIER_META } from '@/data/rewards';
import type { BadgeStatus } from '@/hooks/useRewards';
import classes from './BadgeUnlockCelebration.module.css';

interface Props {
  badgeStatus: BadgeStatus;
  onDismiss: () => void;
  /** 큐에 뱃지가 여러 개일 경우 "1 of 3" 표시용 */
  index?: number;
  total?: number;
}

export function BadgeUnlockCelebration({ badgeStatus, onDismiss, index, total }: Props) {
  const { badge } = badgeStatus;
  const { unlockMessage } = badge;
  const tierMeta = TIER_META[badge.tier];

  return (
    <div className={classes.overlay} onClick={onDismiss}>
      <div className={classes.card} onClick={(e) => e.stopPropagation()}>
        {/* 복수 뱃지 카운터 */}
        {total && total > 1 && (
          <div className={classes.counter}>
            {(index ?? 0) + 1} / {total}
          </div>
        )}

        {/* 이모지 + 스파클 */}
        <div className={classes.emojiRing}>
          <div className={classes.sparkles}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={classes.sparkle} />
            ))}
          </div>
          <span className={classes.emoji}>{badge.emoji}</span>
        </div>

        {/* 언락 레이블 */}
        <div className={classes.unlockLabel}>
          <IconAward size={14} />
          Badge Unlocked!
        </div>

        {/* 뱃지 이름 */}
        <div className={classes.badgeName}>{badge.name}</div>

        {/* 메시지 (GIVEBACK_REWARDS.md 기반) */}
        <Text className={classes.message}>{unlockMessage}</Text>

        {/* Tier 표시 */}
        <div className={classes.tierBadge}>
          {tierMeta.label} Tier
        </div>

        {/* 닫기 */}
        <button className={classes.dismissBtn} onClick={onDismiss}>
          {total && total > 1 && (index ?? 0) < total - 1
            ? `Next Badge →`
            : `Awesome! 🎉`}
        </button>
      </div>
    </div>
  );
}
