'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon,
  Flex, TextInput, ScrollArea, Loader, Pagination,
} from '@mantine/core';
import {
  IconReceipt, IconCheck, IconX, IconClock,
  IconAlertCircle, IconArrowLeft, IconSearch,
  IconCurrencyDollar, IconRefresh, IconDownload,
  IconUser, IconMail, IconBuilding, IconCalendar,
  IconCreditCard, IconPercentage, IconFileText,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  getAdminDonations,
  refundDonation,
  type AdminDonation,
} from '@/lib/api';
import classes from './page.module.css';

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------

type DonationStatus = AdminDonation['status'];

const STATUS_CONFIG: Record<DonationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  succeeded: { label: 'Succeeded', color: 'green', icon: <IconCheck size={14} /> },
  pending:   { label: 'Pending',   color: 'orange', icon: <IconClock size={14} /> },
  refunded:  { label: 'Refunded',  color: 'red',    icon: <IconRefresh size={14} /> },
  disputed:  { label: 'Disputed',  color: 'grape',  icon: <IconAlertCircle size={14} /> },
  failed:    { label: 'Failed',    color: 'gray',   icon: <IconX size={14} /> },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format date in NZ timezone */
function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(dateStr));
}

/** Format minor amount → NZD display string */
function formatNZD(minor: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(minor / 100);
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

function AdminDonationsContent() {
  // Data state
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<AdminDonation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 30;

  // Refund state
  const [refundReason, setRefundReason] = useState('');
  const [confirmRefundModal, setConfirmRefundModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  // Stat counts
  const [counts, setCounts] = useState({
    total_volume: 0,
    succeeded: 0,
    pending: 0,
    refunded: 0,
  });

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load the current tab's data
      const statusFilter = activeTab === 'all' ? undefined : (activeTab ?? undefined);
      const result = await getAdminDonations(page, pageSize, statusFilter);
      setDonations(result.items);
      setTotal(result.total);

      // Load counts for stats (fetch all to count)
      const [allRes, succeededRes, pendingRes, refundedRes] = await Promise.all([
        getAdminDonations(1, 1).catch(() => ({ total: 0, items: [] })),
        getAdminDonations(1, 1, 'succeeded').catch(() => ({ total: 0, items: [] })),
        getAdminDonations(1, 1, 'pending').catch(() => ({ total: 0, items: [] })),
        getAdminDonations(1, 1, 'refunded').catch(() => ({ total: 0, items: [] })),
      ]);

      // For total volume, we rely on the "all" total count as approximation
      // A more precise amount would require a dedicated analytics endpoint
      setCounts({
        total_volume: allRes.total,
        succeeded: succeededRes.total,
        pending: pendingRes.total,
        refunded: refundedRes.total,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  // -------------------------------------------------------------------------
  // Client-side search filtering
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    if (!searchQuery) return donations;
    const q = searchQuery.toLowerCase();
    return donations.filter(d =>
      d.donor_name.toLowerCase().includes(q) ||
      d.charity_name.toLowerCase().includes(q)
    );
  }, [donations, searchQuery]);

  // -------------------------------------------------------------------------
  // CSV Export
  // -------------------------------------------------------------------------

  const exportCSV = () => {
    const headers = ['Date', 'Donor', 'Charity', 'Amount', 'Fee', 'Net', 'Status'];
    const rows = filtered.map(d => [
      formatDate(d.created_at),
      d.donor_name,
      d.charity_name,
      `$${(d.amount_minor / 100).toFixed(2)}`,
      `$${(d.platform_fee_minor / 100).toFixed(2)}`,
      `$${(d.net_amount_minor / 100).toFixed(2)}`,
      d.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------------------
  // Refund Action
  // -------------------------------------------------------------------------

  const handleRefund = async () => {
    if (!selected || !refundReason.trim()) return;
    setRefundLoading(true);
    try {
      await refundDonation(selected.id, { reason: refundReason });
      setConfirmRefundModal(false);
      setRefundReason('');
      setSelected(null);
      loadData(); // Refresh list
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refund failed';
      setError(msg);
      setConfirmRefundModal(false);
    } finally {
      setRefundLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>
          {/* Back to Overview */}
          <Button
            component={Link}
            href="/admin"
            variant="subtle"
            color="gray"
            size="compact-sm"
            leftSection={<IconArrowLeft size={14} />}
            mb={12}
            style={{ alignSelf: 'flex-start' }}
          >
            Back to Overview
          </Button>

          {/* Page Header */}
          <Group justify="space-between" mb={8}>
            <Box>
              <Group gap={8} mb={4}>
                <IconReceipt size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Donation Management</Title>
            </Box>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={16} withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32}>
            {[
              { key: 'total_volume' as const, label: 'Total Volume', color: 'var(--bm-terracotta, #c4704b)', mColor: 'orange', icon: IconCurrencyDollar, value: counts.total_volume },
              { key: 'succeeded' as const, label: 'Successful', color: 'green', mColor: 'green', icon: IconCheck, value: counts.succeeded },
              { key: 'pending' as const, label: 'Pending', color: 'orange', mColor: 'orange', icon: IconClock, value: counts.pending },
              { key: 'refunded' as const, label: 'Refunded', color: 'red', mColor: 'red', icon: IconRefresh, value: counts.refunded },
            ].map(({ key, label, mColor, icon: Icon, value }) => (
              <Card
                key={key} padding="lg" radius="lg" withBorder
                className={classes.statCard}
                style={{
                  cursor: key === 'total_volume' ? 'default' : 'pointer',
                  borderColor: activeTab === key ? `var(--mantine-color-${mColor}-4)` : undefined,
                }}
                onClick={() => {
                  if (key === 'total_volume') return;
                  setActiveTab(key);
                  setSelected(null);
                  setPage(1);
                }}
              >
                <ThemeIcon
                  size={36} radius="md" variant="light" mb={8}
                  color={key === 'total_volume' ? 'orange' : mColor}
                >
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xl" fw={900} c={key === 'total_volume' ? 'var(--bm-terracotta, #c4704b)' : `var(--mantine-color-${mColor}-7)`}>
                  {value}
                </Text>
                <Text size="sm" c="var(--bm-text-muted)">{label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Tab + Side Panel Layout */}
          <Flex gap="md" align="flex-start" wrap={selected ? "nowrap" : "wrap"} direction={{ base: 'column', md: 'row' }}>
            {/* Left List */}
            <Box style={{ flex: selected ? '0 0 45%' : '1 1 100%', transition: 'all 0.3s ease', minWidth: 0, width: '100%' }}>
              <Card padding="md" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                <Group justify="space-between" mb={16} wrap="nowrap">
                  <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setSelected(null); setPage(1); }} style={{ flex: 1, minWidth: 200 }}>
                    <Tabs.List>
                      <Tabs.Tab value="all">All</Tabs.Tab>
                      <Tabs.Tab value="succeeded">Succeeded</Tabs.Tab>
                      <Tabs.Tab value="pending">Pending</Tabs.Tab>
                      <Tabs.Tab value="refunded">Refunded</Tabs.Tab>
                      <Tabs.Tab value="disputed">Disputed</Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                  <Group gap={8} wrap="nowrap">
                    <TextInput
                      placeholder="Search donor, charity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      leftSection={<IconSearch size={16} />}
                      style={{ flex: 0.8, minWidth: 160 }}
                      radius="md"
                    />
                    <Button
                      variant="light"
                      color="sage"
                      radius="md"
                      leftSection={<IconDownload size={16} />}
                      onClick={exportCSV}
                      disabled={filtered.length === 0}
                    >
                      CSV
                    </Button>
                  </Group>
                </Group>

                {loading ? (
                  <Box ta="center" py={40}><Loader size="md" color="sage" /></Box>
                ) : (
                  <ScrollArea style={{ flex: 1 }}>
                    <Table highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Donor</Table.Th>
                          {!selected && <Table.Th>Charity</Table.Th>}
                          <Table.Th>Amount</Table.Th>
                          <Table.Th>Status</Table.Th>
                          {!selected && <Table.Th>Date</Table.Th>}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filtered.map((donation) => {
                          const sc = STATUS_CONFIG[donation.status] ?? STATUS_CONFIG.pending;
                          const isSelected = selected?.id === donation.id;
                          return (
                            <Table.Tr
                              key={donation.id}
                              onClick={() => setSelected(donation)}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--bm-sage-bg)' : undefined,
                                borderLeft: isSelected ? '3px solid var(--bm-sage-dark)' : '3px solid transparent',
                              }}
                            >
                              <Table.Td>
                                <Text fw={600} size="sm" c={isSelected ? 'var(--bm-sage-dark)' : 'var(--bm-text-dark)'} lineClamp={1}>{donation.donor_name}</Text>
                                {selected ? null : <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{donation.donor_email}</Text>}
                              </Table.Td>
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm" lineClamp={1}>{donation.charity_name}</Text>
                                </Table.Td>
                              )}
                              <Table.Td>
                                <Text size="sm" fw={600} ff="monospace">{formatNZD(donation.amount_minor)}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Badge color={sc.color} variant="light" size="xs">
                                  {sc.label}
                                </Badge>
                              </Table.Td>
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm">{formatDate(donation.created_at)}</Text>
                                </Table.Td>
                              )}
                            </Table.Tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={selected ? 3 : 5} style={{ textAlign: 'center', padding: '32px 0' }}>
                              <Text c="var(--bm-text-muted)">No donations found.</Text>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                )}

                {totalPages > 1 && (
                  <Group justify="center" mt={12}>
                    <Pagination total={totalPages} value={page} onChange={setPage} color="sage" size="sm" />
                  </Group>
                )}
              </Card>
            </Box>

            {/* Right Detail Panel */}
            {selected && (
              <Box style={{ flex: '1 1 55%', minWidth: 0, width: '100%', animation: 'fadeIn 0.3s ease' }}>
                <Card padding="xl" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                  <Group justify="space-between" mb={20} align="flex-start">
                    <Group gap={12} align="flex-start">
                      <ThemeIcon size={48} radius="md" color="var(--bm-sage-dark)" variant="light">
                        <IconReceipt size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} c="var(--bm-text-dark)">{formatNZD(selected.amount_minor)}</Title>
                        <Group gap={8} mt={4}>
                          <Badge color={STATUS_CONFIG[selected.status]?.color ?? 'gray'} variant="light">
                            {STATUS_CONFIG[selected.status]?.label ?? selected.status}
                          </Badge>
                          <Text size="sm" c="var(--bm-text-muted)">{formatDate(selected.created_at)}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setSelected(null)}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                    <Stack gap={24} pr={16}>

                      {/* Detail Grid */}
                      <SimpleGrid cols={2} spacing={12}>
                        {[
                          { icon: IconUser, label: 'Donor Name', value: selected.donor_name },
                          { icon: IconMail, label: 'Donor Email', value: selected.donor_email },
                          { icon: IconBuilding, label: 'Charity', value: selected.charity_name },
                          { icon: IconFileText, label: 'Project', value: selected.project_title ?? '—' },
                          { icon: IconCurrencyDollar, label: 'Gross Amount', value: formatNZD(selected.amount_minor) },
                          { icon: IconPercentage, label: 'Platform Fee', value: formatNZD(selected.platform_fee_minor) },
                          { icon: IconCurrencyDollar, label: 'Net Amount', value: formatNZD(selected.net_amount_minor) },
                          { icon: IconCreditCard, label: 'Stripe Payment ID', value: selected.stripe_payment_intent_id ?? '—' },
                          { icon: IconCalendar, label: 'Date', value: formatDate(selected.created_at) },
                        ].map(({ icon: Icon, label, value }) => (
                          <Box key={label} p={10} style={{ background: 'var(--bm-sage-bg)', borderRadius: 8 }}>
                            <Group gap={6} mb={2}>
                              <Icon size={12} color="var(--bm-sage-dark)" />
                              <Text size="xs" c="var(--bm-text-muted)">{label}</Text>
                            </Group>
                            <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1} title={value}>{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>

                      <Divider />

                      {/* Refund Action Box — only for succeeded donations */}
                      {selected.status === 'succeeded' && (
                        <Box p={16} style={{ background: '#fff5f5', borderRadius: 8, border: '1px solid #ffc9c9' }}>
                          <Text fw={600} size="sm" mb={12} c="red.7">Issue Refund</Text>
                          <Textarea
                            placeholder="Enter reason for refund..."
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.currentTarget.value)}
                            autosize
                            minRows={2}
                            radius="md"
                            mb={12}
                          />
                          <Button
                            color="red"
                            leftSection={<IconRefresh size={16} />}
                            radius="xl"
                            onClick={() => setConfirmRefundModal(true)}
                            disabled={!refundReason.trim()}
                            fullWidth
                          >
                            Issue Refund
                          </Button>
                        </Box>
                      )}

                    </Stack>
                  </ScrollArea>
                </Card>
              </Box>
            )}
          </Flex>

        </Container>
      </main>
      <Footer />

      {/* Refund Confirmation Modal */}
      <Modal
        opened={confirmRefundModal}
        onClose={() => setConfirmRefundModal(false)}
        title={<Group gap={8}><IconAlertCircle color="red" /><Text fw={700}>Confirm Refund</Text></Group>}
        radius="lg"
        centered
      >
        <Text size="sm" mb={16}>
          Are you sure you want to refund <strong>{formatNZD(selected?.amount_minor ?? 0)}</strong> to <strong>{selected?.donor_name}</strong>?
        </Text>
        {refundReason && (
          <Box p={12} mb={16} style={{ background: '#f1f3f5', borderRadius: 8 }}>
            <Text size="xs" fw={700} c="dimmed">REFUND REASON</Text>
            <Text size="sm">&quot;{refundReason}&quot;</Text>
          </Box>
        )}
        <Group justify="flex-end" mt={24}>
          <Button variant="subtle" color="gray" onClick={() => setConfirmRefundModal(false)}>Cancel</Button>
          <Button
            color="red"
            onClick={handleRefund}
            loading={refundLoading}
          >
            Confirm Refund
          </Button>
        </Group>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported page with ProtectedRoute wrapper
// ---------------------------------------------------------------------------

export default function AdminDonationsPage() {
  return (
    <ProtectedRoute allowedDemoRoles={['admin']}>
      <AdminDonationsContent />
    </ProtectedRoute>
  );
}
