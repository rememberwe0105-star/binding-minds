'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Alert, Stack, Divider, ActionIcon, Flex, TextInput, ScrollArea
} from '@mantine/core';
import {
  IconUser, IconCheck, IconX, IconShieldCheck,
  IconClock, IconAlertCircle, IconMail, IconArrowLeft,
  IconSearch, IconHeart, IconCoin
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock Data ──────────────────────────────────────────────────
type DonorStatus = 'active' | 'inactive';

interface Donor {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalDonated: number;
  donationsCount: number;
  status: DonorStatus;
  lastDonationDate: string;
  favorites: number;
}

const MOCK_DONORS: Donor[] = [
  { id: 'd_1', name: 'Sarah Thompson', email: 'sarah.t@example.com', joinDate: '2026-01-15T08:30:00Z', totalDonated: 15400, donationsCount: 5, status: 'active', lastDonationDate: '2026-05-15T14:20:00Z', favorites: 12 },
  { id: 'd_2', name: 'James Wilson', email: 'j.wilson99@test.com', joinDate: '2026-03-22T11:45:00Z', totalDonated: 300, donationsCount: 1, status: 'active', lastDonationDate: '2026-03-25T09:10:00Z', favorites: 3 },
  { id: 'd_3', name: 'Emma Davis', email: 'emma.davis@example.com', joinDate: '2025-11-05T16:00:00Z', totalDonated: 45000, donationsCount: 12, status: 'active', lastDonationDate: '2026-05-10T11:00:00Z', favorites: 8 },
  { id: 'd_4', name: 'Spam Account', email: 'spam123@fake.com', joinDate: '2026-05-18T22:15:00Z', totalDonated: 0, donationsCount: 0, status: 'inactive', lastDonationDate: '', favorites: 0 },
  { id: 'd_5', name: 'Michael Brown', email: 'mike.b@test.co.nz', joinDate: '2026-02-14T09:20:00Z', totalDonated: 2000, donationsCount: 3, status: 'active', lastDonationDate: '2026-04-30T15:40:00Z', favorites: 5 },
];

function formatNZD(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>(MOCK_DONORS);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Donor | null>(null);
  
  const [confirmStatusModal, setConfirmStatusModal] = useState<DonorStatus | null>(null);

  const counts = {
    all: donors.length,
    active: donors.filter((d) => d.status === 'active').length,
    inactive: donors.filter((d) => d.status === 'inactive').length,
  };

  const filtered = donors.filter((d) => {
    const matchesTab = activeTab === 'all' || d.status === activeTab;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleStatusChange = () => {
    if (!selected || !confirmStatusModal) return;
    
    setDonors(prev => prev.map(d => 
      d.id === selected.id ? { ...d, status: confirmStatusModal } : d
    ));
    setSelected(prev => prev ? { ...prev, status: confirmStatusModal } : null);
    setConfirmStatusModal(null);
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
            <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" p={10}>
              <Text size="xs" fw={600}>Demo Mode</Text>
              <Text size="xs">Live data will appear once the backend API is connected.</Text>
            </Alert>
          </Group>

          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={16} mb={32}>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={36} radius="md" color="blue" variant="light" mb={8}>
                <IconUser size={18} />
              </ThemeIcon>
              <Text size="xl" fw={900} c="var(--bm-text-dark)">{counts.all}</Text>
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
                                <Text size="sm" fw={600}>{formatNZD(d.totalDonated)}</Text>
                              </Table.Td>
                            )}
                            {!selected && (
                              <Table.Td>
                                <Text size="sm">{formatDate(d.joinDate)}</Text>
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
                          <Text size="sm" c="var(--bm-text-muted)">Joined {formatDate(selected.joinDate)}</Text>
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
                          <Text size="lg" fw={800} c="var(--bm-sage-dark)">{formatNZD(selected.totalDonated)}</Text>
                          <Text size="xs" c="var(--bm-text-muted)">Across {selected.donationsCount} contributions</Text>
                        </Box>
                        
                        <Box p={16} style={{ background: 'var(--bm-terracotta-bg)', borderRadius: 8 }}>
                          <Group gap={6} mb={4}>
                            <IconHeart size={14} color="var(--bm-terracotta-dark)" />
                            <Text size="xs" tt="uppercase" fw={700} c="var(--bm-text-muted)">Favorites Saved</Text>
                          </Group>
                          <Text size="lg" fw={800} c="var(--bm-terracotta-dark)">{selected.favorites}</Text>
                          <Text size="xs" c="var(--bm-text-muted)">Projects & Charities</Text>
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
                            <Text size="xs" c="var(--bm-text-muted)">Last Donation</Text>
                          </Group>
                          <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{formatDate(selected.lastDonationDate)}</Text>
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
          <Button color={confirmStatusModal === 'active' ? 'green' : 'red'} onClick={handleStatusChange}>
            Confirm Change
          </Button>
        </Group>
      </Modal>
    </>
  );
}
