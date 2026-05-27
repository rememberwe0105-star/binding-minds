'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon,
  Flex, TextInput, ScrollArea, Loader, Pagination,
} from '@mantine/core';
import {
  IconBuilding, IconCheck, IconX, IconPhone,
  IconShieldCheck, IconClock, IconAlertCircle,
  IconMail, IconWorld, IconCalendar, IconArrowLeft,
  IconSearch, IconExternalLink,
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminCharities,
  getAdminCharitiesHistory,
  updateCharityApplicationStatus,
  type AdminCharityApplication,
  type AdminCharityApprovalResponse,
} from '@/lib/api';
import classes from './page.module.css';

type AppStatus = 'pending' | 'approved' | 'rejected' | 'consultation';

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', color: 'orange', icon: <IconClock size={14} /> },
  approved: { label: 'Approved', color: 'green', icon: <IconCheck size={14} /> },
  rejected: { label: 'Rejected', color: 'red', icon: <IconX size={14} /> },
  consultation: { label: 'In Consultation', color: 'blue', icon: <IconPhone size={14} /> },
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(dateStr));
}

export default function AdminCharitiesPage() {
  const [apps, setApps] = useState<AdminCharityApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<AdminCharityApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 30;

  const [actionNote, setActionNote] = useState('');
  const [confirmActionModal, setConfirmActionModal] = useState<AppStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalResult, setApprovalResult] = useState<AdminCharityApprovalResponse | null>(null);

  const [counts, setCounts] = useState<Record<AppStatus, number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
    consultation: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load the current tab's data
      let result;
      if (activeTab === 'approved' || activeTab === 'rejected') {
        // Use history endpoint for past-processed items
        result = await getAdminCharitiesHistory(page, pageSize);
        // Filter by status client-side
        result = {
          ...result,
          items: result.items.filter(a => a.status === activeTab),
        };
      } else if (activeTab === 'all') {
        // Load all — try history for all
        result = await getAdminCharitiesHistory(page, pageSize);
      } else {
        result = await getAdminCharities(activeTab || 'pending', page, pageSize);
      }
      setApps(result.items);
      setTotal(result.total);

      // Load counts for all statuses
      const [pendingRes, approvedRes, rejectedRes, consultRes] = await Promise.all([
        getAdminCharities('pending', 1, 1).catch(() => ({ total: 0 })),
        getAdminCharitiesHistory(1, 1).catch(() => ({ total: 0 })),
        getAdminCharities('rejected', 1, 1).catch(() => ({ total: 0 })),
        getAdminCharities('consultation', 1, 1).catch(() => ({ total: 0 })),
      ]);
      setCounts({
        pending: pendingRes.total,
        approved: approvedRes.total,
        rejected: rejectedRes.total,
        consultation: consultRes.total,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side search filtering
  const filtered = searchQuery
    ? apps.filter(a =>
      a.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cc_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : apps;

  const applyAction = async () => {
    if (!selected || !confirmActionModal) return;
    setActionLoading(true);
    try {
      if (confirmActionModal === 'pending') {
        setConfirmActionModal(null);
        setActionLoading(false);
        return;
      }
      const result = await updateCharityApplicationStatus(selected.id, {
        status: confirmActionModal,
        admin_note: actionNote || undefined,
      });
      setApprovalResult(result);
      setConfirmActionModal(null);
      setActionNote('');
      setSelected(null);
      loadData(); // Refresh the list
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
      setConfirmActionModal(null);
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
              <Title order={1} className={classes.pageTitle}>Charity Registration Management</Title>
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
              { key: 'pending' as const, label: 'Pending Review', color: 'orange', icon: IconClock },
              { key: 'approved' as const, label: 'Approved', color: 'green', icon: IconCheck },
              { key: 'consultation' as const, label: 'In Consultation', color: 'blue', icon: IconPhone },
              { key: 'rejected' as const, label: 'Rejected', color: 'red', icon: IconX },
            ].map(({ key, label, color, icon: Icon }) => (
              <Card
                key={key} padding="lg" radius="lg" withBorder
                className={classes.statCard}
                style={{ cursor: 'pointer', borderColor: activeTab === key ? `var(--mantine-color-${color}-4)` : undefined }}
                onClick={() => {
                  setActiveTab(key);
                  setSelected(null);
                  setPage(1);
                }}
              >
                <ThemeIcon size={36} radius="md" color={color} variant="light" mb={8}>
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xl" fw={900} c={`var(--mantine-color-${color}-7)`}>
                  {counts[key]}
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
                      <Tabs.Tab value="pending">Pending</Tabs.Tab>
                      <Tabs.Tab value="consultation">Consult</Tabs.Tab>
                      <Tabs.Tab value="approved">Approved</Tabs.Tab>
                      <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
                      <Tabs.Tab value="all">All</Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                  <TextInput
                    placeholder="Search name, CC, email..."
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
                          <Table.Th>Organisation</Table.Th>
                          {!selected && <Table.Th>CC Number</Table.Th>}
                          {!selected && <Table.Th>Applied</Table.Th>}
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filtered.map((app) => {
                          const sc = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                          const isSelected = selected?.id === app.id;
                          return (
                            <Table.Tr
                              key={app.id}
                              onClick={() => setSelected(app)}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--bm-sage-bg)' : undefined,
                                borderLeft: isSelected ? '3px solid var(--bm-sage-dark)' : '3px solid transparent'
                              }}
                            >
                              <Table.Td>
                                <Text fw={600} size="sm" c={isSelected ? 'var(--bm-sage-dark)' : 'var(--bm-text-dark)'} lineClamp={1}>{app.display_name}</Text>
                                <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{app.contact_email}</Text>
                              </Table.Td>
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm" ff="monospace">{app.cc_number}</Text>
                                </Table.Td>
                              )}
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm">{formatDate(app.applied_at)}</Text>
                                </Table.Td>
                              )}
                              <Table.Td>
                                <Badge color={sc.color} variant="light" size="xs">
                                  {sc.label}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={selected ? 2 : 4} style={{ textAlign: 'center', padding: '32px 0' }}>
                              <Text c="var(--bm-text-muted)">No applications found.</Text>
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
                        <IconBuilding size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} c="var(--bm-text-dark)">{selected.display_name}</Title>
                        <Group gap={8} mt={4}>
                          <Badge color={STATUS_CONFIG[selected.status]?.color ?? 'gray'} variant="light">
                            {STATUS_CONFIG[selected.status]?.label ?? selected.status}
                          </Badge>
                          <Text size="sm" c="var(--bm-text-muted)">Applied {formatDate(selected.applied_at)}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setSelected(null)}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                    <Stack gap={24} pr={16}>

                      {/* External Link */}
                      <Button
                        component="a"
                        href={`https://www.charities.govt.nz/charities-in-new-zealand/view-registered-charities/?keyword=${selected.cc_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        color="blue"
                        fullWidth
                        rightSection={<IconExternalLink size={16} />}
                        radius="md"
                      >
                        Verify {selected.cc_number} on NZ Charities Register
                      </Button>

                      {/* Basic Info */}
                      <SimpleGrid cols={2} spacing={12}>
                        {[
                          { icon: IconBuilding, label: 'Legal Name', value: selected.legal_name },
                          { icon: IconShieldCheck, label: 'CC Number', value: selected.cc_number },
                          { icon: IconMail, label: 'Contact Email', value: selected.contact_email },
                          { icon: IconPhone, label: 'Contact', value: selected.contact_name },
                          { icon: IconWorld, label: 'Category', value: selected.category },
                          { icon: IconCalendar, label: 'Applied', value: formatDate(selected.applied_at) },
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

                      {/* Action Box */}
                      <Box p={16} style={{ background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <Text fw={600} size="sm" mb={12}>Take Action</Text>
                        <Textarea
                          placeholder="Add internal note, reason for rejection, or consultation details..."
                          value={actionNote}
                          onChange={(e) => setActionNote(e.currentTarget.value)}
                          autosize
                          minRows={2}
                          radius="md"
                          mb={12}
                        />
                        <Group grow>
                          <Button
                            color="green" leftSection={<IconCheck size={16} />} radius="xl"
                            onClick={() => setConfirmActionModal('approved')}
                            disabled={selected.status === 'approved'}
                          >
                            Approve
                          </Button>
                          <Button
                            color="blue" variant="outline" leftSection={<IconPhone size={16} />} radius="xl"
                            onClick={() => setConfirmActionModal('consultation')}
                            disabled={selected.status === 'consultation'}
                          >
                            Consult
                          </Button>
                          <Button
                            color="red" variant="outline" leftSection={<IconX size={16} />} radius="xl"
                            onClick={() => setConfirmActionModal('rejected')}
                            disabled={selected.status === 'rejected'}
                          >
                            Reject
                          </Button>
                        </Group>
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
        opened={!!confirmActionModal}
        onClose={() => setConfirmActionModal(null)}
        title={<Group gap={8}><IconAlertCircle color="orange" /><Text fw={700}>Confirm Action</Text></Group>}
        radius="lg"
        centered
      >
        <Text size="sm" mb={16}>
          Are you sure you want to mark <strong>{selected?.display_name}</strong> as <Badge color={confirmActionModal ? STATUS_CONFIG[confirmActionModal].color : 'gray'} variant="light">{confirmActionModal}</Badge>?
        </Text>
        {actionNote && (
          <Box p={12} mb={16} style={{ background: '#f1f3f5', borderRadius: 8 }}>
            <Text size="xs" fw={700} c="dimmed">NOTE INCLUDED</Text>
            <Text size="sm">&quot;{actionNote}&quot;</Text>
          </Box>
        )}
        <Group justify="flex-end" mt={24}>
          <Button variant="subtle" color="gray" onClick={() => setConfirmActionModal(null)}>Cancel</Button>
          <Button
            color={confirmActionModal ? STATUS_CONFIG[confirmActionModal].color : 'blue'}
            onClick={applyAction}
            loading={actionLoading}
          >
            Confirm {confirmActionModal}
          </Button>
        </Group>
      </Modal>

      {/* Approval Result Modal */}
      <Modal
        opened={!!approvalResult}
        onClose={() => setApprovalResult(null)}
        title={<Group gap={8}><IconCheck color="green" /><Text fw={700}>Action Completed</Text></Group>}
        radius="lg"
        centered
      >
        {approvalResult && (
          <Stack gap={16}>
            <Text size="sm">{approvalResult.message}</Text>
            {approvalResult.onboardingUrl && (
              <Alert icon={<IconExternalLink size={16} />} color="blue" variant="light">
                <Text size="sm" fw={600} mb={8}>Stripe Onboarding Link Generated</Text>
                <Text size="xs" c="dimmed" mb={8}>
                  Share this link with the charity to complete their Stripe setup:
                </Text>
                <Button
                  component="a"
                  href={approvalResult.onboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  color="blue"
                  fullWidth
                  rightSection={<IconExternalLink size={14} />}
                  size="sm"
                >
                  Open Stripe Onboarding
                </Button>
                {approvalResult.onboardingExpiresAt && (
                  <Text size="xs" c="dimmed" mt={8}>
                    Expires: {formatDate(approvalResult.onboardingExpiresAt)}
                  </Text>
                )}
              </Alert>
            )}
            <Button onClick={() => setApprovalResult(null)} color="sage" radius="xl">
              Close
            </Button>
          </Stack>
        )}
      </Modal>
    </ProtectedRoute>
  );
}
