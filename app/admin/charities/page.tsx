'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon,
  Flex, TextInput, ScrollArea, Timeline
} from '@mantine/core';
import {
  IconBuilding, IconCheck, IconX, IconPhone,
  IconShieldCheck, IconClock, IconAlertCircle,
  IconMail, IconWorld, IconCalendar, IconArrowLeft,
  IconSearch, IconExternalLink, IconPoint, IconCircleCheck
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock 데이터 (백엔드 API 연동 전 데모용) ─────────────────
type AppStatus = 'pending' | 'approved' | 'rejected' | 'consultation';

interface ActionLog {
  id: string;
  action: 'submitted' | 'pending' | 'approved' | 'rejected' | 'consultation' | 'note_added';
  by: string;
  at: string;
  note?: string;
}

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
  history: ActionLog[];
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
    history: [
      { id: 'h1', action: 'submitted', by: 'sarah@acmission.org.nz', at: '2026-05-15T08:30:00Z' }
    ]
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
    history: [
      { id: 'h2', action: 'submitted', by: 'mark@surflifesaving.org.nz', at: '2026-05-16T14:20:00Z' }
    ]
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
    history: [
      { id: 'h4', action: 'approved', by: 'Platform Admin', at: '2026-05-12T10:00:00Z', note: 'CC number and details verified.' },
      { id: 'h3', action: 'submitted', by: 'emma@spca.nz', at: '2026-05-10T09:15:00Z' }
    ]
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
    history: [
      { id: 'h6', action: 'consultation', by: 'Platform Admin', at: '2026-05-14T11:00:00Z', note: 'Requested further proof of CC registration.' },
      { id: 'h5', action: 'submitted', by: 'james@ymh.org.nz', at: '2026-05-12T11:45:00Z' }
    ]
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
    history: [
      { id: 'h8', action: 'rejected', by: 'Platform Admin', at: '2026-05-15T09:00:00Z', note: 'CC99999 registration not found. No website.' },
      { id: 'h7', action: 'submitted', by: 'info@faketest.com', at: '2026-05-14T16:00:00Z' }
    ]
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

function formatTime(dateStr: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    hour: 'numeric', minute: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(dateStr));
}

export default function AdminCharitiesPage() {
  const [apps, setApps] = useState<CharityApplication[]>(MOCK_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<CharityApplication | null>(null);
  
  const [actionNote, setActionNote] = useState('');
  const [confirmActionModal, setConfirmActionModal] = useState<AppStatus | null>(null);

  const counts = {
    pending: apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
    consultation: apps.filter((a) => a.status === 'consultation').length,
  };

  const filtered = apps.filter((a) => {
    const matchesTab = activeTab === 'all' || a.status === activeTab;
    const matchesSearch =
      a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ccNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const applyAction = () => {
    if (!selected || !confirmActionModal) return;

    const newHistoryEntry: ActionLog = {
      id: `h_new_${Date.now()}`,
      action: confirmActionModal,
      by: 'Platform Admin',
      at: new Date().toISOString(),
      note: actionNote,
    };

    setApps((prev) =>
      prev.map((a) => a.id === selected.id ? { 
        ...a, 
        status: confirmActionModal, 
        note: actionNote || a.note,
        history: [newHistoryEntry, ...a.history]
      } : a)
    );
    
    // Update local selected state so UI refreshes without closing
    setSelected(prev => prev ? {
      ...prev,
      status: confirmActionModal,
      note: actionNote || prev.note,
      history: [newHistoryEntry, ...prev.history]
    } : null);

    setConfirmActionModal(null);
    setActionNote('');
  };

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
                onClick={() => {
                  setActiveTab(key);
                  setSelected(null); // 탭 변경 시 선택 초기화
                }}
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

          {/* 탭 + 사이드 패널 레이아웃 */}
          <Flex gap="md" align="flex-start" wrap={selected ? "nowrap" : "wrap"} direction={{ base: 'column', md: 'row' }}>
            {/* 좌측 리스트 (선택 시 폭 축소) */}
            <Box style={{ flex: selected ? '0 0 45%' : '1 1 100%', transition: 'all 0.3s ease', minWidth: 0, width: '100%' }}>
              <Card padding="md" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                <Group justify="space-between" mb={16} wrap="nowrap">
                  <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setSelected(null); }} style={{ flex: 1, minWidth: 200 }}>
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
                        const sc = STATUS_CONFIG[app.status];
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
                              <Text fw={600} size="sm" c={isSelected ? 'var(--bm-sage-dark)' : 'var(--bm-text-dark)'} lineClamp={1}>{app.displayName}</Text>
                              <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{app.contactEmail}</Text>
                            </Table.Td>
                            {!selected && (
                              <Table.Td>
                                <Text size="sm" ff="monospace">{app.ccNumber}</Text>
                              </Table.Td>
                            )}
                            {!selected && (
                              <Table.Td>
                                <Text size="sm">{formatDate(app.appliedAt)}</Text>
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
              </Card>
            </Box>

            {/* 우측 디테일 패널 */}
            {selected && (
              <Box style={{ flex: '1 1 55%', minWidth: 0, width: '100%', animation: 'fadeIn 0.3s ease' }}>
                <Card padding="xl" radius="lg" withBorder style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
                  <Group justify="space-between" mb={20} align="flex-start">
                    <Group gap={12} align="flex-start">
                      <ThemeIcon size={48} radius="md" color="var(--bm-sage-dark)" variant="light">
                        <IconBuilding size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} c="var(--bm-text-dark)">{selected.displayName}</Title>
                        <Group gap={8} mt={4}>
                          <Badge color={STATUS_CONFIG[selected.status].color} variant="light">
                            {STATUS_CONFIG[selected.status].label}
                          </Badge>
                          <Text size="sm" c="var(--bm-text-muted)">Applied {formatDate(selected.appliedAt)}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={() => setSelected(null)}>
                      <IconX size={20} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                    <Stack gap={24} pr={16}>
                      
                      {/* 외부 링크 */}
                      <Button 
                        component="a" 
                        href={`https://www.charities.govt.nz/charities-in-new-zealand/view-registered-charities/?keyword=${selected.ccNumber}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        variant="light" 
                        color="blue" 
                        fullWidth 
                        rightSection={<IconExternalLink size={16} />}
                        radius="md"
                      >
                        Verify {selected.ccNumber} on NZ Charities Register
                      </Button>

                      {/* 기본 정보 */}
                      <SimpleGrid cols={2} spacing={12}>
                        {[
                          { icon: IconBuilding, label: 'Legal Name', value: selected.legalName },
                          { icon: IconShieldCheck, label: 'CC Number', value: selected.ccNumber },
                          { icon: IconMail, label: 'Contact Email', value: selected.contactEmail },
                          { icon: IconPhone, label: 'Phone', value: selected.contactPhone || '—' },
                          { icon: IconWorld, label: 'Website', value: selected.website || '—' },
                          { icon: IconCalendar, label: 'Est. Year', value: selected.yearEstablished },
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
                          <Text size="xs" fw={600} mb={2}>Admin Note</Text>
                          <Text size="sm">{selected.note}</Text>
                        </Alert>
                      )}

                      <Divider />
                      
                      {/* 타임라인 (Action History) */}
                      <Box>
                        <Text size="sm" fw={700} c="var(--bm-text-dark)" mb={16}>Action History</Text>
                        <Timeline active={0} bulletSize={24} lineWidth={2} color="var(--bm-sage-dark)">
                          {selected.history.map((log) => (
                            <Timeline.Item 
                              key={log.id} 
                              bullet={log.action === 'submitted' ? <IconPoint size={12} /> : <IconCircleCheck size={12} />} 
                              title={<Text size="sm" fw={600} tt="capitalize">{log.action}</Text>}
                            >
                              <Text c="dimmed" size="xs" mt={4}>{log.by} · {formatDate(log.at)} {formatTime(log.at)}</Text>
                              {log.note && <Text size="sm" mt={4} c="var(--bm-text-dark)">&quot;{log.note}&quot;</Text>}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      </Box>

                      <Divider />

                      {/* 액션 박스 */}
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

      {/* ── 확인(Confirmation) 모달 ── */}
      <Modal 
        opened={!!confirmActionModal} 
        onClose={() => setConfirmActionModal(null)}
        title={<Group gap={8}><IconAlertCircle color="orange" /><Text fw={700}>Confirm Action</Text></Group>}
        radius="lg"
        centered
      >
        <Text size="sm" mb={16}>
          Are you sure you want to mark <strong>{selected?.displayName}</strong> as <Badge color={confirmActionModal ? STATUS_CONFIG[confirmActionModal].color : 'gray'} variant="light">{confirmActionModal}</Badge>?
        </Text>
        {actionNote && (
          <Box p={12} mb={16} style={{ background: '#f1f3f5', borderRadius: 8 }}>
            <Text size="xs" fw={700} c="dimmed">NOTE INCLUDED</Text>
            <Text size="sm">&quot;{actionNote}&quot;</Text>
          </Box>
        )}
        <Group justify="flex-end" mt={24}>
          <Button variant="subtle" color="gray" onClick={() => setConfirmActionModal(null)}>Cancel</Button>
          <Button color={confirmActionModal ? STATUS_CONFIG[confirmActionModal].color : 'blue'} onClick={applyAction}>
            Confirm {confirmActionModal}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
