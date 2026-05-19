'use client';

import { useMemo, useState, useEffect } from 'react';
import { useApiDonations } from './useApiDonations';
import { useAuth } from '@/contexts/AuthContext';
import { BADGES, getGiverTier, getNextGiverTier, type BadgeDefinition, type GiverTierInfo } from '@/data/rewards';
import type { DonationItem } from '@/lib/api';

// ── 타입 ──
export interface BadgeStatus {
  badge: BadgeDefinition;
  unlocked: boolean;
  /** 진행도 (0~1), 일부 뱃지만 해당 */
  progress: number;
  /** 진행도 텍스트 (ex: "2 / 5 charities") */
  progressLabel: string;
}

export interface RewardsData {
  badges: BadgeStatus[];
  unlockedCount: number;
  totalCount: number;
  currentTier: GiverTierInfo;
  nextTier: GiverTierInfo | null;
  /** 다음 등급까지 필요한 뱃지 수 */
  badgesToNextTier: number;
  /** 랜덤 격려 메시지 */
  encouragement: string;
  loading: boolean;
  error: string | null;
}

// ── 격려 메시지 뱅크 (GIVEBACK_REWARDS.md G 섹션) ──
const ENCOURAGEMENTS = [
  '🌅 Good to see you back! Simply showing up and caring — that\'s already a form of giving.',
  '💛 Even a brief visit matters. The fact that you\'re here means your heart is in the right place.',
  '🌤️ Giving is like a rainbow after rain — small, but it can brighten someone\'s entire day.',
  '🍃 Each week, 170,000 New Zealanders volunteer their time. Your donations are part of that same spirit. — charities.govt.nz',
  '☀️ Have a wonderful day! The warmth you\'ve shared is rippling out there, further than you know.',
];

// ── 유틸리티 ──

/** succeeded 기부만 필터 */
function succeededOnly(items: DonationItem[]): DonationItem[] {
  return items.filter((d) => d.donation_status === 'succeeded');
}

/** 고유 자선단체 수 */
function uniqueCharities(items: DonationItem[]): number {
  return new Set(items.map((d) => d.charity_display_name).filter(Boolean)).size;
}

/** 고유 카테고리 수 — charity_display_name 기반 추정 (실제 카테고리 API 없으므로) */
function uniqueCategories(items: DonationItem[]): number {
  // 카테고리 데이터가 API에 없으므로 자선단체 수를 proxy로 사용
  // 실제 구현에서는 Firestore에서 카테고리 매핑을 가져와야 함
  return Math.min(uniqueCharities(items), 6);
}

/** 연속 기부 월수 계산 */
function consecutiveMonths(items: DonationItem[]): number {
  const succeeded = succeededOnly(items);
  if (succeeded.length === 0) return 0;

  // 기부가 있는 월을 수집 (YYYY-MM 형태)
  const months = new Set<string>();
  succeeded.forEach((d) => {
    const date = d.paid_at || d.created_at;
    if (date) {
      months.add(date.substring(0, 7)); // "2026-05"
    }
  });

  if (months.size === 0) return 0;

  // 월을 정렬 후 현재 월부터 역방향으로 연속 체크
  const sorted = Array.from(months).sort().reverse();
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const [y1, m1] = sorted[i - 1].split('-').map(Number);
    const [y2, m2] = sorted[i].split('-').map(Number);

    // 이전 달인지 확인
    const prevMonth = m1 === 1 ? 12 : m1 - 1;
    const prevYear = m1 === 1 ? y1 - 1 : y1;

    if (y2 === prevYear && m2 === prevMonth) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** 총 기부 금액 (NZD 기준, minor → display) */
function totalDonatedNZD(items: DonationItem[]): number {
  return succeededOnly(items).reduce((sum, d) => sum + d.donation_amount_minor / 100, 0);
}

// ── 뱃지 획득 여부 계산 ──
function computeBadgeStatus(
  badges: BadgeDefinition[],
  items: DonationItem[],
  isSignedUp: boolean,
): BadgeStatus[] {
  const succeeded = succeededOnly(items);
  const charityCount = uniqueCharities(succeeded);
  const categoryCount = uniqueCategories(succeeded);
  const monthStreak = consecutiveMonths(items);
  const totalNZD = totalDonatedNZD(items);
  const donationCount = succeeded.length;

  const statusMap: Record<string, () => { unlocked: boolean; progress: number; progressLabel: string }> = {
    'welcome-giver': () => ({
      unlocked: isSignedUp,
      progress: isSignedUp ? 1 : 0,
      progressLabel: isSignedUp ? 'Complete!' : 'Sign up to unlock',
    }),
    'first-light': () => ({
      unlocked: donationCount >= 1,
      progress: Math.min(donationCount, 1),
      progressLabel: donationCount >= 1 ? 'Complete!' : '0 / 1 donation',
    }),
    'explorer': () => ({
      unlocked: categoryCount >= 2,
      progress: Math.min(categoryCount / 2, 1),
      progressLabel: `${Math.min(categoryCount, 2)} / 2 categories`,
    }),
    'neighbour': () => ({
      // 로컬 프로젝트 판별 불가 → 기부 1회 이상이면 해제 (MVP 근사)
      unlocked: donationCount >= 1,
      progress: donationCount >= 1 ? 1 : 0,
      progressLabel: donationCount >= 1 ? 'Complete!' : 'Donate to a local project',
    }),
    'steady-heart': () => ({
      unlocked: monthStreak >= 3,
      progress: Math.min(monthStreak / 3, 1),
      progressLabel: `${Math.min(monthStreak, 3)} / 3 months streak`,
    }),
    'bridge-builder': () => ({
      unlocked: charityCount >= 5,
      progress: Math.min(charityCount / 5, 1),
      progressLabel: `${Math.min(charityCount, 5)} / 5 charities`,
    }),
    'centurion': () => ({
      unlocked: totalNZD >= 100,
      progress: Math.min(totalNZD / 100, 1),
      progressLabel: `$${Math.round(Math.min(totalNZD, 100))} / $100`,
    }),
    'all-rounder': () => ({
      unlocked: categoryCount >= 6,
      progress: Math.min(categoryCount / 6, 1),
      progressLabel: `${Math.min(categoryCount, 6)} / 6 categories`,
    }),
    'kiwi-champion': () => ({
      unlocked: monthStreak >= 12,
      progress: Math.min(monthStreak / 12, 1),
      progressLabel: `${Math.min(monthStreak, 12)} / 12 months streak`,
    }),
    'thousand-star': () => ({
      unlocked: totalNZD >= 1000,
      progress: Math.min(totalNZD / 1000, 1),
      progressLabel: `$${Math.round(Math.min(totalNZD, 1000))} / $1,000`,
    }),
    'impact-leader': () => ({
      unlocked: charityCount >= 10,
      progress: Math.min(charityCount / 10, 1),
      progressLabel: `${Math.min(charityCount, 10)} / 10 projects`,
    }),
  };

  // 먼저 legendary-giver 제외한 뱃지 상태 계산
  const results: BadgeStatus[] = badges
    .filter((b) => b.id !== 'legendary-giver')
    .map((badge) => {
      const compute = statusMap[badge.id];
      if (!compute) return { badge, unlocked: false, progress: 0, progressLabel: '—' };
      return { badge, ...compute() };
    });

  // legendary-giver: 다른 모든 뱃지가 해제되었는지 확인
  const allOthersUnlocked = results.every((r) => r.unlocked);
  const legendaryBadge = badges.find((b) => b.id === 'legendary-giver')!;
  const otherUnlockedCount = results.filter((r) => r.unlocked).length;
  const otherTotal = results.length;

  results.push({
    badge: legendaryBadge,
    unlocked: allOthersUnlocked,
    progress: otherTotal > 0 ? otherUnlockedCount / otherTotal : 0,
    progressLabel: `${otherUnlockedCount} / ${otherTotal} badges`,
  });

  return results;
}

// ── 메인 훅 ──
export function useRewards(): RewardsData {
  // 기부 데이터를 최대 100건까지 불러옴 (뱃지 계산에 충분)
  const { items, loading, error } = useApiDonations(100);
  const { user, isRegistered } = useAuth();

  const isSignedUp = !!user && isRegistered === true;

  const badges = useMemo(
    () => computeBadgeStatus(BADGES, items, isSignedUp),
    [items, isSignedUp],
  );

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const currentTier = getGiverTier(unlockedCount);
  const nextTier = getNextGiverTier(unlockedCount);
  const badgesToNextTier = nextTier ? nextTier.minBadges - unlockedCount : 0;

  // 랜덤 격려 메시지 (마운트 시 1회 결정)
  const [encouragement, setEncouragement] = useState(ENCOURAGEMENTS[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  }, []);

  return {
    badges,
    unlockedCount,
    totalCount: BADGES.length,
    currentTier,
    nextTier,
    badgesToNextTier,
    encouragement,
    loading,
    error,
  };
}
