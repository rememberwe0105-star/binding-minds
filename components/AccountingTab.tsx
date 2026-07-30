'use client';

import { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Box,
  Badge,
  Button,
  Table,
  Select,
  Alert,
  Stack,
  ThemeIcon,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import {
  IconPlugConnected,
  IconCheck,
  IconSend,
  IconInfoCircle,
  IconReportMoney,
  IconHistory,
  IconArrowsExchange,
} from '@tabler/icons-react';

// ============================================================
// Accounting & Xero Sync (Growth 플랜 전용) — 데모 UX
//
// Stripe payout별 구성 내역(기부 총액/카드 수수료/플랫폼 수수료/조정)을
// 정리해 Xero로 단방향 전송하는 기능의 프론트 데모.
// 실데이터·Xero OAuth·전송은 백엔드 v8.2 요청 (BACKEND_API_REQUEST_V8_2.md).
// 환불/chargeback은 기관이 Stripe에서 직접 처리하며, 여기서는 조정 라인으로만 표시.
// ============================================================

/** mock Xero 계정과목 (Chart of Accounts) — 실제로는 Xero API에서 조회 */
const MOCK_XERO_ACCOUNTS = [
  { value: '200', label: '200 — Donations Income' },
  { value: '260', label: '260 — Refunds & Adjustments' },
  { value: '404', label: '404 — Bank & Processing Fees' },
  { value: '405', label: '405 — Platform Service Fees' },
  { value: '090', label: '090 — Business Bank Account' },
];

interface PayoutRow {
  id: string;
  date: string;
  donations: number;
  donationCount: number;
  stripeFees: number;
  platformFees: number;
  /** 환불/chargeback 조정 (음수). 기관이 Stripe에서 직접 처리한 건의 기록 */
  adjustments: number;
  adjustmentNote?: string;
  net: number;
  synced: boolean;
  syncedAt?: string;
}

/** mock payout 데이터 — 실제로는 Stripe payout webhook 기반 집계 API에서 조회 */
const INITIAL_PAYOUTS: PayoutRow[] = [
  {
    id: 'po_demo_003',
    date: '2026-07-18',
    donations: 1240.0,
    donationCount: 21,
    stripeFees: -39.78,
    platformFees: -31.0,
    adjustments: -50.0,
    adjustmentNote: '1 refund (processed in Stripe by your organisation)',
    net: 1119.22,
    synced: false,
  },
  {
    id: 'po_demo_002',
    date: '2026-07-11',
    donations: 860.0,
    donationCount: 14,
    stripeFees: -27.42,
    platformFees: -21.5,
    adjustments: 0,
    net: 811.08,
    synced: true,
    syncedAt: '2026-07-12 09:14',
  },
  {
    id: 'po_demo_001',
    date: '2026-07-04',
    donations: 505.0,
    donationCount: 9,
    stripeFees: -16.34,
    platformFees: -12.63,
    adjustments: 0,
    net: 476.03,
    synced: true,
    syncedAt: '2026-07-05 08:41',
  },
];

function fmt(n: number): string {
  const sign = n < 0 ? '−' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function AccountingTab() {
  // Xero 연결 상태 (데모 — 실제로는 백엔드 OAuth 상태 조회)
  const [connected, setConnected] = useState(false);

  // 계정 매핑 (데모 — 실제로는 백엔드에 저장)
  const [mapDonations, setMapDonations] = useState<string | null>('200');
  const [mapStripeFees, setMapStripeFees] = useState<string | null>('404');
  const [mapPlatformFees, setMapPlatformFees] = useState<string | null>('405');
  const [mapAdjustments, setMapAdjustments] = useState<string | null>('260');

  const [payouts, setPayouts] = useState<PayoutRow[]>(INITIAL_PAYOUTS);
  const [history, setHistory] = useState<string[]>([
    '2026-07-12 09:14 — Payout po_demo_002 sent to Xero (Receive Money, $811.08)',
    '2026-07-05 08:41 — Payout po_demo_001 sent to Xero (Receive Money, $476.03)',
  ]);

  const mappingComplete = mapDonations && mapStripeFees && mapPlatformFees && mapAdjustments;

  const sendToXero = (id: string) => {
    const now = new Date();
    const stamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, synced: true, syncedAt: stamp } : p)),
    );
    const row = payouts.find((p) => p.id === id);
    if (row) {
      setHistory((prev) => [
        `${stamp} — Payout ${row.id} sent to Xero (Receive Money, $${row.net.toFixed(2)})`,
        ...prev,
      ]);
    }
  };

  return (
    <Stack gap={20} mt={20}>
      {/* 데모 안내 */}
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" radius="md">
        <Text size="xs" lh={1.6}>
          <strong>Preview.</strong> This is a demo of the upcoming Xero integration —
          payout figures shown are sample data. Live Stripe payout sync is being
          built by our engineering team.
        </Text>
      </Alert>

      {/* ── Xero 연결 카드 ── */}
      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" wrap="nowrap">
          <Group gap={12} wrap="nowrap">
            <ThemeIcon size={44} radius="md" color={connected ? 'teal' : 'gray'} variant="light">
              <IconPlugConnected size={24} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="sm" c="var(--bm-text-dark)">Xero Connection</Text>
              <Text size="xs" c="var(--bm-text-muted)">
                {connected
                  ? 'Connected — one-way sync (platform → Xero) is enabled'
                  : 'Connect your Xero organisation to sync payout summaries'}
              </Text>
            </Box>
          </Group>
          {connected ? (
            <Badge color="teal" variant="light" size="lg" leftSection={<IconCheck size={12} />}>
              Connected
            </Badge>
          ) : (
            <Button color="sage" radius="xl" size="sm" onClick={() => setConnected(true)}>
              Connect to Xero
            </Button>
          )}
        </Group>
      </Card>

      {/* ── 계정 매핑 ── */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap={8} mb={4}>
          <IconArrowsExchange size={18} color="var(--bm-sage-dark)" />
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Account Mapping</Text>
        </Group>
        <Text size="xs" c="var(--bm-text-muted)" mb={16}>
          Choose which Xero accounts each part of a payout should be recorded against.
          Your chart of accounts is read from Xero — transactions only ever flow from
          Dear Giver to Xero, never the other way.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12}>
          <Select
            label="Donations income"
            data={MOCK_XERO_ACCOUNTS}
            value={mapDonations}
            onChange={setMapDonations}
            radius="md"
            size="sm"
            disabled={!connected}
          />
          <Select
            label="Card processing fees (Stripe)"
            data={MOCK_XERO_ACCOUNTS}
            value={mapStripeFees}
            onChange={setMapStripeFees}
            radius="md"
            size="sm"
            disabled={!connected}
          />
          <Select
            label="Platform service fees"
            data={MOCK_XERO_ACCOUNTS}
            value={mapPlatformFees}
            onChange={setMapPlatformFees}
            radius="md"
            size="sm"
            disabled={!connected}
          />
          <Select
            label="Refunds & chargeback adjustments"
            data={MOCK_XERO_ACCOUNTS}
            value={mapAdjustments}
            onChange={setMapAdjustments}
            radius="md"
            size="sm"
            disabled={!connected}
          />
        </SimpleGrid>
      </Card>

      {/* ── Payout Summary ── */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap={8} mb={4}>
          <IconReportMoney size={18} color="var(--bm-sage-dark)" />
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Stripe Payout Summaries</Text>
        </Group>
        <Text size="xs" c="var(--bm-text-muted)" mb={16}>
          Each bank payout from Stripe, broken down into donations, fees, and
          adjustments — so it reconciles cleanly in Xero.
        </Text>

        <Table.ScrollContainer minWidth={760}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Payout date</Table.Th>
                <Table.Th>Donations</Table.Th>
                <Table.Th>Card fees</Table.Th>
                <Table.Th>Platform fee</Table.Th>
                <Table.Th>Adjustments</Table.Th>
                <Table.Th>Net payout</Table.Th>
                <Table.Th>Xero</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payouts.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>{p.date}</Text>
                    <Text size="xs" c="dimmed">{p.donationCount} donations</Text>
                  </Table.Td>
                  <Table.Td><Text size="sm">{fmt(p.donations)}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{fmt(p.stripeFees)}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{fmt(p.platformFees)}</Text></Table.Td>
                  <Table.Td>
                    {p.adjustments !== 0 ? (
                      <>
                        <Text size="sm" c="orange">{fmt(p.adjustments)}</Text>
                        {p.adjustmentNote && (
                          <Text size="xs" c="dimmed">{p.adjustmentNote}</Text>
                        )}
                      </>
                    ) : (
                      <Text size="sm" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td><Text size="sm" fw={700} c="var(--bm-sage-dark)">{fmt(p.net)}</Text></Table.Td>
                  <Table.Td>
                    {p.synced ? (
                      <Badge color="teal" variant="light" size="sm" leftSection={<IconCheck size={10} />}>
                        Synced{p.syncedAt ? ` · ${p.syncedAt.slice(5, 10)}` : ''}
                      </Badge>
                    ) : (
                      <Button
                        size="xs"
                        radius="xl"
                        color="sage"
                        leftSection={<IconSend size={12} />}
                        onClick={() => sendToXero(p.id)}
                        disabled={!connected || !mappingComplete}
                      >
                        Send to Xero
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Alert icon={<IconInfoCircle size={14} />} color="orange" variant="light" radius="md" mt={12}>
          <Text size="xs" lh={1.6}>
            <strong>Refunds & chargebacks</strong> are handled by your organisation
            directly in Stripe — Dear Giver never holds or moves your funds. When they
            happen, they appear here as adjustments so your payout still reconciles.
          </Text>
        </Alert>
      </Card>

      {/* ── Sync History ── */}
      <Card withBorder radius="lg" padding="lg">
        <Group gap={8} mb={12}>
          <IconHistory size={18} color="var(--bm-sage-dark)" />
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Sync History</Text>
        </Group>
        <Stack gap={6}>
          {history.map((h) => (
            <Group key={h} gap={8} wrap="nowrap">
              <ThemeIcon size={18} radius="xl" color="teal" variant="light">
                <IconCheck size={11} />
              </ThemeIcon>
              <Text size="xs" c="var(--bm-text-muted)">{h}</Text>
            </Group>
          ))}
        </Stack>
        <Divider my={12} />
        <Text size="xs" c="dimmed">
          Transactions are sent as Receive Money entries. Nothing in Xero is ever
          modified or read back apart from your chart of accounts.
        </Text>
      </Card>
    </Stack>
  );
}
