'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  TextInput, Textarea, Select, Alert, Stack, Divider,
  Avatar, Tooltip, Progress, ActionIcon,
} from '@mantine/core';
import {
  IconBuilding, IconChartBar, IconCoin, IconHeart,
  IconCalendar, IconPlus, IconEdit, IconEye,
  IconBrandStripe, IconShieldCheck, IconAlertCircle,
  IconUsers, IconArrowRight, IconDownload,
  IconClipboardList, IconSettings, IconMoodEmpty,
  IconCheck, IconDeviceFloppy, IconWorld, IconMail,
  IconPhone, IconMapPin, IconClock,
} from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import classes from './page.module.css';

// ── Mock Organisation Data ──────────────────────────────────────
const MOCK_ORG = {
  id: 'org_001',
  displayName: 'Auckland City Mission',
  legalName: 'Auckland City Mission Incorporated',
  ccNumber: 'CC20073',
  category: 'Community & Social Services',
  mission: 'Providing food, shelter, and support services to those in need across Auckland.',
  description: 'Founded in 1856, Auckland City Mission is one of Auckland\'s oldest charities, serving over 200,000 people annually through homelessness support, addiction treatment, and elderly welfare programmes.',
  website: 'https://www.acmission.org.nz',
  contactEmail: 'sarah@acmission.org.nz',
  contactPhone: '+64 9 303 9200',
  city: 'Auckland',
  region: 'Auckland',
  stripeAccountId: 'acct_1abc2def3ghi',
  stripeOnboardingComplete: true,
  yearEstablished: '1856',
};

// ── Mock Donation Data (charity side — who donated to us) ──
interface CharityDonation {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  project: string;
  date: string;
  status: 'succeeded' | 'pending' | 'refunded';
}

const MOCK_DONATIONS: CharityDonation[] = [
  { id: 'd1', donorName: 'Sarah K.', amount: 10000, currency: 'NZD', project: 'Emergency Housing Fund', date: '2026-05-19T06:30:00Z', status: 'succeeded' },
  { id: 'd2', donorName: 'James M.', amount: 5000, currency: 'NZD', project: 'Food Rescue Programme', date: '2026-05-18T14:20:00Z', status: 'succeeded' },
  { id: 'd3', donorName: 'Anonymous', amount: 20000, currency: 'NZD', project: 'Emergency Housing Fund', date: '2026-05-17T09:15:00Z', status: 'succeeded' },
  { id: 'd4', donorName: 'Emma W.', amount: 3000, currency: 'NZD', project: 'Youth Support Services', date: '2026-05-16T17:45:00Z', status: 'succeeded' },
  { id: 'd5', donorName: 'David L.', amount: 7500, currency: 'NZD', project: 'Emergency Housing Fund', date: '2026-05-15T11:00:00Z', status: 'succeeded' },
  { id: 'd6', donorName: 'Aroha T.', amount: 2500, currency: 'NZD', project: 'Food Rescue Programme', date: '2026-05-14T08:30:00Z', status: 'pending' },
  { id: 'd7', donorName: 'Michael B.', amount: 15000, currency: 'NZD', project: 'Emergency Housing Fund', date: '2026-05-12T13:00:00Z', status: 'succeeded' },
  { id: 'd8', donorName: 'Lisa P.', amount: 4000, currency: 'NZD', project: 'Youth Support Services', date: '2026-05-10T10:20:00Z', status: 'refunded' },
];

// ── Mock Project Data ──
interface OrgProject {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donorCount: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'draft';
  category: string;
  createdAt: string;
}

const MOCK_PROJECTS: OrgProject[] = [
  { id: 'p1', name: 'Emergency Housing Fund', description: 'Providing safe emergency accommodation for families in crisis.', goal: 50000, raised: 36400, donorCount: 234, daysLeft: 45, status: 'active', category: 'Community', createdAt: '2026-03-15' },
  { id: 'p2', name: 'Food Rescue Programme', description: 'Rescuing surplus food and transforming it into nutritious meals for those in need.', goal: 24000, raised: 18200, donorCount: 156, daysLeft: 30, status: 'active', category: 'Community', createdAt: '2026-04-01' },
  { id: 'p3', name: 'Youth Support Services', description: 'Mentoring and supporting at-risk youth with counselling, education, and job placement.', goal: 30000, raised: 30000, donorCount: 198, daysLeft: 0, status: 'completed', category: 'Education', createdAt: '2026-01-10' },
];

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
const projectStatusColor = (s: string) => s === 'active' ? 'green' : s === 'completed' ? 'blue' : 'gray';

// ===================== Overview Tab =====================
function OverviewTab() {
  const succeeded = MOCK_DONATIONS.filter(d => d.status === 'succeeded');
  const totalReceived = succeeded.reduce((s, d) => s + d.amount, 0);
  const uniqueDonors = new Set(MOCK_DONATIONS.map(d => d.donorName)).size;
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active').length;
  const thisMonth = succeeded
    .filter(d => new Date(d.date).getMonth() === new Date().getMonth())
    .reduce((s, d) => s + d.amount, 0);

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
              From {uniqueDonors} generous supporters across {activeProjects} active projects
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
          <ThemeIcon size={40} radius="md" color="terracotta" variant="light" mb={12}>
            <IconCoin size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(totalReceived)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Received</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={12}>
            <IconUsers size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{uniqueDonors}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donors</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="blue" variant="light" mb={12}>
            <IconClipboardList size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{activeProjects}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Active Projects</Text>
        </Card>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="grape" variant="light" mb={12}>
            <IconCalendar size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(thisMonth)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">This Month</Text>
        </Card>
      </SimpleGrid>

      {/* Recent Donations */}
      <Card padding="lg" radius="lg" withBorder>
        <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={16}>Recent Donations</Text>
        {MOCK_DONATIONS.slice(0, 5).map(d => (
          <div key={d.id} className={classes.recentItem}>
            <Box>
              <Text size="sm" fw={500} c="var(--bm-text-dark)">{d.donorName}</Text>
              <Text size="xs" c="var(--bm-text-muted)">{d.project} · {timeAgo(d.date)}</Text>
            </Box>
            <Box ta="right">
              <Text size="sm" fw={700} c="var(--bm-sage-dark)">{formatNZD(d.amount)}</Text>
              <Badge size="xs" color={statusColor(d.status)} variant="light">{statusLabel(d.status)}</Badge>
            </Box>
          </div>
        ))}
      </Card>
    </>
  );
}

// ===================== Donations Tab =====================
function DonationsTab() {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter
    ? MOCK_DONATIONS.filter(d => d.status === filter)
    : MOCK_DONATIONS;

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

      <Text size="xs" c="var(--bm-text-muted)" mb={12}>
        {filtered.length} donation{filtered.length !== 1 ? 's' : ''}
      </Text>

      <Card padding="lg" radius="lg" withBorder>
        <div className={classes.tableWrapper}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Donor</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Project</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(d => (
                <Table.Tr key={d.id}>
                  <Table.Td><Text size="sm" fw={500}>{d.donorName}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{formatNZD(d.amount)}</Text></Table.Td>
                  <Table.Td><Text size="sm">{d.project}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{formatDate(d.date)}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={statusColor(d.status)} variant="light" size="sm">
                      {statusLabel(d.status)}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Card>

      <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" mt={16}>
        <Text size="xs" fw={600}>Demo Mode</Text>
        <Text size="xs">Live donation data will appear once the backend API is connected.</Text>
      </Alert>
    </>
  );
}

// ===================== Projects Tab =====================
function ProjectsTab() {
  const [createOpened, setCreateOpened] = useState(false);

  return (
    <>
      <Group justify="space-between" mb={24}>
        <Box>
          <Text fw={700} size="md" c="var(--bm-text-dark)">Your Projects</Text>
          <Text size="sm" c="var(--bm-text-muted)">
            {MOCK_PROJECTS.filter(p => p.status === 'active').length} active · {MOCK_PROJECTS.filter(p => p.status === 'completed').length} completed
          </Text>
        </Box>
        <Button color="terracotta" radius="xl" leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>
          New Project
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        {MOCK_PROJECTS.map(p => {
          const progress = Math.round((p.raised / p.goal) * 100);
          return (
            <Card key={p.id} padding="lg" radius="lg" withBorder className={classes.projectCard}>
              <Group justify="space-between" mb={12}>
                <Badge color={projectStatusColor(p.status)} variant="light" size="sm" tt="capitalize">
                  {p.status}
                </Badge>
                <Group gap={4}>
                  <Tooltip label="View details">
                    <ActionIcon variant="light" color="sage" radius="md" size="sm">
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Edit project">
                    <ActionIcon variant="light" color="blue" radius="md" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>{p.name}</Text>
              <Text size="xs" c="var(--bm-text-muted)" mb={16} lineClamp={2}>{p.description}</Text>

              <Progress value={progress} color={p.status === 'completed' ? 'blue' : 'terracotta'} size="sm" radius="xl" mb={8} />

              <Group justify="space-between">
                <Text size="xs" c="var(--bm-text-muted)">
                  {formatNZD(p.raised)} / {formatNZD(p.goal)} ({progress}%)
                </Text>
                <Group gap={12}>
                  <Text size="xs" c="var(--bm-text-muted)">{p.donorCount} donors</Text>
                  {p.status === 'active' && (
                    <Text size="xs" c="var(--bm-text-muted)">{p.daysLeft}d left</Text>
                  )}
                </Group>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Create Project Modal */}
      <Modal opened={createOpened} onClose={() => setCreateOpened(false)} size="lg" radius="lg" title={
        <Group gap={8}><IconPlus size={18} color="var(--bm-sage-dark)" /><Text fw={700}>Create New Project</Text></Group>
      }>
        <Stack gap={16}>
          <TextInput label="Project Name" placeholder="e.g. Emergency Housing Fund" radius="md" />
          <Textarea label="Description" placeholder="Describe your project's goals and impact..." radius="md" autosize minRows={3} />
          <SimpleGrid cols={2} spacing={12}>
            <TextInput label="Fundraising Goal (NZD)" placeholder="50000" radius="md" type="number" />
            <Select label="Category" placeholder="Select category" radius="md"
              data={['Education', 'Environment', 'Health', 'Community', 'Arts & Culture', 'Animal Welfare']}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing={12}>
            <TextInput label="Duration (days)" placeholder="60" radius="md" type="number" />
            <TextInput label="Cover Image URL" placeholder="https://..." radius="md" />
          </SimpleGrid>
          <Divider />
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={() => setCreateOpened(false)}>Cancel</Button>
            <Button color="terracotta" radius="xl" leftSection={<IconCheck size={16} />}
              onClick={() => setCreateOpened(false)}
            >
              Create Project
            </Button>
          </Group>
          <Text size="xs" c="var(--bm-text-muted)" ta="center">
            ⚠️ Demo mode — project creation will be functional after backend API integration.
          </Text>
        </Stack>
      </Modal>
    </>
  );
}

// ===================== Profile Tab =====================
function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <Stack gap={20}>
      {/* Organisation Info */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>Organisation Information</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          <TextInput label="Display Name" defaultValue={MOCK_ORG.displayName} radius="md" />
          <TextInput label="Legal Name" defaultValue={MOCK_ORG.legalName} radius="md" disabled description="Contact support to change" />
          <TextInput label="CC Number" defaultValue={MOCK_ORG.ccNumber} radius="md" disabled />
          <TextInput label="Category" defaultValue={MOCK_ORG.category} radius="md" disabled />
        </SimpleGrid>
        <Textarea label="Mission Statement" defaultValue={MOCK_ORG.mission} radius="md" mt={16} autosize minRows={2} />
        <Textarea label="Description" defaultValue={MOCK_ORG.description} radius="md" mt={16} autosize minRows={3} />
      </Card>

      {/* Contact Info */}
      <Card padding="xl" radius="lg" withBorder>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>Contact Details</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          <TextInput label="Website" defaultValue={MOCK_ORG.website} radius="md" leftSection={<IconWorld size={14} />} />
          <TextInput label="Email" defaultValue={MOCK_ORG.contactEmail} radius="md" leftSection={<IconMail size={14} />} />
          <TextInput label="Phone" defaultValue={MOCK_ORG.contactPhone} radius="md" leftSection={<IconPhone size={14} />} />
          <TextInput label="Location" defaultValue={`${MOCK_ORG.city}, ${MOCK_ORG.region}`} radius="md" leftSection={<IconMapPin size={14} />} />
        </SimpleGrid>
      </Card>

      {/* Stripe Status */}
      <Card padding="xl" radius="lg" withBorder className={classes.stripeStatusCard}>
        <Group gap={12} mb={16}>
          <ThemeIcon size={40} radius="md" color={MOCK_ORG.stripeOnboardingComplete ? 'green' : 'orange'} variant="light">
            <IconBrandStripe size={20} />
          </ThemeIcon>
          <Box flex={1}>
            <Text size="sm" fw={600} c="var(--bm-text-dark)">Stripe Payout Account</Text>
            <Text size="xs" c="var(--bm-text-muted)">
              {MOCK_ORG.stripeOnboardingComplete
                ? `Connected · ${MOCK_ORG.stripeAccountId}`
                : 'Setup pending — complete onboarding to receive donations'}
            </Text>
          </Box>
          <Badge color={MOCK_ORG.stripeOnboardingComplete ? 'green' : 'orange'} variant="light">
            {MOCK_ORG.stripeOnboardingComplete ? 'Active' : 'Pending'}
          </Badge>
        </Group>
        {!MOCK_ORG.stripeOnboardingComplete && (
          <Button color="terracotta" radius="xl" fullWidth leftSection={<IconBrandStripe size={16} />}>
            Complete Stripe Setup
          </Button>
        )}
      </Card>

      <Group justify="flex-end">
        <Button color="sage" radius="xl"
          leftSection={saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
          onClick={handleSave}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </Group>

      <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md">
        <Text size="xs" fw={600}>Demo Mode</Text>
        <Text size="xs">Profile changes will be saved once the backend API is connected.</Text>
      </Alert>
    </Stack>
  );
}

// ===================== Main Dashboard =====================
function CharityDashboardContent() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="lg">
          {/* Greeting */}
          <Group gap={16} mb={32}>
            <Avatar size={56} radius="xl" color="terracotta">
              {MOCK_ORG.displayName.charAt(0)}
            </Avatar>
            <Box>
              <Title order={2} className={classes.greeting}>
                {MOCK_ORG.displayName}
              </Title>
              <Group gap={8} mt={4}>
                <Badge size="sm" variant="light" className={classes.orgBadge}
                  leftSection={<IconShieldCheck size={10} />}
                >
                  {MOCK_ORG.ccNumber}
                </Badge>
                <Text size="xs" c="var(--bm-text-muted)">{MOCK_ORG.category}</Text>
              </Group>
            </Box>
          </Group>

          {/* Tab Navigation */}
          <Tabs defaultValue="overview" color="terracotta" radius="md">
            <Tabs.List className={classes.tabList}>
              <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>Overview</Tabs.Tab>
              <Tabs.Tab value="donations" leftSection={<IconCoin size={16} />}>Donations</Tabs.Tab>
              <Tabs.Tab value="projects" leftSection={<IconClipboardList size={16} />}>Projects</Tabs.Tab>
              <Tabs.Tab value="profile" leftSection={<IconSettings size={16} />}>Profile</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview"><OverviewTab /></Tabs.Panel>
            <Tabs.Panel value="donations"><DonationsTab /></Tabs.Panel>
            <Tabs.Panel value="projects"><ProjectsTab /></Tabs.Panel>
            <Tabs.Panel value="profile"><ProfileTab /></Tabs.Panel>
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
