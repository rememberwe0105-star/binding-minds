'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon,
  Flex, TextInput, ScrollArea, Loader, Pagination,
  Progress,
} from '@mantine/core';
import {
  IconClipboardCheck, IconCheck, IconX, IconClock,
  IconShieldCheck, IconAlertCircle, IconArrowLeft,
  IconSearch, IconCalendar, IconCoin, IconBuildingBank,
  IconPhoto, IconUsers, IconPlayerPause, IconFlag,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  getAdminProjects,
  updateAdminProjectStatus,
  type AdminProject,
  type AdminProjectStatus,
} from '@/lib/api';
import classes from './page.module.css';

// ---------------------------------------------------------------------------
// Status configuration – maps each project status to a display label, colour,
// and icon for consistent rendering across stat cards, badges, and actions.
// ---------------------------------------------------------------------------
type DisplayStatus = Extract<AdminProjectStatus, 'pending_review' | 'active' | 'suspended' | 'rejected' | 'completed' | 'cancelled' | 'draft'>;

const STATUS_CONFIG: Record<DisplayStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: { label: 'Pending Review', color: 'orange', icon: <IconClock size={14} /> },
  active:         { label: 'Active',         color: 'green',  icon: <IconCheck size={14} /> },
  suspended:      { label: 'Suspended',      color: 'red',    icon: <IconPlayerPause size={14} /> },
  rejected:       { label: 'Rejected',       color: 'red',    icon: <IconX size={14} /> },
  completed:      { label: 'Completed',      color: 'blue',   icon: <IconFlag size={14} /> },
  cancelled:      { label: 'Cancelled',      color: 'gray',   icon: <IconX size={14} /> },
  draft:          { label: 'Draft',          color: 'gray',   icon: <IconClock size={14} /> },
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function formatAmount(cents: number, currency = 'NZD') {
  const symbol = currency === 'NZD' ? '$' : currency;
  return `${symbol}${Math.round(cents / 100).toLocaleString('en-NZ')}`;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(dateStr));
}

// Which tab values map to an API status filter
const TAB_STATUS_MAP: Record<string, AdminProjectStatus | undefined> = {
  pending_review: 'pending_review',
  active: 'active',
  suspended: 'suspended',
  rejected: 'rejected',
  all: undefined, // no filter
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('pending_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 30;

  // Action state
  const [actionNote, setActionNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<AdminProjectStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Stat counts
  const [counts, setCounts] = useState({
    pending_review: 0,
    active: 0,
    suspended: 0,
    total: 0,
  });

  // ------ Data loading ------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusFilter = activeTab ? TAB_STATUS_MAP[activeTab] : undefined;
      const result = await getAdminProjects(statusFilter, page, pageSize);
      setProjects(result.items);
      setTotal(result.total);

      // Fetch counts for each stat card (tiny page-size requests)
      const [pendingRes, activeRes, suspendedRes, allRes] = await Promise.all([
        getAdminProjects('pending_review', 1, 1).catch(() => ({ total: 0 })),
        getAdminProjects('active', 1, 1).catch(() => ({ total: 0 })),
        getAdminProjects('suspended', 1, 1).catch(() => ({ total: 0 })),
        getAdminProjects(undefined, 1, 1).catch(() => ({ total: 0 })),
      ]);
      setCounts({
        pending_review: pendingRes.total,
        active: activeRes.total,
        suspended: suspendedRes.total,
        total: allRes.total,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load projects';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  // ------ Client-side search filtering ------
  const filtered = searchQuery
    ? projects.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.charity_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : projects;

  // ------ Action handler ------
  const applyAction = async () => {
    if (!selected || !confirmAction) return;
    setActionLoading(true);
    try {
      await updateAdminProjectStatus(selected.id, {
        status: confirmAction,
        admin_note: actionNote || undefined,
      });
      setConfirmAction(null);
      setActionNote('');
      setSelected(null);
      loadData(); // Refresh the list after action
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // Convenience helper: get status config for a project, falling back gracefully
  const getStatusCfg = (status: AdminProjectStatus) =>
    STATUS_CONFIG[status as DisplayStatus] ?? { label: status, color: 'gray', icon: <IconClock size={14} /> };

  // Progress percentage for selected project
  const progressPct = selected
    ? Math.min(100, selected.goal_amount_minor > 0
        ? (selected.current_amount_minor / selected.goal_amount_minor) * 100
        : 0)
    : 0;

  return (
    <ProtectedRoute allowedDemoRoles={['admin']}>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>

          {/* ---- Back to Overview ---- */}
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

          {/* ---- Page Header ---- */}
          <Group justify="space-between" mb={8}>
            <Box>
              <Group gap={8} mb={4}>
                <IconClipboardCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Project Moderation</Title>
            </Box>
          </Group>

          {/* ---- Error banner ---- */}
          {error && (
            <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={16} withCloseButton onClose={() => setError(null)}>
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          {/* ---- Stat Cards ---- */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32}>
            {([
              { key: 'pending_review' as const, label: 'Pending Review', color: 'orange', icon: IconClock,        tab: 'pending_review' },
              { key: 'active'         as const, label: 'Active',         color: 'green',  icon: IconCheck,        tab: 'active' },
              { key: 'suspended'      as const, label: 'Suspended',      color: 'red',    icon: IconPlayerPause,  tab: 'suspended' },
              { key: 'total'          as const, label: 'Total Projects', color: 'blue',   icon: IconClipboardCheck, tab: 'all' },
            ] as const).map(({ key, label, color, icon: Icon, tab }) => (
              <Card
                key={key} padding="lg" radius="lg" withBorder
                className={classes.statCard}
                style={{ cursor: 'pointer', borderColor: activeTab === tab ? `var(--mantine-color-${color}-4)` : undefined }}
                onClick={() => {
                  setActiveTab(tab);
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

          {/* ---- Split-panel layout: list + detail ---- */}
          <Flex gap="md" align="flex-start" wrap={selected ? 'nowrap' : 'wrap'} direction={{ base: 'column', md: 'row' }}>

            {/* ======== Left List Panel (45%) ======== */}
            <Box style={{ flex: selected ? '0 0 45%' : '1 1 100%', transition: 'all 0.3s ease', minWidth: 0, width: '100%' }}>
              <Card padding="md" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                {/* Tabs + Search */}
                <Group justify="space-between" mb={16} wrap="nowrap">
                  <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setSelected(null); setPage(1); }} style={{ flex: 1, minWidth: 200 }}>
                    <Tabs.List>
                      <Tabs.Tab value="pending_review">Pending</Tabs.Tab>
                      <Tabs.Tab value="active">Active</Tabs.Tab>
                      <Tabs.Tab value="suspended">Suspended</Tabs.Tab>
                      <Tabs.Tab value="rejected">Rejected</Tabs.Tab>
                      <Tabs.Tab value="all">All</Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                  <TextInput
                    placeholder="Search title, charity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ flex: 0.8 }}
                    radius="md"
                  />
                </Group>

                {/* Table body */}
                {loading ? (
                  <Box ta="center" py={40}><Loader size="md" color="sage" /></Box>
                ) : (
                  <ScrollArea style={{ flex: 1 }}>
                    <Table highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Project Name</Table.Th>
                          {!selected && <Table.Th>Goal Amount</Table.Th>}
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filtered.map((project) => {
                          const sc = getStatusCfg(project.project_status);
                          const isSelected = selected?.id === project.id;
                          return (
                            <Table.Tr
                              key={project.id}
                              onClick={() => setSelected(project)}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--bm-sage-bg)' : undefined,
                                borderLeft: isSelected ? '3px solid var(--bm-sage-dark)' : '3px solid transparent',
                              }}
                            >
                              <Table.Td>
                                <Text fw={600} size="sm" c={isSelected ? 'var(--bm-sage-dark)' : 'var(--bm-text-dark)'} lineClamp={1}>{project.title}</Text>
                                <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{project.charity_name}</Text>
                              </Table.Td>
                              {!selected && (
                                <Table.Td>
                                  <Text size="sm" ff="monospace">{formatAmount(project.goal_amount_minor, project.currency_code)}</Text>
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
                            <Table.Td colSpan={selected ? 2 : 3} style={{ textAlign: 'center', padding: '32px 0' }}>
                              <Text c="var(--bm-text-muted)">No projects found.</Text>
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

            {/* ======== Right Detail Panel (55%) ======== */}
            {selected && (
              <Box style={{ flex: '1 1 55%', minWidth: 0, width: '100%', animation: 'fadeIn 0.3s ease' }}>
                <Card padding="xl" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                  {/* Header: title + status + close */}
                  <Group justify="space-between" mb={20} align="flex-start">
                    <Group gap={12} align="flex-start">
                      <ThemeIcon size={48} radius="md" color="var(--bm-sage-dark)" variant="light">
                        <IconClipboardCheck size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} c="var(--bm-text-dark)">{selected.title}</Title>
                        <Group gap={8} mt={4}>
                          <Badge color={getStatusCfg(selected.project_status).color} variant="light">
                            {getStatusCfg(selected.project_status).label}
                          </Badge>
                          <Text size="sm" c="var(--bm-text-muted)">{selected.charity_name}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setSelected(null)}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                    <Stack gap={24} pr={16}>

                      {/* Cover image preview */}
                      {selected.cover_image_url && (
                        <Box>
                          <img
                            src={selected.cover_image_url}
                            alt={`Cover image for ${selected.title}`}
                            className={classes.coverImage}
                          />
                        </Box>
                      )}

                      {/* Detail grid (2 cols) */}
                      <SimpleGrid cols={2} spacing={12}>
                        {[
                          { icon: IconBuildingBank, label: 'Charity Name',   value: selected.charity_name },
                          { icon: IconCoin,         label: 'Goal Amount',    value: formatAmount(selected.goal_amount_minor, selected.currency_code) },
                          { icon: IconCoin,         label: 'Current Amount', value: formatAmount(selected.current_amount_minor, selected.currency_code) },
                          { icon: IconCoin,         label: 'Currency',       value: selected.currency_code },
                          { icon: IconCalendar,     label: 'Start Date',    value: selected.start_date ? formatDate(selected.start_date) : '—' },
                          { icon: IconCalendar,     label: 'End Date',      value: selected.end_date ? formatDate(selected.end_date) : '—' },
                          { icon: IconCalendar,     label: 'Created',       value: formatDate(selected.created_at) },
                          { icon: IconUsers,        label: 'Donors',        value: selected.donor_count != null ? String(selected.donor_count) : '—' },
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

                      {/* Progress bar */}
                      <Box className={classes.progressSection}>
                        <Group justify="space-between" mb={6}>
                          <Text size="sm" fw={600} c="var(--bm-text-dark)">Funding Progress</Text>
                          <Text size="sm" c="var(--bm-text-muted)">
                            {formatAmount(selected.current_amount_minor, selected.currency_code)} / {formatAmount(selected.goal_amount_minor, selected.currency_code)}
                          </Text>
                        </Group>
                        <Progress value={progressPct} color="sage" size="lg" radius="xl" />
                        <Text size="xs" c="var(--bm-text-muted)" mt={4} ta="right">
                          {progressPct.toFixed(1)}%
                        </Text>
                      </Box>

                      <Divider />

                      {/* Description */}
                      {selected.description && (
                        <Box>
                          <Text fw={600} size="sm" mb={6} c="var(--bm-text-dark)">Description</Text>
                          <Text size="sm" c="var(--bm-text-muted)" style={{ whiteSpace: 'pre-wrap' }}>
                            {selected.description}
                          </Text>
                        </Box>
                      )}

                      <Divider />

                      {/* Action Box */}
                      <Box p={16} style={{ background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <Text fw={600} size="sm" mb={12}>Take Action</Text>
                        <Textarea
                          placeholder="Add admin note, reason for rejection or suspension..."
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
                            onClick={() => setConfirmAction('active')}
                            disabled={selected.project_status === 'active'}
                          >
                            Approve
                          </Button>
                          <Button
                            color="orange" variant="outline" leftSection={<IconPlayerPause size={16} />} radius="xl"
                            onClick={() => setConfirmAction('suspended')}
                            disabled={selected.project_status === 'suspended'}
                          >
                            Suspend
                          </Button>
                          <Button
                            color="red" variant="outline" leftSection={<IconX size={16} />} radius="xl"
                            onClick={() => setConfirmAction('rejected')}
                            disabled={selected.project_status === 'rejected'}
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

      {/* ---- Confirmation Modal ---- */}
      <Modal
        opened={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={<Group gap={8}><IconAlertCircle color="orange" /><Text fw={700}>Confirm Action</Text></Group>}
        radius="lg"
        centered
      >
        <Text size="sm" mb={16}>
          Are you sure you want to mark <strong>{selected?.title}</strong> as{' '}
          <Badge color={confirmAction ? getStatusCfg(confirmAction).color : 'gray'} variant="light">
            {confirmAction ? getStatusCfg(confirmAction).label : ''}
          </Badge>?
        </Text>
        {actionNote && (
          <Box p={12} mb={16} style={{ background: '#f1f3f5', borderRadius: 8 }}>
            <Text size="xs" fw={700} c="dimmed">NOTE INCLUDED</Text>
            <Text size="sm">&quot;{actionNote}&quot;</Text>
          </Box>
        )}
        <Group justify="flex-end" mt={24}>
          <Button variant="subtle" color="gray" onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            color={confirmAction ? getStatusCfg(confirmAction).color : 'blue'}
            onClick={applyAction}
            loading={actionLoading}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
    </ProtectedRoute>
  );
}
