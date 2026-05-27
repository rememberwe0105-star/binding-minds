'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  TextInput, Textarea, Select, Alert, Stack, Divider,
  Avatar, Tooltip, Progress, ActionIcon, Flex, Loader, Pagination,
} from '@mantine/core';
import {
  IconChartBar, IconCoin,
  IconCalendar, IconPlus, IconEdit, IconEye,
  IconBrandStripe, IconShieldCheck, IconAlertCircle,
  IconUsers, IconDownload,
  IconClipboardList, IconSettings,
  IconCheck, IconDeviceFloppy, IconWorld, IconMail,
  IconPhone, IconMapPin, IconTrendingUp,
  IconUsersGroup, IconX, IconTrash, IconMoodEmpty,
} from '@tabler/icons-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
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

// ===================== Main Dashboard =====================
function CharityDashboardContent() {
  const { displayName, serviceUser, userRole, demoRole } = useAuth();

  // Determine charityId — from serviceUser or demo fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charityId = (serviceUser as any)?.charity_id as number ?? DEMO_CHARITY_ID;

  const isCharityRole = userRole === 'charity_admin' || demoRole === 'charity';

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
              <Tabs.Tab value="analytics" leftSection={<IconTrendingUp size={16} />}>Analytics</Tabs.Tab>
              <Tabs.Tab value="projects" leftSection={<IconClipboardList size={16} />}>Projects</Tabs.Tab>
              <Tabs.Tab value="profile" leftSection={<IconSettings size={16} />}>Profile</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview"><OverviewTab charityId={charityId} /></Tabs.Panel>
            <Tabs.Panel value="donations"><DonationsTab charityId={charityId} /></Tabs.Panel>
            <Tabs.Panel value="analytics"><AnalyticsTab /></Tabs.Panel>
            <Tabs.Panel value="projects"><ProjectsTab charityId={charityId} /></Tabs.Panel>
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
