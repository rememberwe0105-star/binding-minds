'use client';

import { useEffect, useRef, useState } from 'react';
import type { BadgeStatus } from './useRewards';

const LS_KEY = 'deargiver_seen_badges_v1';

function getSeenBadges(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function markBadgeSeen(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenBadges();
    seen.add(id);
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // silent
  }
}

/**
 * 새로 해제된 뱃지를 감지하는 훅.
 * - localStorage로 "이미 본 뱃지" 추적
 * - 처음 로딩 완료 후 unlocked 된 뱃지 중 localStorage에 없는 것 → queue에 추가
 * - `current`: 지금 팝업에 보여줄 뱃지 (null이면 숨김)
 * - `dismiss()`: 현재 뱃지를 seen으로 표시하고 다음 뱃지로 넘어감
 */
export function useBadgeUnlockNotifier(badges: BadgeStatus[], loading: boolean) {
  const [queue, setQueue] = useState<BadgeStatus[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    // 로딩 완료 후 딱 한 번만 초기화
    if (loading || initialized.current) return;
    initialized.current = true;

    const seen = getSeenBadges();
    const newlyUnlocked = badges.filter(
      (b) => b.unlocked && !seen.has(b.badge.id),
    );

    if (newlyUnlocked.length > 0) {
      setQueue(newlyUnlocked);
    }
  }, [badges, loading]);

  const current = queue[0] ?? null;

  const dismiss = () => {
    if (queue[0]) {
      markBadgeSeen(queue[0].badge.id);
      setQueue((prev) => prev.slice(1));
    }
  };

  return { current, dismiss };
}
