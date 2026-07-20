'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal, Switch,
  TextInput, Textarea, Select, Alert, Stack, Divider,
  Avatar, Tooltip, Progress, ActionIcon, Flex, Loader, Pagination,
} from '@mantine/core';
import {
  IconChartBar, IconCoin,
  IconCalendar, IconPlus, IconEdit, IconEye,
  IconBrandStripe, IconShieldCheck, IconAlertCircle, IconInfoCircle,
  IconUsers, IconDownload,
  IconClipboardList, IconSettings,
  IconCheck, IconDeviceFloppy, IconWorld, IconMail,
  IconPhone, IconMapPin, IconTrendingUp,
  IconUsersGroup, IconX, IconTrash, IconMoodEmpty,
  IconReceipt, IconSend, IconLock, IconSparkles,
} from '@tabler/icons-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth, demoCharityPlan } from '@/contexts/AuthContext';
import { ImageUpload, DocumentUpload, type UploadedFile } from '@/components/ImageUpload';
import { MultiImageUpload, type UploadedImage } from '@/components/MultiImageUpload';
import {
  getCharityAnalytics,
  getCharityDonations,
  updateCharityProfile,
  getCharityProjects,
  createCharityProject,
  updateCharityProject,
  deleteCharityProject,
  uploadCharityLogo,
  uploadCharityBanner,
  uploadProjectImages,
  uploadCharityImages,
  uploadCharityDocument,
  type CharityAnalytics,
  type CharityDonationItem,
  type CharityProject,
  type CharityProfileUpdate,
} from '@/lib/api';
import classes from './page.module.css';

// ── Utilities ────────────────────────────────────────────────────
function formatNZD(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColor = (s: string) => s === 'succeeded' ? 'green' : s === 'pending' ? 'orange' : 'red';
const statusLabel = (s: string) => s === 'succeeded' ? 'Completed' : s === 'pending' ? 'Pending' : 'Refunded';
const projectStatusColor = (s: string) => s === 'active' ? 'green' : s === 'completed' ? 'blue' : s === 'draft' ? 'gray' : 'red';

const PIE_COLORS = ['#e67e5e', '#8eb897', '#4b6bfb', '#f9c74f'];

// Fallback charityId for demo mode
const DEMO_CHARITY_ID = 3;

// ===================== Overview Tab =====================
function OverviewTab({ charityId }: { charityId: number }) {
  const [donations, setDonations] = useState<CharityDonationItem[]>([]);
  const [analytics, setAnalytics] = useState<CharityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCharityAnalytics().catch(() => null),
      getCharityDonations(charityId, 1, 5).catch(() => null),
    ]).then(([analyticsRes, donationsRes]) => {
      if (cancelled) return;
      if (analyticsRes) setAnalytics(analyticsRes);
      if (donationsRes) setDonations(donationsRes.items);
      setError(null);
    }).catch((err: Error) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [charityId]);

  if (loading) {
    return <Box ta="center" py={60}><Loader size="lg" color="sage" /><Text c="var(--bm-text-muted)" mt={12}>Loading dashboard data...</Text></Box>;
  }

  if (error) {
    return <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">{error}</Alert>;
  }

  const totalReceived = analytics?.total_amount_minor ?? 0;
  const uniqueDonors = analytics?.donor_count ?? 0;
  const totalDonationCount = analytics?.total_donations ?? 0;

  return (
    <>
      {/* Hero Banner */}
      <div className={classes.hero}>
        <div className={classes.heroBlob} />
        <Group justify="space-between" align="flex-end" wrap="wrap" gap={24} style={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Text size="sm" fw={600} c="rgba(255,255,255,0.6)" tt="uppercase" mb={4}>
              Total Donations Received
            </Text>
            <Text className={classes.heroAmount}>{formatNZD(totalReceived)}</Text>
            <Text size="sm" c="rgba(255,255,255,0.6)" mt={8}>
              From {uniqueDonors} generous supporters
            </Text>
          </Box>
          <Button
            radius="xl" size="md"
            style={{ background: 'white', color: 'var(--bm-sage-dark)' }}
            leftSection={<IconDownload size={18} />}
          >
            Export Report
          </Button>
        </Group>
      </div>

      {/* Stat Cards */}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing={16} mb={32}>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="terracotta" variant="light" mb={12}><IconCoin size={20} /></ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(totalReceived)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Received</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={12}><IconUsers size={20} /></ThemeIcon>
          <Text className={classes.statValue}>{uniqueDonors}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donors</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="blue" variant="light" mb={12}><IconClipboardList size={20} /></ThemeIcon>
          <Text className={classes.statValue}>{totalDonationCount}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donations</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="grape" variant="light" mb={12}><IconCalendar size={20} /></ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(analytics?.avg_donation_minor ?? 0)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Avg. Donation</Text>
        </Card>
      </SimpleGrid>

      {/* Recent Donations */}
      <Card padding="lg" radius="lg" withBorder>
        <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={16}>Recent Donations</Text>
        {donations.length === 0 ? (
          <Box ta="center" py={40}>
            <IconMoodEmpty size={40} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
            <Text c="var(--bm-text-muted)" mt={12}>No donations yet.</Text>
          </Box>
        ) : (
          donations.map((d, i) => (
            <div key={i} className={classes.recentItem}>
              <Box>
                <Text size="sm" fw={500} c="var(--bm-text-dark)">{d.donor_name}</Text>
                <Text size="xs" c="var(--bm-text-muted)">{d.paid_at ? timeAgo(d.paid_at) : '—'}</Text>
              </Box>
              <Box ta="right">
                <Text size="sm" fw={700} c="var(--bm-sage-dark)">{formatNZD(d.donation_amount_minor)}</Text>
                <Badge size="xs" color={statusColor(d.donation_status)} variant="light">{statusLabel(d.donation_status)}</Badge>
              </Box>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

// ===================== Analytics Tab =====================
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<CharityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharityAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box ta="center" py={60}><Loader size="lg" color="sage" /></Box>;
  if (!analytics) return <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">Analytics data is not available yet.</Alert>;

  const monthlyData = analytics.monthly_trend.map(t => ({ month: t.month.slice(5), amount: t.amount_minor / 100 }));
  const projectData = analytics.by_project.map(p => ({ name: p.name, value: p.value_minor / 100 }));

  return (
    <Stack gap={32}>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={16}>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)">Average Donation</Text>
            <IconCoin size={18} color="var(--bm-sage-dark)" />
          </Group>
          <Text className={classes.statValue}>{formatNZD(analytics.avg_donation_minor)}</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)">Repeat Donor Ratio</Text>
            <IconUsersGroup size={18} color="var(--bm-terracotta-dark)" />
          </Group>
          <Text className={classes.statValue}>{Math.round(analytics.repeat_donor_ratio * 100)}%</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)">Total Donors</Text>
            <IconUsers size={18} color="blue" />
          </Group>
          <Text className={classes.statValue}>{analytics.donor_count}</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)">Total Raised</Text>
            <IconTrendingUp size={18} color="green" />
          </Group>
          <Text className={classes.statValue}>{formatNZD(analytics.total_amount_minor)}</Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={24}>Monthly Donation Trend</Text>
          <Box h={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{fill: '#868e96', fontSize: 12}} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} formatter={(value: any) => [`$${value}`, 'Donated']} />
                <Bar dataKey="amount" fill="var(--bm-sage-dark)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={24}>Donations by Project</Text>
          <Box h={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {projectData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RechartsTooltip formatter={(val: any) => `$${val}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

// ===================== Donations Tab =====================
function DonationsTab({ charityId }: { charityId: number }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [items, setItems] = useState<CharityDonationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCharityDonations(charityId, page, pageSize)
      .then((res) => {
        if (!cancelled) { setItems(res.items); setTotal(res.total); setError(null); }
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [charityId, page]);

  const filtered = useMemo(() => {
    if (!filter) return items;
    return items.filter(d => d.donation_status === filter);
  }, [items, filter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className={classes.filterBar}>
        <Select
          placeholder="All Statuses"
          data={[
            { value: 'succeeded', label: '✅ Completed' },
            { value: 'pending', label: '⏳ Pending' },
            { value: 'refunded', label: '↩️ Refunded' },
          ]}
          value={filter}
          onChange={setFilter}
          clearable radius="md" w={180}
        />
        <Box style={{ flex: 1 }} />
        <Button variant="light" color="sage" radius="xl" leftSection={<IconDownload size={16} />}>
          Export CSV
        </Button>
      </div>

      {loading && <Box ta="center" py={40}><Loader size="md" color="sage" /></Box>}
      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md" mb={16}>{error}</Alert>}

      {!loading && !error && (
        <>
          <Text size="xs" c="var(--bm-text-muted)" mb={12}>
            {total} donation{total !== 1 ? 's' : ''}
          </Text>

          <Card padding="lg" radius="lg" withBorder>
            <div className={classes.tableWrapper}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Donor</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Net Amount</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map(d => (
                    <Table.Tr key={d.id}>
                      <Table.Td><Text size="sm" fw={500}>{d.donor_name}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{formatNZD(d.donation_amount_minor)}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="var(--bm-sage-dark)" fw={600}>{formatNZD(d.charity_net_amount_minor)}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed">{d.paid_at ? formatDate(d.paid_at) : '—'}</Text></Table.Td>
                      <Table.Td>
                        <Badge color={statusColor(d.donation_status)} variant="light" size="sm">
                          {statusLabel(d.donation_status)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filtered.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Text c="var(--bm-text-muted)">No donations found.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>
          </Card>

          {totalPages > 1 && (
            <Group justify="center" mt={20}>
              <Pagination total={totalPages} value={page} onChange={setPage} color="sage" radius="md" />
            </Group>
          )}
        </>
      )}
    </>
  );
}

// ===================== Projects Tab =====================
function ProjectsTab({ charityId }: { charityId: number }) {
  const [projects, setProjects] = useState<CharityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, setCreateOpened] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newCurrency, setNewCurrency] = useState<string | null>('NZD');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editImages, setEditImages] = useState<UploadedImage[]>([]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const loadProjects = useCallback(() => {
    setLoading(true);
    getCharityProjects(charityId)
      .then((res) => setProjects(res.items))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [charityId]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const openDetails = (id: number) => { setSelectedProjectId(id); setEditMode(false); };
  const openEdit = (id: number) => {
    const p = projects.find(x => x.id === id);
    if (p) {
      setEditTitle(p.title); setEditDesc(p.description); setEditGoal(String(p.goal_amount_minor));
      // Load existing images from backend into the multi-image editor
      const existingImages: UploadedImage[] = (p.images ?? []).map((img, i) => ({
        file: null,
        previewUrl: img.url,
        name: `Image ${i + 1}`,
        size: 0,
        isPrimary: img.isPrimary,
        remoteUrl: img.url,
      }));
      setEditImages(existingImages);
    }
    setSelectedProjectId(id); setEditMode(true);
  };
  const closePanel = () => { setSelectedProjectId(null); setEditMode(false); };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const result = await createCharityProject(charityId, {
        title: newTitle,
        description: newDesc,
        goal_amount_minor: Number(newGoal) || 1000000,
        currency_code: (newCurrency as 'NZD' | 'AUD' | 'USD') || 'NZD',
        start_date: newStartDate || new Date().toISOString().split('T')[0],
        end_date: newEndDate || '2027-12-31',
      });

      // Upload images if any were added
      const newFiles = newImages.filter(img => img.file !== null);
      if (newFiles.length > 0) {
        const primaryIdx = newImages.findIndex(img => img.isPrimary);
        const projectId = (result as unknown as { projectId?: number }).projectId;
        if (projectId) {
          try {
            await uploadProjectImages(
              charityId,
              projectId,
              newFiles.map(img => img.file!),
              Math.max(primaryIdx, 0),
            );
          } catch (uploadErr) {
            console.warn('Image upload not yet supported by backend:', uploadErr);
          }
        }
      }

      setNewTitle(''); setNewDesc(''); setNewGoal(''); setNewStartDate(''); setNewEndDate('');
      setNewImages([]);
      setCreateOpened(false);
      loadProjects();
    } catch {
      // error handling — keep modal open
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProjectId) return;
    setSaving(true);
    try {
      await updateCharityProject(charityId, selectedProjectId, {
        title: editTitle,
        description: editDesc,
        goal_amount_minor: Number(editGoal) || undefined,
      });

      // Upload new images if any
      const newFiles = editImages.filter(img => img.file !== null);
      if (newFiles.length > 0) {
        const primaryIdx = editImages.findIndex(img => img.isPrimary);
        try {
          await uploadProjectImages(
            charityId,
            selectedProjectId,
            newFiles.map(img => img.file!),
            Math.max(primaryIdx, 0),
          );
        } catch (uploadErr) {
          console.warn('Image upload not yet supported by backend:', uploadErr);
        }
      }

      setEditMode(false);
      loadProjects();
    } catch {
      // error handling
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCharityProject(charityId, id);
      if (selectedProjectId === id) closePanel();
      setDeleteConfirmId(null);
      loadProjects();
    } catch {
      // error handling
    }
  };

  if (loading) return <Box ta="center" py={60}><Loader size="lg" color="sage" /></Box>;

  return (
    <>
      <Group justify="space-between" mb={24}>
        <Box>
          <Text fw={700} size="md" c="var(--bm-text-dark)">Your Projects</Text>
          <Text size="sm" c="var(--bm-text-muted)">
            {projects.filter(p => p.project_status === 'active').length} active · {projects.filter(p => p.project_status === 'completed').length} completed
          </Text>
        </Box>
        <Button color="terracotta" radius="xl" leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>
          New Project
        </Button>
      </Group>

      <Flex gap="xl" align="flex-start" direction={{ base: 'column', lg: 'row' }}>
        <Box style={{ flex: selectedProject ? '0 0 40%' : '1 1 100%', transition: 'all 0.2s ease', width: '100%' }}>
          <SimpleGrid cols={selectedProject ? 1 : { base: 1, md: 2 }} spacing={16}>
            {projects.map(p => {
              const progress = p.goal_amount_minor > 0 ? Math.round((p.current_amount_minor / p.goal_amount_minor) * 100) : 0;
              const isSelected = selectedProjectId === p.id;
              return (
                <Card key={p.id} padding="lg" radius="lg" withBorder className={classes.projectCard}
                  style={{ borderColor: isSelected ? 'var(--bm-sage-dark)' : undefined, boxShadow: isSelected ? '0 0 0 1px var(--bm-sage-dark)' : undefined }}>
                  <Group justify="space-between" mb={12}>
                    <Badge color={projectStatusColor(p.project_status)} variant="light" size="sm" tt="capitalize">
                      {p.project_status}
                    </Badge>
                    <Group gap={4}>
                      <Tooltip label="View details"><ActionIcon variant={isSelected && !editMode ? 'filled' : 'light'} color="sage" radius="md" size="sm" onClick={() => openDetails(p.id)}><IconEye size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Edit project"><ActionIcon variant={isSelected && editMode ? 'filled' : 'light'} color="blue" radius="md" size="sm" onClick={() => openEdit(p.id)}><IconEdit size={14} /></ActionIcon></Tooltip>
                      <Tooltip label="Delete"><ActionIcon variant="light" color="red" radius="md" size="sm" onClick={() => setDeleteConfirmId(p.id)}><IconTrash size={14} /></ActionIcon></Tooltip>
                    </Group>
                  </Group>
                  <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>{p.title}</Text>
                  <Text size="xs" c="var(--bm-text-muted)" mb={16} lineClamp={2}>{p.description}</Text>
                  <Progress value={progress} color={p.project_status === 'completed' ? 'blue' : 'terracotta'} size="sm" radius="xl" mb={8} />
                  <Group justify="space-between">
                    <Text size="xs" c="var(--bm-text-muted)">{formatNZD(p.current_amount_minor)} / {formatNZD(p.goal_amount_minor)} ({progress}%)</Text>
                    <Text size="xs" c="var(--bm-text-muted)">{p.currency_code}</Text>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </Box>

        {selectedProject && (
          <Card padding="xl" radius="lg" withBorder style={{ flex: '1 1 0', width: '100%', position: 'sticky', top: 20 }}>
            <Group justify="space-between" mb={24}>
              <Title order={3} style={{ fontFamily: 'var(--bm-font-heading)', color: 'var(--bm-text-dark)' }}>
                {editMode ? 'Edit Project' : 'Project Details'}
              </Title>
              <Group gap={8}>
                {!editMode && <Button variant="light" size="xs" color="blue" leftSection={<IconEdit size={14} />} onClick={() => openEdit(selectedProject.id)}>Edit</Button>}
                {editMode && <Button variant="light" size="xs" color="sage" leftSection={<IconEye size={14} />} onClick={() => setEditMode(false)}>View</Button>}
                <ActionIcon variant="subtle" color="gray" onClick={closePanel}><IconX size={20} /></ActionIcon>
              </Group>
            </Group>
            {editMode ? (
              <Stack gap={16}>
                <TextInput label="Project Name" value={editTitle} onChange={e => setEditTitle(e.currentTarget.value)} radius="md" />
                <Textarea label="Description" value={editDesc} onChange={e => setEditDesc(e.currentTarget.value)} radius="md" autosize minRows={4} />
                <TextInput label="Goal (minor units)" value={editGoal} onChange={e => setEditGoal(e.currentTarget.value)} radius="md" type="number" />
                <Box>
                  <MultiImageUpload
                    value={editImages}
                    onChange={setEditImages}
                    maxImages={10}
                    maxSizeMB={2}
                    label="Project Images"
                    hint="Upload up to 10 images. The primary image will be shown on the project card and search results."
                  />
                </Box>
                <Divider />
                <Group>
                  <Button color="blue" radius="md" style={{ flex: 1 }} leftSection={<IconDeviceFloppy size={16} />} onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
                  <Button variant="light" color="red" radius="md" leftSection={<IconTrash size={14} />} onClick={() => setDeleteConfirmId(selectedProject.id)}>Delete</Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap={20}>
                {/* Show primary image if available */}
                {selectedProject.cover_image_url && (
                  <Box style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProject.cover_image_url} alt={selectedProject.title} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                  </Box>
                )}
                {/* Show image gallery thumbnails if available */}
                {selectedProject.images && selectedProject.images.length > 0 && !selectedProject.cover_image_url && (
                  <Box style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProject.images.find(i => i.isPrimary)?.url ?? selectedProject.images[0].url} alt={selectedProject.title} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                  </Box>
                )}
                <Group gap={8}>
                  <Text size="sm" fw={600} c="var(--bm-text-muted)">Status:</Text>
                  <Badge color={projectStatusColor(selectedProject.project_status)} variant="light" size="sm" tt="capitalize">{selectedProject.project_status}</Badge>
                </Group>
                <Box><Text size="sm" fw={600} c="var(--bm-text-muted)" mb={4}>Description</Text><Text size="sm" c="var(--bm-text-dark)" lh={1.6}>{selectedProject.description}</Text></Box>
                <SimpleGrid cols={2} spacing={16}>
                  <Card padding="md" radius="md" bg="var(--mantine-color-gray-0)"><Text size="xs" c="var(--bm-text-muted)" mb={4}>Total Raised</Text><Text size="lg" fw={700} c="var(--bm-sage-dark)">{formatNZD(selectedProject.current_amount_minor)}</Text></Card>
                  <Card padding="md" radius="md" bg="var(--mantine-color-gray-0)"><Text size="xs" c="var(--bm-text-muted)" mb={4}>Goal Amount</Text><Text size="lg" fw={700} c="var(--bm-text-dark)">{formatNZD(selectedProject.goal_amount_minor)}</Text></Card>
                  <Card padding="md" radius="md" bg="var(--mantine-color-gray-0)"><Text size="xs" c="var(--bm-text-muted)" mb={4}>Start Date</Text><Text size="lg" fw={700} c="var(--bm-text-dark)">{selectedProject.start_date}</Text></Card>
                  <Card padding="md" radius="md" bg="var(--mantine-color-gray-0)"><Text size="xs" c="var(--bm-text-muted)" mb={4}>End Date</Text><Text size="lg" fw={700} c="var(--bm-text-dark)">{selectedProject.end_date}</Text></Card>
                </SimpleGrid>
              </Stack>
            )}
          </Card>
        )}
      </Flex>

      {/* Create Project Modal */}
      <Modal opened={createOpened} onClose={() => setCreateOpened(false)} size="lg" radius="lg" title={
        <Group gap={8}><IconPlus size={18} color="var(--bm-sage-dark)" /><Text fw={700}>Create New Project</Text></Group>
      }>
        <Stack gap={16}>
          <TextInput label="Project Name" placeholder="e.g. Emergency Housing Fund" radius="md" value={newTitle} onChange={e => setNewTitle(e.currentTarget.value)} />
          <Box>
            <MultiImageUpload
              value={newImages}
              onChange={setNewImages}
              maxImages={10}
              maxSizeMB={2}
              label="Project Images"
              hint="Upload up to 10 images. The first image (★ Primary) will be shown on the project card and search results."
            />
          </Box>
          <Textarea label="Description" placeholder="Describe your project's goals and impact..." radius="md" autosize minRows={3} value={newDesc} onChange={e => setNewDesc(e.currentTarget.value)} />
          <SimpleGrid cols={2} spacing={12}>
            <TextInput label="Fundraising Goal (minor units)" placeholder="5000000" radius="md" type="number" value={newGoal} onChange={e => setNewGoal(e.currentTarget.value)} />
            <Select label="Currency" placeholder="Select currency" radius="md" data={['NZD', 'AUD', 'USD']} value={newCurrency} onChange={setNewCurrency} />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing={12}>
            <TextInput label="Start Date" type="date" radius="md" value={newStartDate} onChange={e => setNewStartDate(e.currentTarget.value)} />
            <TextInput label="End Date" type="date" radius="md" value={newEndDate} onChange={e => setNewEndDate(e.currentTarget.value)} />
          </SimpleGrid>
          <Divider />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setCreateOpened(false)}>Cancel</Button>
            <Button color="terracotta" radius="xl" leftSection={<IconCheck size={16} />} onClick={handleCreate} disabled={!newTitle.trim()} loading={saving}>
              Create Project
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} size="sm" radius="lg" title={
        <Group gap={8}><IconTrash size={18} color="var(--mantine-color-red-6)" /><Text fw={700}>Delete Project</Text></Group>
      }>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>
          Are you sure you want to delete <strong>{projects.find(p => p.id === deleteConfirmId)?.title}</strong>? This will deactivate the project.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button color="red" radius="xl" leftSection={<IconTrash size={14} />} onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}

// ===================== Profile Tab =====================
function ProfileTab({ charityId }: { charityId: number }) {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image uploads
  const [logo, setLogo] = useState<UploadedFile | null>(null);
  const [banner, setBanner] = useState<UploadedFile | null>(null);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Save text profile fields
      const updates: CharityProfileUpdate = {};
      if (displayName) updates.display_name = displayName;
      if (description) updates.description = description;
      if (websiteUrl) updates.website_url = websiteUrl;
      await updateCharityProfile(charityId, updates);

      // 2. Upload logo if changed
      if (logo?.file) {
        try {
          await uploadCharityLogo(charityId, logo.file);
        } catch (uploadErr) {
          console.warn('Logo upload not yet supported by backend:', uploadErr);
        }
      }

      // 3. Upload banner if changed
      if (banner?.file) {
        try {
          await uploadCharityBanner(charityId, banner.file);
        } catch (uploadErr) {
          console.warn('Banner upload not yet supported by backend:', uploadErr);
        }
      }

      // 4. Upload gallery images (new files only)
      const newGalleryFiles = galleryImages.filter(img => img.file !== null);
      if (newGalleryFiles.length > 0) {
        const primaryIdx = galleryImages.findIndex(img => img.isPrimary);
        try {
          await uploadCharityImages(
            charityId,
            newGalleryFiles.map(img => img.file!),
            Math.max(primaryIdx, 0),
          );
        } catch (uploadErr) {
          console.warn('Gallery upload not yet supported by backend:', uploadErr);
        }
      }

      // 5. Upload new documents
      const newDocs = documents.filter(doc => doc.file);
      for (const doc of newDocs) {
        try {
          await uploadCharityDocument(charityId, doc.file, 'other', doc.name);
        } catch (uploadErr) {
          console.warn('Document upload not yet supported by backend:', uploadErr);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={24}>
      {/* Visual Identity Section */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Visual Identity</Text>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>Upload your organisation's logo and banner image. These will be displayed on your public charity page.</Text>

        <Flex gap={24} align="flex-start" direction={{ base: 'column', sm: 'row' }}>
          {/* Logo (Avatar variant) */}
          <Box>
            <Text size="sm" fw={500} mb={8} c="var(--bm-text-dark)">Logo</Text>
            <ImageUpload
              variant="avatar"
              value={logo}
              onChange={setLogo}
              placeholder="Logo"
              maxSizeMB={2}
            />
            <Text size="xs" c="var(--bm-text-muted)" ta="center" mt={6}>Square, min 200×200px</Text>
          </Box>

          {/* Banner (Banner variant) */}
          <Box style={{ flex: 1, width: '100%' }}>
            <Text size="sm" fw={500} mb={8} c="var(--bm-text-dark)">Banner Image</Text>
            <ImageUpload
              variant="banner"
              value={banner}
              onChange={setBanner}
              placeholder="Drop your banner image here"
              hint="Recommended: 1200×400px. This appears at the top of your charity page."
              maxSizeMB={2}
            />
          </Box>
        </Flex>
      </Card>

      {/* Organisation Info Section */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>Organisation Information</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          <TextInput label="Display Name" value={displayName} onChange={e => setDisplayName(e.currentTarget.value)} radius="md" placeholder="Enter display name" />
          <TextInput label="Website" value={websiteUrl} onChange={e => setWebsiteUrl(e.currentTarget.value)} radius="md" leftSection={<IconWorld size={14} />} placeholder="https://..." />
        </SimpleGrid>
        <Textarea label="Description" value={description} onChange={e => setDescription(e.currentTarget.value)} radius="md" mt={16} autosize minRows={3} placeholder="Tell donors about your organisation..." />
      </Card>

      {/* Gallery Images Section */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Gallery Images</Text>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>Upload photos showcasing your organisation. The primary image (★) will be shown on your public page and in search results.</Text>
        <MultiImageUpload
          value={galleryImages}
          onChange={setGalleryImages}
          maxImages={10}
          maxSizeMB={2}
        />
      </Card>

      {/* Documents & Reports Section */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Documents & Reports</Text>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>Upload annual reports, financial statements, or impact reports to increase donor trust and transparency.</Text>
        <DocumentUpload
          value={documents}
          onChange={setDocuments}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          maxSizeMB={10}
          maxFiles={5}
          label="Activity & Impact Reports"
        />
      </Card>

      {error && (
        <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md">{error}</Alert>
      )}

      <Group justify="flex-end">
        <Button color="sage" radius="xl"
          leftSection={saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
          onClick={handleSave}
          loading={saving}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}

// ===================== Donor Updates Tab =====================
const TEMPLATE_STORAGE_KEY = 'dg-thankyou-templates';

interface ThankYouTemplate {
  id: string;
  title: string;
  body: string;
  active: boolean;
  createdAt: string;
}

const DEFAULT_TEMPLATES: ThankYouTemplate[] = [
  {
    id: 'default-1',
    title: 'Thank You for Your Generosity',
    body: 'Dear {donor_name},\n\nThank you so much for your generous donation of {amount} to {charity_name}. Your support makes a real difference in our community and helps us continue our mission.\n\nWith heartfelt gratitude,\n{charity_name}',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function loadTemplates(): ThankYouTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveTemplates(templates: ThankYouTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch { /* ignore */ }
}

// ── Email Settings (localStorage, backend 연동 시 API로 전환) ──
const EMAIL_SETTINGS_KEY = 'dg-email-settings';

interface EmailSettings {
  autoSendThankYou: boolean;
  attachReceipt: boolean;
  replyToEmail: string;
}

const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  autoSendThankYou: true,
  attachReceipt: true,
  replyToEmail: '',
};

function loadEmailSettings(): EmailSettings {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_SETTINGS;
  try {
    const raw = localStorage.getItem(EMAIL_SETTINGS_KEY);
    return raw ? { ...DEFAULT_EMAIL_SETTINGS, ...JSON.parse(raw) } : DEFAULT_EMAIL_SETTINGS;
  } catch { return DEFAULT_EMAIL_SETTINGS; }
}

function saveEmailSettings(settings: EmailSettings): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

function DonorUpdatesTab() {
  const [templates, setTemplates] = useState<ThankYouTemplate[]>(() => loadTemplates());
  const [createOpened, setCreateOpened] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => loadEmailSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => { saveTemplates(templates); }, [templates]);
  useEffect(() => { saveEmailSettings(emailSettings); }, [emailSettings]);

  const handleCreate = () => {
    if (!formTitle.trim() || !formBody.trim()) return;
    setTemplates(prev => [...prev, {
      id: `tmpl-${Date.now()}`,
      title: formTitle,
      body: formBody,
      active: false,
      createdAt: new Date().toISOString(),
    }]);
    setFormTitle(''); setFormBody('');
    setCreateOpened(false);
  };

  const handleEdit = () => {
    if (!editId || !formTitle.trim() || !formBody.trim()) return;
    setTemplates(prev => prev.map(t =>
      t.id === editId ? { ...t, title: formTitle, body: formBody } : t
    ));
    setEditId(null); setFormTitle(''); setFormBody('');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setTemplates(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
  };

  const toggleActive = (id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, active: !t.active } : t
    ));
  };

  const openEdit = (template: ThankYouTemplate) => {
    setFormTitle(template.title);
    setFormBody(template.body);
    setEditId(template.id);
  };

  const openCreate = () => {
    setFormTitle('');
    setFormBody('');
    setCreateOpened(true);
  };

  const previewTemplate = templates.find(t => t.id === previewId);
  const previewBody = previewTemplate?.body
    .replace(/\{donor_name\}/g, 'Sarah Johnson')
    .replace(/\{amount\}/g, '$50.00')
    .replace(/\{project_name\}/g, 'Restore Native Forest')
    .replace(/\{charity_name\}/g, 'Forest & Bird NZ')
    .replace(/\{date\}/g, new Date().toLocaleDateString('en-NZ'));

  const placeholders = [
    { tag: '{donor_name}', desc: "Donor's name" },
    { tag: '{amount}', desc: 'Donation amount' },
    { tag: '{project_name}', desc: 'Project name' },
    { tag: '{charity_name}', desc: 'Your charity' },
    { tag: '{date}', desc: 'Donation date' },
  ];

  return (
    <Stack gap={24}>
      {/* ── Email Sending Settings ── */}
      <Card padding="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, rgba(46,125,107,0.04) 0%, rgba(216,169,95,0.04) 100%)' }}>
        <Group gap={10} mb={16}>
          <ThemeIcon size={32} radius="md" color="sage" variant="light">
            <IconSettings size={16} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="var(--bm-text-dark)">Email Sending Settings</Text>
            <Text size="xs" c="var(--bm-text-muted)">Configure how thank-you emails are sent to your donors</Text>
          </Box>
        </Group>

        <Stack gap={0}>
          {/* Auto-send toggle */}
          <Group justify="space-between" py={12}>
            <Box style={{ flex: 1 }}>
              <Group gap={6}>
                <IconSend size={14} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} c="var(--bm-text-dark)">Auto Thank-You Email</Text>
              </Group>
              <Text size="xs" c="var(--bm-text-muted)">
                Automatically send a personalised thank-you email after every donation
              </Text>
            </Box>
            <Switch
              checked={emailSettings.autoSendThankYou}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, autoSendThankYou: e.currentTarget.checked }))}
              color="sage"
              label={emailSettings.autoSendThankYou ? 'On' : 'Off'}
              styles={{ label: { fontSize: '12px', color: 'var(--bm-text-muted)' } }}
            />
          </Group>

          <Divider />

          {/* Attach receipt toggle */}
          <Group justify="space-between" py={12}>
            <Box style={{ flex: 1 }}>
              <Group gap={6}>
                <IconReceipt size={14} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} c="var(--bm-text-dark)">Attach Receipt PDF</Text>
              </Group>
              <Text size="xs" c="var(--bm-text-muted)">
                Include the official NZ donation receipt as a PDF attachment in the email
              </Text>
            </Box>
            <Switch
              checked={emailSettings.attachReceipt}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, attachReceipt: e.currentTarget.checked }))}
              color="sage"
              disabled={!emailSettings.autoSendThankYou}
              label={emailSettings.attachReceipt ? 'On' : 'Off'}
              styles={{ label: { fontSize: '12px', color: 'var(--bm-text-muted)' } }}
            />
          </Group>

          <Divider />

          {/* Reply-to email */}
          <Box py={12}>
            <Group gap={6} mb={4}>
              <IconMail size={14} color="var(--bm-sage-dark)" />
              <Text size="sm" fw={600} c="var(--bm-text-dark)">Reply-To Email</Text>
            </Group>
            <Text size="xs" c="var(--bm-text-muted)" mb={8}>
              Donors can reply to thank-you emails at this address. Leave blank to use the default no-reply.
            </Text>
            <TextInput
              placeholder="e.g. hello@yourcharity.org.nz"
              radius="md"
              size="sm"
              value={emailSettings.replyToEmail}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, replyToEmail: e.currentTarget.value }))}
              disabled={!emailSettings.autoSendThankYou}
              styles={{ input: { maxWidth: 360 } }}
            />
          </Box>
        </Stack>

        <Group justify="flex-end" mt={8}>
          <Badge size="xs" variant="light" color="sage">
            {settingsSaved ? '✓ Saved' : 'Auto-saved locally'}
          </Badge>
        </Group>
      </Card>

      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text fw={700} size="md" c="var(--bm-text-dark)">Auto Thank-You Messages</Text>
          <Text size="sm" c="var(--bm-text-muted)">
            Create message templates that are automatically sent to donors after a donation.
          </Text>
        </Box>
        <Button color="terracotta" radius="xl" leftSection={<IconPlus size={16} />} onClick={openCreate}>
          New Template
        </Button>
      </Group>

      {/* Templates list */}
      {templates.length === 0 ? (
        <Card padding="xl" radius="lg" withBorder>
          <Box ta="center" py={40}>
            <IconMail size={48} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
            <Text size="md" c="var(--bm-text-dark)" fw={600} mt={16}>No templates yet</Text>
            <Text size="sm" c="var(--bm-text-muted)" mt={4}>Create your first thank-you message template.</Text>
            <Button color="terracotta" radius="xl" mt={20} leftSection={<IconPlus size={16} />} onClick={openCreate}>
              Create Template
            </Button>
          </Box>
        </Card>
      ) : (
        <Stack gap={16}>
          {templates.map(template => (
            <Card key={template.id} padding="lg" radius="lg" withBorder>
              <Group justify="space-between" mb={12}>
                <Group gap={8}>
                  <Badge size="sm" variant="light" color={template.active ? 'green' : 'gray'}>
                    {template.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Text size="sm" fw={700} c="var(--bm-text-dark)">{template.title}</Text>
                </Group>
                <Switch
                  checked={template.active}
                  onChange={() => toggleActive(template.id)}
                  color="sage"
                  size="sm"
                  label={template.active ? 'On' : 'Off'}
                  styles={{ label: { fontSize: '12px', color: 'var(--bm-text-muted)' } }}
                />
              </Group>
              <Text size="xs" c="var(--bm-text-muted)" lineClamp={2} lh={1.6} mb={12} style={{ whiteSpace: 'pre-line' }}>
                {template.body}
              </Text>
              <Group gap={8}>
                <Button variant="light" color="sage" size="xs" radius="md" leftSection={<IconEye size={14} />} onClick={() => setPreviewId(template.id)}>
                  Preview
                </Button>
                <Button variant="light" color="blue" size="xs" radius="md" leftSection={<IconEdit size={14} />} onClick={() => openEdit(template)}>
                  Edit
                </Button>
                <Button variant="light" color="red" size="xs" radius="md" leftSection={<IconTrash size={14} />} onClick={() => setDeleteId(template.id)}>
                  Delete
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* Placeholders guide */}
      <Card padding="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, rgba(142,184,151,0.04) 0%, rgba(255,255,255,1) 100%)' }}>
        <Group gap={8} mb={12}>
          <IconInfoCircle size={16} color="var(--bm-sage-dark)" />
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Available Placeholders</Text>
        </Group>
        <Text size="xs" c="var(--bm-text-muted)" mb={12}>
          Use these in your templates — they&apos;ll be replaced with real data when the message is sent.
        </Text>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing={8}>
          {placeholders.map(p => (
            <Group key={p.tag} gap={8}>
              <Badge size="sm" variant="outline" color="sage" style={{ fontFamily: 'monospace' }}>{p.tag}</Badge>
              <Text size="xs" c="var(--bm-text-muted)">{p.desc}</Text>
            </Group>
          ))}
        </SimpleGrid>
      </Card>

      {/* Create Modal */}
      <Modal opened={createOpened} onClose={() => setCreateOpened(false)} size="lg" radius="lg" title={
        <Group gap={8}><IconPlus size={18} color="var(--bm-sage-dark)" /><Text fw={700}>New Thank-You Template</Text></Group>
      }>
        <Stack gap={16}>
          <TextInput label="Template Title" placeholder="e.g. Thank You for Your Generosity" radius="md" value={formTitle} onChange={e => setFormTitle(e.currentTarget.value)} />
          <Textarea label="Message Body" placeholder={'Dear {donor_name},\n\nThank you for your donation of {amount}...'} radius="md" autosize minRows={6} value={formBody} onChange={e => setFormBody(e.currentTarget.value)} />
          <Alert icon={<IconInfoCircle size={14} />} color="sage" variant="light" radius="md">
            <Text size="xs">Use placeholders like <strong>{'{donor_name}'}</strong>, <strong>{'{amount}'}</strong>, <strong>{'{project_name}'}</strong> to personalise each message.</Text>
          </Alert>
          <Divider />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setCreateOpened(false)}>Cancel</Button>
            <Button color="terracotta" radius="xl" leftSection={<IconCheck size={16} />} onClick={handleCreate} disabled={!formTitle.trim() || !formBody.trim()}>
              Create Template
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Modal */}
      <Modal opened={!!editId} onClose={() => setEditId(null)} size="lg" radius="lg" title={
        <Group gap={8}><IconEdit size={18} color="blue" /><Text fw={700}>Edit Template</Text></Group>
      }>
        <Stack gap={16}>
          <TextInput label="Template Title" radius="md" value={formTitle} onChange={e => setFormTitle(e.currentTarget.value)} />
          <Textarea label="Message Body" radius="md" autosize minRows={6} value={formBody} onChange={e => setFormBody(e.currentTarget.value)} />
          <Divider />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setEditId(null)}>Cancel</Button>
            <Button color="blue" radius="xl" leftSection={<IconDeviceFloppy size={16} />} onClick={handleEdit} disabled={!formTitle.trim() || !formBody.trim()}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal opened={!!previewId} onClose={() => setPreviewId(null)} size="md" radius="lg" title={
        <Group gap={8}><IconEye size={18} color="var(--bm-sage-dark)" /><Text fw={700}>Message Preview</Text></Group>
      }>
        <Stack gap={16}>
          <Alert icon={<IconInfoCircle size={14} />} color="sage" variant="light" radius="md">
            <Text size="xs">This is how the message will look with sample data filled in.</Text>
          </Alert>
          <Card padding="lg" radius="md" withBorder>
            <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={8}>{previewTemplate?.title}</Text>
            <Divider mb={12} />
            <Text size="sm" c="var(--bm-text-dark)" lh={1.8} style={{ whiteSpace: 'pre-line' }}>
              {previewBody}
            </Text>
          </Card>
          <Button variant="light" color="sage" radius="xl" fullWidth onClick={() => setPreviewId(null)}>Close Preview</Button>
        </Stack>
      </Modal>

      {/* Delete Confirmation */}
      <Modal opened={!!deleteId} onClose={() => setDeleteId(null)} size="sm" radius="lg" title={
        <Group gap={8}><IconTrash size={18} color="var(--mantine-color-red-6)" /><Text fw={700}>Delete Template</Text></Group>
      }>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>
          Are you sure you want to delete this template? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="red" radius="xl" leftSection={<IconTrash size={14} />} onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}

// ===================== Premium 잠금 패널 (무료 플랜 데모) =====================
function PlanLockedPanel({ feature }: { feature: string }) {
  return (
    <Card withBorder radius="lg" padding={48} mt={20} style={{ textAlign: 'center' }}>
      <ThemeIcon size={56} radius="xl" color="gray" variant="light" mx="auto" mb={16}>
        <IconLock size={28} />
      </ThemeIcon>
      <Title order={4} mb={8}>{feature} is a Premium feature</Title>
      <Text size="sm" c="dimmed" maw={440} mx="auto" mb={20} lh={1.7}>
        Upgrade to Premium to unlock {feature.toLowerCase()}, donor segments with
        scheduled follow-up emails, custom donation tiers with photos, and 3 team seats.
      </Text>
      <Button
        component={Link}
        href="/charity/apply"
        color="terracotta"
        radius="xl"
        leftSection={<IconSparkles size={16} />}
      >
        Try Premium free for 30 days
      </Button>
      <Text size="xs" c="dimmed" mt={12}>
        NZ$119–129/month (GST incl.) + 2.0% per donation · cancel anytime
      </Text>
    </Card>
  );
}

// ===================== Main Dashboard =====================
function CharityDashboardContent() {
  const { displayName, serviceUser, userRole, demoRole } = useAuth();

  // Determine charityId — from serviceUser or demo fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charityId = (serviceUser as any)?.charity_id as number ?? DEMO_CHARITY_ID;

  const isCharityRole = userRole === 'charity_admin' || demoRole === 'charity' || demoRole === 'charity_paid';

  // 데모에서만 플랜 구분 — 실제 유저는 백엔드 plan 필드 연동 전까지 전체 기능 유지
  const plan = demoCharityPlan(demoRole) ?? 'paid';
  const isFreePlan = plan === 'free';
  const lockIcon = <IconLock size={12} />;

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="lg">
          {/* Greeting */}
          <Group gap={16} mb={32}>
            <Avatar size={56} radius="xl" color="terracotta">
              {displayName.charAt(0)}
            </Avatar>
            <Box>
              <Title order={2} className={classes.greeting}>
                {displayName}
              </Title>
              <Group gap={8} mt={4}>
                <Badge size="sm" variant="light" className={classes.orgBadge}
                  leftSection={<IconShieldCheck size={10} />}
                >
                  Charity Admin
                </Badge>
                {demoCharityPlan(demoRole) && (
                  <Badge
                    size="sm"
                    variant={isFreePlan ? 'light' : 'filled'}
                    color={isFreePlan ? 'gray' : 'terracotta'}
                    leftSection={isFreePlan ? undefined : <IconSparkles size={10} />}
                  >
                    {isFreePlan ? 'Free Plan' : 'Premium Plan'}
                  </Badge>
                )}
                {!isCharityRole && (
                  <Badge size="sm" variant="light" color="orange">Demo Mode</Badge>
                )}
              </Group>
            </Box>
          </Group>

          {/* Tab Navigation */}
          <Tabs defaultValue="overview" color="terracotta" radius="md">
            <Tabs.List className={classes.tabList}>
              <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>Overview</Tabs.Tab>
              <Tabs.Tab value="donations" leftSection={<IconCoin size={16} />}>Donations</Tabs.Tab>
              <Tabs.Tab
                value="analytics"
                leftSection={<IconTrendingUp size={16} />}
                rightSection={isFreePlan ? lockIcon : undefined}
              >
                Analytics
              </Tabs.Tab>
              <Tabs.Tab value="projects" leftSection={<IconClipboardList size={16} />}>Projects</Tabs.Tab>
              <Tabs.Tab
                value="updates"
                leftSection={<IconMail size={16} />}
                rightSection={isFreePlan ? lockIcon : undefined}
              >
                Donor Updates
              </Tabs.Tab>
              <Tabs.Tab value="profile" leftSection={<IconSettings size={16} />}>Profile</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview"><OverviewTab charityId={charityId} /></Tabs.Panel>
            <Tabs.Panel value="donations"><DonationsTab charityId={charityId} /></Tabs.Panel>
            <Tabs.Panel value="analytics">
              {isFreePlan ? <PlanLockedPanel feature="Analytics & Reporting" /> : <AnalyticsTab />}
            </Tabs.Panel>
            <Tabs.Panel value="projects"><ProjectsTab charityId={charityId} /></Tabs.Panel>
            <Tabs.Panel value="updates">
              {isFreePlan ? <PlanLockedPanel feature="Donor Updates" /> : <DonorUpdatesTab />}
            </Tabs.Panel>
            <Tabs.Panel value="profile"><ProfileTab charityId={charityId} /></Tabs.Panel>
          </Tabs>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default function CharityDashboardPage() {
  return (
    <ProtectedRoute>
      <CharityDashboardContent />
    </ProtectedRoute>
  );
}
