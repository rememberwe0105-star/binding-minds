'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDonations, minorToDisplay, type DonationsPage, type DonationItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface UseDonationsResult {
  items: DonationItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  setPage: (p: number) => void;
  refresh: () => void;
}

/**
 * 백엔드 /api/v1/me/donations 데이터를 가져오는 훅.
 * isRegistered가 true일 때만 호출합니다 (412 방지).
 */
export function useApiDonations(pageSize = 20): UseDonationsResult {
  const { isRegistered } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DonationsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!isRegistered) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getDonations(page, pageSize)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? '기부 내역을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isRegistered, page, pageSize, tick]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    pageSize,
    loading,
    error,
    setPage,
    refresh,
  };
}

// ── 편의 함수 ──────────────────────────────────────────────

/** donation_status → 배지 색상 */
export function statusColor(s: string): string {
  switch (s) {
    case 'succeeded': return 'green';
    case 'checkout_created': return 'yellow';
    case 'refunded': return 'red';
    default: return 'gray';
  }
}

/** donation_status → 표시 레이블 */
export function statusLabel(s: string): string {
  switch (s) {
    case 'succeeded': return 'Completed';
    case 'checkout_created': return 'Pending';
    case 'refunded': return 'Refunded';
    default: return s;
  }
}

/** minor 금액 → 통화 표시 문자열 */
export function formatMinor(minor: number, currency: string): string {
  const display = minorToDisplay(minor);
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency || 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(display);
}
