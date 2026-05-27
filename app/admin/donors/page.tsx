'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Alert, Stack, Divider, ActionIcon, Flex, TextInput, ScrollArea,
  Loader, Pagination,
} from '@mantine/core';
import {
  IconUser, IconCheck, IconX, IconShieldCheck,
  IconClock, IconAlertCircle, IconMail, IconArrowLeft,
  IconSearch, IconHeart, IconCoin
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminDonors,
  updateDonorStatus,
  type AdminDonorItem,
} from '@/lib/api';
import classes from './page.module.css';

type DonorStatus = 'active' | 'inactive' | 'deleted';

function formatNZD(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<AdminDonorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<AdminDonorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 30;

  const [confirmStatusModal, setConfirmStatusModal] = useState<DonorStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDonors(page, pageSize);
      setDonors(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load donors');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { loadDonors(); }, [loadDonors]);

  // Client-side filtering
  const filtered = donors.filter((d) => {
    const matchesTab = activeTab === 'all' || d.status === activeTab;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: total,
    active: donors.filter((d) => d.status === 'active').length,
    inactive: donors.filter((d) => d.status === 'inactive' || d.status === 'deleted').length,
  };

  const handleStatusChange = async () => {
    if (!selected || !confirmStatusModal) return;
    setActionLoading(true);
    try {
      await updateDonorStatus(selected.id, { status: confirmStatusModal });
      setSelected(prev => prev ? { ...prev, status: confirmStatusModal } : null);
      setConfirmStatusModal(null);
      loadDonors(); // Refresh
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status change failed');
      setConfirmStatusModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

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
              <Title order={1} className={classes.pageTitle}>Donor Management</Title>
            </Box>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={16} withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={16} mb={32}>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={36} radius="md" color="blue" variant="light" mb={8}>
                <IconUser size={18} />
              </ThemeIcon>
              <Text size="xl" fw={900} c="var(--bm-text-dark)">{total}</Text>
              <Text size="sm" c="var(--bm-text-muted)">Total Donors</Text>
            </Card>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={36} radius="md" color="green" variant="light" mb={8}>
                <IconCheck size={18} />
              </ThemeIcon>
              <Text size="xl" fw={900} c="green.7">{counts.active}</Text>
              <Text size="sm" c="var(--bm-text-muted)">Active Accounts</Text>
            </Card>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={36} radius="md" color="red" variant="light" mb={8}>
                <IconX size={18} />
              </ThemeIcon>
              <Text size="xl" fw={900} c="red.7">{counts.inactive}</Text>
              <Text size="sm" c="var(--bm-text-muted)">Inactive / Blocked</Text>
            </Card>
          </SimpleGrid>

          {/* Main Layout: List & Detail Panel */}
          <Flex gap="md" align="flex-start" wrap={selected ? "nowrap" : "wrap"} direction={{ base: 'column', md: 'row' }}>

            {/* Left: List Panel */}
            <Box style={{ flex: selected ? '0 0 45%' : '1 1 100%', transition: 'all 0.3s ease', minWidth: 0, width: '100%' }}>
              <Card padding="md" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                <Group justify="space-between" mb={16} wrap="nowrap">
                  <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setSelected(null); }} style={{ flex: 1, minWidth: 200 }}>
                    <Tabs.List>
                      <Tabs.Tab value="all">All</Tabs.Tab>
                      <Tabs.Tab value="active">Active</Tabs.Tab>
                      <Tabs.Tab value="inactive">Inactive</Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                  <TextInput
                    placeholder="Search name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ flex: 0.8 }}
                    radius="md"
                  />
                </Group>

                {loading ? (
                  <Box ta="center" py={40}><Loader size="md" color="sage" /></Box>
                ) : (
                  <ScrollArea style={{ flex: 1 }}>
                    <Table highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Donor</Table.Th>
                          {!selected && <Table.Th>Total Donated</Table.Th>}
                          {!selected && <Table.Th>Joined</Table.Th>}
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filtered.map((d) => {
                          const isSelected = selected?.id === d.id;
                          return (
                            <Table.Tr
                              key={d.id}
                              onClick={() => setSelected(d)}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--bm-sage-bg)' : undefined,
                                borderLeft: isSelected ? '3px solid var(--bm-sage-dark)' : '3px solid transparent'
                              }}
                            >
                              <Table.Td>
                                <Text fw={600} size="sm" c={isSelected ? 'var(--bm-sage-dark)' : 'var(--bm-text-dark)'} lineClamp={1}>{d.name}</Text>
                                <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{d.email}</Text>
                              </Table.Td>
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm" fw={600}>{formatNZD(d.total_donated_minor)}</Text>
                                </Table.Td>
                              )}
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm">{formatDate(d.created_at)}</Text>
                                </Table.Td>
                              )}
                              <Table.Td>
                                <Badge color={d.status === 'active' ? 'green' : 'red'} variant="light" size="xs">
                                  {d.status}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={selected ? 2 : 4} style={{ textAlign: 'center', padding: '32px 0' }}>
                              <Text c="var(--bm-text-muted)">No donors found.</Text>
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

            {/* Right: Detail Panel */}
            {selected && (
              <Box style={{ flex: '1 1 55%', minWidth: 0, width: '100%', animation: 'fadeIn 0.3s ease' }}>
                <Card padding="xl" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                  <Group justify="space-between" mb={20} align="flex-start">
                    <Group gap={12} align="flex-start">
                      <ThemeIcon size={48} radius="md" color="blue" variant="light">
                        <IconUser size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} c="var(--bm-text-dark)">{selected.name}</Title>
                        <Group gap={8} mt={4}>
                          <Badge color={selected.status === 'active' ? 'green' : 'red'} variant="light">
                            {selected.status}
                          </Badge>
                          <Text size="sm" c="var(--bm-text-muted)">Joined {formatDate(selected.created_at)}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setSelected(null)}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                    <Stack gap={24} pr={16}>

                      {/* Key Metrics */}
                      <SimpleGrid cols={2} spacing={12}>
                        <Box p={16} style={{ background: 'var(--bm-sage-bg)', borderRadius: 8 }}>
                          <Group gap={6} mb={4}>
                            <IconCoin size={14} color="var(--bm-sage-dark)" />
                            <Text size="xs" tt="uppercase" fw={700} c="var(--bm-text-muted)">Total Donated</Text>
                          </Group>
                          <Text size="lg" fw={800} c="var(--bm-sage-dark)">{formatNZD(selected.total_donated_minor)}</Text>
                          <Text size="xs" c="var(--bm-text-muted)">Across {selected.donation_count} contributions</Text>
                        </Box>

                        <Box p={16} style={{ background: 'var(--bm-terracotta-bg)', borderRadius: 8 }}>
                          <Group gap={6} mb={4}>
                            <IconHeart size={14} color="var(--bm-terracotta-dark)" />
                            <Text size="xs" tt="uppercase" fw={700} c="var(--bm-text-muted)">Role</Text>
                          </Group>
                          <Text size="lg" fw={800} c="var(--bm-terracotta-dark)">{selected.role}</Text>
                          <Text size="xs" c="var(--bm-text-muted)">Account type</Text>
                        </Box>
                      </SimpleGrid>

                      {/* Info List */}
                      <SimpleGrid cols={2} spacing={12}>
                        <Box p={10} style={{ background: '#f8f9fa', borderRadius: 8 }}>
                          <Group gap={6} mb={2}>
                            <IconMail size={12} color="gray" />
                            <Text size="xs" c="var(--bm-text-muted)">Email Address</Text>
                          </Group>
                          <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{selected.email}</Text>
                        </Box>
                        <Box p={10} style={{ background: '#f8f9fa', borderRadius: 8 }}>
                          <Group gap={6} mb={2}>
                            <IconClock size={12} color="gray" />
                            <Text size="xs" c="var(--bm-text-muted)">Last Login</Text>
                          </Group>
                          <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{formatDate(selected.last_login_at)}</Text>
                        </Box>
                      </SimpleGrid>

                      <Divider />

                      {/* Action Box */}
                      <Box p={16} style={{ background: '#fff0f0', borderRadius: 8, border: '1px solid #ffc9c9' }}>
                        <Text fw={600} size="sm" c="red.9" mb={4}>Account Actions</Text>
                        <Text size="xs" c="red.7" mb={12}>Change the access status of this donor.</Text>

                        {selected.status === 'active' ? (
                          <Button color="red" variant="outline" size="sm" radius="md" onClick={() => setConfirmStatusModal('inactive')}>
                            Suspend Account
                          </Button>
                        ) : (
                          <Button color="green" variant="outline" size="sm" radius="md" onClick={() => setConfirmStatusModal('active')}>
                            Reactivate Account
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </ScrollArea>
                </Card>
              </Box>
            )}
          </Flex>

        </Container>
      </main>
      <Footer />

      {/* Confirmation Modal */}
      <Modal
        opened={!!confirmStatusModal}
        onClose={() => setConfirmStatusModal(null)}
        title={<Group gap={8}><IconAlertCircle color="orange" /><Text fw={700}>Confirm Status Change</Text></Group>}
        radius="lg"
        centered
      >
        <Text size="sm" mb={16}>
          Are you sure you want to change <strong>{selected?.name}</strong>&apos;s status to <Badge color={confirmStatusModal === 'active' ? 'green' : 'red'} variant="light">{confirmStatusModal}</Badge>?
        </Text>
        <Group justify="flex-end" mt={24}>
          <Button variant="subtle" color="gray" onClick={() => setConfirmStatusModal(null)}>Cancel</Button>
          <Button
            color={confirmStatusModal === 'active' ? 'green' : 'red'}
            onClick={handleStatusChange}
            loading={actionLoading}
          >
            Confirm Change
          </Button>
        </Group>
      </Modal>
    </ProtectedRoute>
  );
}
