'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Text,
  Box,
  Group,
  Badge,
  Button,
  ThemeIcon,
  Stack,
  SimpleGrid,
  Modal,
  Alert,
  Divider,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconRepeat,
  IconCalendar,
  IconCoin,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
  IconSparkles,
  IconArrowRight,
  IconAlertTriangle,
} from '@tabler/icons-react';
import Link from 'next/link';
import {
  getMySubscriptions,
  updateMySubscription,
  BackendPendingError,
  type DonationItem,
} from '@/lib/api';
import { BackendPendingDialog } from './BackendPendingDialog';

// ============================================================
// 정기 기부 관리 컴포넌트
// ============================================================

interface RecurringSubscription {
  id: string;
  charityName: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  nextPaymentDate: string;
  startedAt: string;
  totalPaid: number;
  paymentCount: number;
}

// 목업 구독 데이터 (실제로는 API에서 가져옴)
function detectRecurringFromDonations(items: DonationItem[]): RecurringSubscription[] {
  // 같은 기관에 2회 이상 기부한 경우를 "잠재적 구독"으로 감지
  const charityMap = new Map<string, DonationItem[]>();

  items
    .filter((d) => d.donation_status === 'succeeded')
    .forEach((d) => {
      const name = d.charity_display_name || 'Unknown';
      const list = charityMap.get(name) || [];
      list.push(d);
      charityMap.set(name, list);
    });

  const subscriptions: RecurringSubscription[] = [];

  charityMap.forEach((donations, charityName) => {
    if (donations.length >= 2) {
      const sorted = donations.sort(
        (a, b) => new Date(b.paid_at || b.created_at || '').getTime() - new Date(a.paid_at || a.created_at || '').getTime()
      );
      const totalPaid = sorted.reduce((s, d) => s + d.donation_amount_minor, 0);
      const latestDate = new Date(sorted[0].paid_at || sorted[0].created_at || '');
      const nextPayment = new Date(latestDate);
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      subscriptions.push({
        id: `sub-${charityName.toLowerCase().replace(/\s/g, '-')}`,
        charityName,
        amount: sorted[0].donation_amount_minor / 100,
        currency: sorted[0].currency_code || 'NZD',
        frequency: 'monthly',
        status: 'active',
        nextPaymentDate: nextPayment.toISOString(),
        startedAt: sorted[sorted.length - 1].paid_at || sorted[sorted.length - 1].created_at || '',
        totalPaid: totalPaid / 100,
        paymentCount: sorted.length,
      });
    }
  });

  return subscriptions.sort((a, b) => b.totalPaid - a.totalPaid);
}

function formatCurrencyAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}

export function RecurringDonationsCard({ items }: { items: DonationItem[] }) {
  const detected = useMemo(() => detectRecurringFromDonations(items), [items]);
  const [manageModalOpened, { open: openManage, close: closeManage }] = useDisclosure(false);
  const [selectedSub, setSelectedSub] = useState<RecurringSubscription | null>(null);

  // ── 백엔드 게이트: 실 구독 API를 먼저 시도, 미구현이면 감지 데이터(프리뷰) 폴백 ──
  const [liveSubs, setLiveSubs] = useState<RecurringSubscription[] | null>(null);
  const [pendingError, setPendingError] = useState<BackendPendingError | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMySubscriptions()
      .then((res) => {
        if (cancelled) return;
        const mapped: RecurringSubscription[] = (res.items ?? []).map((s, i) => ({
          id: String(s.id ?? `live-${i}`),
          charityName: s.charity_name ?? 'Charity',
          amount: (s.amount_minor ?? 0) / 100,
          currency: s.currency_code ?? 'NZD',
          frequency: 'monthly',
          status: (s.status as RecurringSubscription['status']) ?? 'active',
          nextPaymentDate: s.next_payment_at ?? '',
          startedAt: '',
          totalPaid: 0,
          paymentCount: 0,
        }));
        setLiveSubs(mapped);
      })
      .catch(() => {
        // BackendPendingError 등 — 조용히 감지 기반 프리뷰 유지
      });
    return () => { cancelled = true; };
  }, []);

  const isLive = liveSubs !== null;
  const subscriptions = liveSubs ?? detected;

  // 구독 변경 시도 — 엔드포인트가 열리면 그대로 실동작, 아니면 안내
  const tryUpdate = async (patch: { status?: 'active' | 'paused' | 'cancelled'; amount?: number }) => {
    if (!selectedSub) return;
    try {
      await updateMySubscription(selectedSub.id, patch);
      closeManage();
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e);
      else closeManage();
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const monthlyTotal = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  if (subscriptions.length === 0) {
    return (
      <Card padding="lg" radius="lg" withBorder>
        <Group gap={8} mb={12}>
          <IconRepeat size={18} color="var(--bm-terracotta)" />
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Recurring Giving</Text>
        </Group>
        <Box ta="center" py={20}>
          <ThemeIcon size={48} radius="xl" color="sage" variant="light" mx="auto" mb={12}>
            <IconRepeat size={24} />
          </ThemeIcon>
          <Text size="sm" c="var(--bm-text-muted)" mb={4}>No recurring donations yet</Text>
          <Text size="xs" c="dimmed" maw={300} mx="auto" mb={16}>
            Set up monthly giving to make sustained impact. Choose &quot;Monthly&quot; when donating to any project.
          </Text>
          <Button
            component={Link}
            href="/projects"
            variant="light"
            color="terracotta"
            size="xs"
            radius="xl"
            rightSection={<IconArrowRight size={14} />}
          >
            Start Monthly Giving
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card padding="lg" radius="lg" withBorder>
        <Group justify="space-between" mb={16}>
          <Group gap={8}>
            <IconRepeat size={18} color="var(--bm-terracotta)" />
            <Text fw={700} size="sm" c="var(--bm-text-dark)">Recurring Giving</Text>
            <Badge size="sm" variant="light" color="sage">{activeCount} active</Badge>
            {!isLive && (
              <Badge size="xs" variant="light" color="orange">Preview</Badge>
            )}
          </Group>
          <Text size="xs" fw={600} c="var(--bm-sage-dark)">
            {formatCurrencyAmount(monthlyTotal, 'NZD')}/mo
          </Text>
        </Group>

        {/* Summary Stats */}
        <SimpleGrid cols={3} spacing={8} mb={16}>
          <Box ta="center" p={8} style={{ background: 'rgba(74,124,113,0.04)', borderRadius: 8 }}>
            <Text fw={800} size="sm" c="var(--bm-sage-dark)">
              {formatCurrencyAmount(monthlyTotal, 'NZD')}
            </Text>
            <Text size="xs" c="var(--bm-text-muted)">Monthly</Text>
          </Box>
          <Box ta="center" p={8} style={{ background: 'rgba(196,114,74,0.04)', borderRadius: 8 }}>
            <Text fw={800} size="sm" c="var(--bm-terracotta)">
              {formatCurrencyAmount(monthlyTotal * 12, 'NZD')}
            </Text>
            <Text size="xs" c="var(--bm-text-muted)">Yearly Impact</Text>
          </Box>
          <Box ta="center" p={8} style={{ background: 'rgba(75,107,251,0.04)', borderRadius: 8 }}>
            <Text fw={800} size="sm" c="#4b6bfb">
              {formatCurrencyAmount(Math.round(monthlyTotal * 12 * 0.3333), 'NZD')}
            </Text>
            <Text size="xs" c="var(--bm-text-muted)">Tax Credit</Text>
          </Box>
        </SimpleGrid>

        {/* Subscription List */}
        <Stack gap={8}>
          {subscriptions.map((sub) => (
            <Box
              key={sub.id}
              p={12}
              style={{
                background: sub.status === 'active'
                  ? 'linear-gradient(135deg, rgba(74,124,113,0.03) 0%, rgba(255,255,255,1) 100%)'
                  : 'rgba(0,0,0,0.02)',
                borderRadius: 10,
                border: '1px solid var(--mantine-color-gray-2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => { setSelectedSub(sub); openManage(); }}
            >
              <Group justify="space-between">
                <Box>
                  <Group gap={6}>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>
                      {sub.charityName}
                    </Text>
                    {sub.status === 'paused' && (
                      <Badge size="xs" variant="light" color="yellow">Paused</Badge>
                    )}
                  </Group>
                  <Text size="xs" c="var(--bm-text-muted)">
                    {sub.paymentCount} payments · since {formatShortDate(sub.startedAt)}
                  </Text>
                </Box>
                <Box ta="right">
                  <Text size="sm" fw={700} c="var(--bm-sage-dark)">
                    {formatCurrencyAmount(sub.amount, sub.currency)}/mo
                  </Text>
                  <Text size="xs" c="dimmed">
                    Next: {formatShortDate(sub.nextPaymentDate)}
                  </Text>
                </Box>
              </Group>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Manage Subscription Modal */}
      <Modal
        opened={manageModalOpened}
        onClose={closeManage}
        title={
          <Group gap={8}>
            <IconRepeat size={18} color="var(--bm-terracotta)" />
            <Text fw={700} size="md" c="var(--bm-text-dark)">Manage Subscription</Text>
          </Group>
        }
        radius="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        {selectedSub && (
          <Stack gap={16}>
            <Card padding="lg" radius="md" withBorder>
              <Text size="lg" fw={800} c="var(--bm-text-dark)" mb={4}>{selectedSub.charityName}</Text>
              <Divider my={12} />
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Amount</Text>
                <Text size="sm" fw={600}>{formatCurrencyAmount(selectedSub.amount, selectedSub.currency)}/mo</Text>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Frequency</Text>
                <Badge size="sm" variant="light" color="sage">Monthly</Badge>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Status</Text>
                <Badge size="sm" variant="light" color={selectedSub.status === 'active' ? 'green' : 'yellow'}>
                  {selectedSub.status === 'active' ? '✓ Active' : '⏸ Paused'}
                </Badge>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Next payment</Text>
                <Text size="sm" fw={500}>{formatShortDate(selectedSub.nextPaymentDate)}</Text>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Total paid</Text>
                <Text size="sm" fw={600} c="var(--bm-sage-dark)">{formatCurrencyAmount(selectedSub.totalPaid, selectedSub.currency)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="var(--bm-text-muted)">Payments made</Text>
                <Text size="sm" fw={500}>{selectedSub.paymentCount}</Text>
              </Group>
            </Card>

            {/* Annual projection */}
            <Alert icon={<IconSparkles size={16} />} color="sage" variant="light" radius="md">
              <Text size="xs">
                <strong>Annual projection:</strong> {formatCurrencyAmount(selectedSub.amount * 12, selectedSub.currency)}/year
                {selectedSub.currency === 'NZD' && (
                  <> · Est. tax credit: <strong>{formatCurrencyAmount(Math.round(selectedSub.amount * 12 * 0.3333), 'NZD')}</strong></>
                )}
              </Text>
            </Alert>

            {/* Action Buttons — 실 API 우선, 미구현 시 안내 (게이트) */}
            <SimpleGrid cols={2} spacing={8}>
              <Button
                variant="light"
                color={selectedSub.status === 'active' ? 'yellow' : 'sage'}
                radius="md"
                leftSection={selectedSub.status === 'active' ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                onClick={() => tryUpdate({ status: selectedSub.status === 'active' ? 'paused' : 'active' })}
              >
                {selectedSub.status === 'active' ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="light"
                color="blue"
                radius="md"
                leftSection={<IconEdit size={16} />}
                onClick={() => tryUpdate({ amount: selectedSub.amount })}
              >
                Change Amount
              </Button>
            </SimpleGrid>

            <Button
              variant="subtle"
              color="red"
              size="sm"
              radius="md"
              leftSection={<IconX size={14} />}
              onClick={() => tryUpdate({ status: 'cancelled' })}
            >
              Cancel Subscription
            </Button>

            {!isLive && (
              <Alert icon={<IconAlertTriangle size={14} />} color="orange" variant="light" radius="md">
                <Text size="xs">
                  Showing recurring patterns detected from your donation history.
                  These controls call the live subscriptions API and switch over
                  automatically once the backend endpoint responds.
                </Text>
              </Alert>
            )}
          </Stack>
        )}
      </Modal>

      <BackendPendingDialog error={pendingError} onClose={() => setPendingError(null)} />
    </>
  );
}
