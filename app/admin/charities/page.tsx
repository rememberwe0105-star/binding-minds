'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconBuilding, IconCheck, IconX, IconPhone,
  IconEye, IconShieldCheck, IconClock, IconAlertCircle,
  IconMail, IconWorld, IconCalendar,
} from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock 데이터 (백엔드 API 연동 전 데모용) ─────────────────
type AppStatus = 'pending' | 'approved' | 'rejected' | 'consultation';

interface CharityApplication {
  id: string;
  legalName: string;
  displayName: string;
  ccNumber: string;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  region: string;
  mission: string;
  description: string;
  website: string;
  yearEstablished: string;
  status: AppStatus;
  appliedAt: string;
  note?: string;
}

const MOCK_APPLICATIONS: CharityApplication[] = [
  {
    id: '1', legalName: 'Auckland City Mission Incorporated', displayName: 'Auckland City Mission',
    ccNumber: 'CC20073', category: 'Community & Social Services',
    contactName: 'Sarah Thompson', contactEmail: 'sarah@acmission.org.nz',
    contactPhone: '+64 9 303 9200', city: 'Auckland', region: 'Auckland',
    mission: 'Providing food, medical, and housing services to the homeless and vulnerable communities.',
    description: 'Founded in 1856, Auckland City Mission is one of Auckland\'s oldest charities. Serving over 200,000 people annually through homelessness support, addiction treatment, and elderly welfare programmes.',
    website: 'https://www.acmission.org.nz', yearEstablished: '1856',
    status: 'pending', appliedAt: '2026-05-15T08:30:00Z',
  },
  {
    id: '2', legalName: 'Surf Life Saving New Zealand', displayName: 'Surf Life Saving NZ',
    ccNumber: 'CC37291', category: 'Community & Social Services',
    contactName: 'Mark Johnson', contactEmail: 'mark@surflifesaving.org.nz',
    contactPhone: '+64 4 384 8325', city: 'Wellington', region: 'Wellington',
    mission: 'Ensuring beach safety and preventing marine accidents across New Zealand.',
    description: '74 clubs nationwide with over 17,000 active volunteers dedicated to water safety.',
    website: 'https://www.surflifesaving.org.nz', yearEstablished: '1910',
    status: 'pending', appliedAt: '2026-05-16T14:20:00Z',
  },
  {
    id: '3', legalName: 'SPCA New Zealand', displayName: 'SPCA NZ',
    ccNumber: 'CC24106', category: 'Animal Welfare',
    contactName: 'Emma Wilson', contactEmail: 'emma@spca.nz',
    contactPhone: '+64 9 827 6094', city: 'Auckland', region: 'Auckland',
    mission: 'Preventing animal cruelty and promoting the welfare of all animals.',
    description: 'Founded in 1882. Rescuing, sheltering, and rehoming over 50,000 animals annually.',
    website: 'https://www.spca.nz', yearEstablished: '1882',
    status: 'approved', appliedAt: '2026-05-10T09:15:00Z',
  },
  {
    id: '4', legalName: 'Youth Mental Health NZ Trust', displayName: 'Youth Mental Health NZ',
    ccNumber: 'CC51834', category: 'Health & Medical',
    contactName: 'James Park', contactEmail: 'james@ymh.org.nz',
    contactPhone: '+64 9 555 0199', city: 'Christchurch', region: 'Canterbury',
    mission: 'Providing youth mental health support and crisis intervention services.',
    description: 'Running mental health counselling, crisis intervention, and school outreach programmes for youth aged 10-24.',
    website: 'https://www.ymh.org.nz', yearEstablished: '2015',
    status: 'consultation', appliedAt: '2026-05-12T11:45:00Z',
    note: 'CC number verification required. Additional documentation requested from contact person.',
  },
  {
    id: '5', legalName: 'Fake Charity Ltd', displayName: 'Help Everyone',
    ccNumber: 'CC99999', category: 'Other',
    contactName: 'Unknown Person', contactEmail: 'info@faketest.com',
    contactPhone: '', city: 'Auckland', region: 'Auckland',
    mission: 'We help everyone.',
    description: 'We are a good organisation that helps all people.',
    website: '', yearEstablished: '2026',
    status: 'rejected', appliedAt: '2026-05-14T16:00:00Z',
    note: 'CC99999 registration not found on NZ Charities Services. No website. Application rejected.',
  },
];

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
  const [apps, setApps] = useState<CharityApplication[]>(MOCK_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const [selected, setSelected] = useState<CharityApplication | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<AppStatus | null>(null);

  const counts = {
    pending: apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
    consultation: apps.filter((a) => a.status === 'consultation').length,
  };

  const filtered = apps.filter((a) => activeTab === 'all' || a.status === activeTab);

  const applyAction = (id: string, status: AppStatus, note: string) => {
    setApps((prev) =>
      prev.map((a) => a.id === id ? { ...a, status, note } : a)
    );
    setSelected(null);
    setConfirmAction(null);
    setActionNote('');
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>
          {/* 페이지 헤더 */}
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
            <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" p={10}>
              <Text size="xs" fw={600}>Demo Mode</Text>
              <Text size="xs">Live data will appear once the backend API is connected.</Text>
            </Alert>
          </Group>

          {/* 통계 카드 */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32}>
            {[
              { key: 'pending', label: 'Pending Review', color: 'orange', icon: IconClock },
              { key: 'approved', label: 'Approved', color: 'green', icon: IconCheck },
              { key: 'consultation', label: 'In Consultation', color: 'blue', icon: IconPhone },
              { key: 'rejected', label: 'Rejected', color: 'red', icon: IconX },
            ].map(({ key, label, color, icon: Icon }) => (
              <Card
                key={key} padding="lg" radius="lg" withBorder
                className={classes.statCard}
                style={{ cursor: 'pointer', borderColor: activeTab === key ? `var(--mantine-color-${color}-4)` : undefined }}
                onClick={() => setActiveTab(key)}
              >
                <ThemeIcon size={36} radius="md" color={color} variant="light" mb={8}>
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xl" fw={900} c={`var(--mantine-color-${color}-7)`}>
                  {counts[key as AppStatus]}
                </Text>
                <Text size="sm" c="var(--bm-text-muted)">{label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* 탭 + 목록 */}
          <Card padding="lg" radius="lg" withBorder>
            <Tabs value={activeTab} onChange={setActiveTab} mb={16}>
              <Tabs.List>
                <Tabs.Tab value="pending">Pending ({counts.pending})</Tabs.Tab>
                <Tabs.Tab value="consultation">Consultation ({counts.consultation})</Tabs.Tab>
                <Tabs.Tab value="approved">Approved ({counts.approved})</Tabs.Tab>
                <Tabs.Tab value="rejected">Rejected ({counts.rejected})</Tabs.Tab>
                <Tabs.Tab value="all">All</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Organisation</Table.Th>
                  <Table.Th>CC Number</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Applied</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((app) => {
                  const sc = STATUS_CONFIG[app.status];
                  return (
                    <Table.Tr key={app.id}>
                      <Table.Td>
                        <Text fw={600} size="sm" c="var(--bm-text-dark)">{app.displayName}</Text>
                        <Text size="xs" c="var(--bm-text-muted)">{app.contactEmail}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" ff="monospace">{app.ccNumber}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{app.category}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(app.appliedAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={sc.color} variant="light" leftSection={sc.icon}>
                          {sc.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="View Details">
                          <ActionIcon
                            variant="light"
                            color="sage"
                            radius="md"
                            onClick={() => setSelected(app)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {filtered.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '32px 0' }}>
                      <Text c="var(--bm-text-muted)">No applications with this status.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Container>
      </main>
      <Footer />

      {/* ── 상세 모달 ── */}
      <Modal
        opened={!!selected}
        onClose={() => { setSelected(null); setConfirmAction(null); setActionNote(''); }}
        size="lg"
        radius="lg"
        title={
          <Group gap={8}>
            <IconBuilding size={18} color="var(--bm-sage-dark)" />
            <Text fw={700}>{selected?.displayName}</Text>
            {selected && (
              <Badge color={STATUS_CONFIG[selected.status].color} variant="light">
                {STATUS_CONFIG[selected.status].label}
              </Badge>
            )}
          </Group>
        }
      >
        {selected && (
          <Stack gap={16}>
            {/* 기본 정보 */}
            <SimpleGrid cols={2} spacing={12}>
              {[
                { icon: IconBuilding, label: 'Legal Name', value: selected.legalName },
                { icon: IconShieldCheck, label: 'CC Number', value: selected.ccNumber },
                { icon: IconMail, label: 'Contact Email', value: selected.contactEmail },
                { icon: IconPhone, label: 'Phone', value: selected.contactPhone || '—' },
                { icon: IconWorld, label: 'Website', value: selected.website || '—' },
                { icon: IconCalendar, label: 'Applied', value: formatDate(selected.appliedAt) },
              ].map(({ icon: Icon, label, value }) => (
                <Box key={label} p={10} style={{ background: 'var(--bm-sage-bg)', borderRadius: 8 }}>
                  <Group gap={6} mb={2}>
                    <Icon size={12} color="var(--bm-sage-dark)" />
                    <Text size="xs" c="var(--bm-text-muted)">{label}</Text>
                  </Group>
                  <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)" mb={6}>Mission</Text>
              <Text size="sm" c="var(--bm-text-dark)" lh={1.7}>{selected.mission}</Text>
            </Box>

            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)" mb={6}>About</Text>
              <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>{selected.description}</Text>
            </Box>

            {selected.note && (
              <Alert icon={<IconAlertCircle size={14} />} color="blue" variant="light" radius="md">
                <Text size="xs" fw={600} mb={2}>Note</Text>
                <Text size="sm">{selected.note}</Text>
              </Alert>
            )}

            <Divider />

            {/* 액션 메모 */}
            <Textarea
              label="Processing Note (optional)"
              placeholder="Reason for rejection, consultation details, or special notes..."
              value={actionNote}
              onChange={(e) => setActionNote(e.currentTarget.value)}
              autosize
              minRows={2}
              radius="md"
            />

            {/* 액션 버튼 */}
            <Group grow>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'approved', actionNote)}
                disabled={selected.status === 'approved'}
              >
                Approve
              </Button>
              <Button
                color="blue"
                variant="light"
                leftSection={<IconPhone size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'consultation', actionNote)}
                disabled={selected.status === 'consultation'}
              >
                Consult
              </Button>
              <Button
                color="red"
                variant="light"
                leftSection={<IconX size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'rejected', actionNote)}
                disabled={selected.status === 'rejected'}
              >
                Reject
              </Button>
            </Group>

            <Text size="xs" c="var(--bm-text-muted)" ta="center">
              ⚠️ Demo mode — email notifications and database writes will be active after backend API integration.
            </Text>
          </Stack>
        )}
      </Modal>
    </>
  );
}
