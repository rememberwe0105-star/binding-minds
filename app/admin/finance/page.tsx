'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Table, Alert,
  TextInput, ScrollArea, Loader, Pagination,
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconArrowLeft,
  IconSearch, IconCoin, IconReceipt, IconTrendingUp,
  IconClock, IconDownload,
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminFinanceOverview,
  type AdminFinanceOverview,
  type AdminCharitySettlement,
} from '@/lib/api';
import classes from './page.module.css';

function formatNZD(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString('en-NZ')}`;
}

const STRIPE_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Active' },
  restricted: { color: 'orange', label: 'Restricted' },
  disabled: { color: 'red', label: 'Disabled' },
};

export default function AdminFinancePage() {
  const [data, setData] = useState<AdminFinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  useEffect(() => {
    getAdminFinanceOverview()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const settlements = data?.settlements ?? [];
  const filtered = searchQuery
    ? settlements.filter(s =>
        s.charity_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : settlements;

  // Sort by total received descending
  const sorted = [...filtered].sort((a, b) => b.total_received_minor - a.total_received_minor);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedItems = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const exportCSV = () => {
    const headers = ['Charity', 'Total Received', 'Platform Fee', 'Settled', 'Pending', 'Stripe Status'];
    const rows = sorted.map(s => [
      s.charity_name,
      `$${(s.total_received_minor / 100).toFixed(2)}`,
      `$${(s.total_fees_minor / 100).toFixed(2)}`,
      `$${(s.total_settled_minor / 100).toFixed(2)}`,
      `$${(s.pending_settlement_minor / 100).toFixed(2)}`,
      s.stripe_status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute allowedDemoRoles={['admin']}>
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
                <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Financial Management</Title>
            </Box>
            <Button
              color="terracotta"
              radius="xl"
              leftSection={<IconDownload size={16} />}
              onClick={exportCSV}
              disabled={sorted.length === 0}
            >
              Export CSV
            </Button>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={16} withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          {loading ? (
            <Box ta="center" py={80}>
              <Loader size="lg" color="sage" />
              <Text c="var(--bm-text-muted)" mt={12}>Loading finance data...</Text>
            </Box>
          ) : (
            <>
              {/* Stat Cards */}
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32}>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <ThemeIcon size={36} radius="md" color="grape" variant="light" mb={8}>
                    <IconReceipt size={18} />
                  </ThemeIcon>
                  <Text size="xl" fw={900} c="grape.7">
                    {formatNZD(data?.total_platform_revenue_minor ?? 0)}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">Platform Revenue</Text>
                </Card>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <ThemeIcon size={36} radius="md" color="green" variant="light" mb={8}>
                    <IconTrendingUp size={18} />
                  </ThemeIcon>
                  <Text size="xl" fw={900} c="green.7">
                    {formatNZD(data?.total_donations_minor ?? 0)}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">Total Donation Volume</Text>
                </Card>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <ThemeIcon size={36} radius="md" color="blue" variant="light" mb={8}>
                    <IconCoin size={18} />
                  </ThemeIcon>
                  <Text size="xl" fw={900} c="blue.7">
                    {formatNZD(data?.total_settled_minor ?? 0)}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">Total Settled</Text>
                </Card>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <ThemeIcon size={36} radius="md" color="orange" variant="light" mb={8}>
                    <IconClock size={18} />
                  </ThemeIcon>
                  <Text size="xl" fw={900} c="orange.7">
                    {formatNZD(data?.pending_settlements_minor ?? 0)}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">Pending Settlements</Text>
                </Card>
              </SimpleGrid>

              {/* Fee Rate */}
              {data?.avg_fee_rate != null && (
                <Alert variant="light" color="blue" radius="md" mb={16} icon={<IconReceipt size={16} />}>
                  <Text size="sm">Average platform fee rate: <strong>{(data.avg_fee_rate * 100).toFixed(1)}%</strong></Text>
                </Alert>
              )}

              {/* Settlement Table */}
              <Card padding="md" radius="lg" withBorder>
                <Group justify="space-between" mb={16}>
                  <Text fw={700} size="md" c="var(--bm-text-dark)">Charity Settlement Details</Text>
                  <TextInput
                    placeholder="Search charity name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ width: 260 }}
                    radius="md"
                  />
                </Group>

                <ScrollArea>
                  <Table highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Charity</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Total Received</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Platform Fee</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Settled</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Pending</Table.Th>
                        <Table.Th>Stripe Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedItems.map((s: AdminCharitySettlement) => {
                        const stripeConfig = STRIPE_STATUS_CONFIG[s.stripe_status] ?? { color: 'gray', label: s.stripe_status };
                        return (
                          <Table.Tr key={s.charity_id}>
                            <Table.Td>
                              <Text fw={600} size="sm" c="var(--bm-text-dark)" lineClamp={1}>{s.charity_name}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Text size="sm" fw={600}>{formatNZD(s.total_received_minor)}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Text size="sm" c="grape.7">{formatNZD(s.total_fees_minor)}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Text size="sm" c="green.7">{formatNZD(s.total_settled_minor)}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Text size="sm" c={s.pending_settlement_minor > 0 ? 'orange.7' : 'var(--bm-text-muted)'} fw={s.pending_settlement_minor > 0 ? 600 : 400}>
                                {formatNZD(s.pending_settlement_minor)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={stripeConfig.color} variant="light" size="xs">
                                {stripeConfig.label}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                      {paginatedItems.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text c="var(--bm-text-muted)">No settlement data available.</Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>

                {totalPages > 1 && (
                  <Group justify="center" mt={16}>
                    <Pagination total={totalPages} value={page} onChange={setPage} color="sage" size="sm" />
                  </Group>
                )}

                <Text size="xs" c="var(--bm-text-muted)" ta="right" mt={8}>
                  Showing {paginatedItems.length} of {sorted.length} charities
                </Text>
              </Card>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
