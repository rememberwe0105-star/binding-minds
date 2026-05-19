'use client';

import {
  Container, Title, Text, Box, Group, Button,
  Card, SimpleGrid, ThemeIcon, Alert,
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconCoin,
  IconBuilding, IconUsers, IconReceipt,
  IconClock, IconCheck, IconArrowRight,
  IconHeart, IconBell, IconX, IconTrendingUp,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock Platform Data ──────────────────────────────────────────
const PLATFORM_STATS = {
  totalDonations: 14835000,   // cents
  activeCharities: 12,
  totalDonors: 2847,
  platformRevenue: 148350,    // cents ($1 per donation × ~1483)
  pendingApplications: 3,
  stripePending: 1,
};

interface ActivityItem {
  id: string;
  type: 'donation' | 'application' | 'approval' | 'rejection';
  message: string;
  time: string;
  icon: 'heart' | 'building' | 'check' | 'x';
  color: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'donation', message: '$200 donation — Restore Native Forest via Forest & Bird NZ', time: '10 min ago', icon: 'heart', color: 'terracotta' },
  { id: 'a2', type: 'approval', message: 'Auckland City Mission — application approved', time: '1 hour ago', icon: 'check', color: 'green' },
  { id: 'a3', type: 'donation', message: '$50 donation — Education For All via Kiwi Education Trust', time: '2 hours ago', icon: 'heart', color: 'terracotta' },
  { id: 'a4', type: 'application', message: 'Surf Life Saving NZ — new application submitted', time: '3 hours ago', icon: 'building', color: 'blue' },
  { id: 'a5', type: 'donation', message: '$100 donation — Supporting Local Art via Wellington Arts Collective', time: '5 hours ago', icon: 'heart', color: 'terracotta' },
  { id: 'a6', type: 'rejection', message: 'Help Everyone Ltd — application rejected (CC not verified)', time: '1 day ago', icon: 'x', color: 'red' },
  { id: 'a7', type: 'application', message: 'Youth Mental Health NZ — moved to consultation', time: '1 day ago', icon: 'building', color: 'orange' },
  { id: 'a8', type: 'donation', message: '$500 donation — Clean Water for Southland via Southland Water Trust', time: '2 days ago', icon: 'heart', color: 'terracotta' },
];

const ICON_MAP = {
  heart: IconHeart,
  building: IconBuilding,
  check: IconCheck,
  x: IconX,
};

function formatNZD(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString('en-NZ')}`;
}

export default function AdminOverviewPage() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>
          {/* Page Header */}
          <Group justify="space-between" mb={8}>
            <Box>
              <Group gap={8} mb={4}>
                <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Platform Overview</Title>
            </Box>
            <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" p={10}>
              <Text size="xs" fw={600}>Demo Mode</Text>
              <Text size="xs">Live data will appear once backend APIs are connected.</Text>
            </Alert>
          </Group>

          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32} mt={24}>
            {[
              { label: 'Total Donations', value: formatNZD(PLATFORM_STATS.totalDonations), color: 'terracotta', icon: IconCoin },
              { label: 'Active Charities', value: String(PLATFORM_STATS.activeCharities), color: 'sage', icon: IconBuilding },
              { label: 'Total Donors', value: PLATFORM_STATS.totalDonors.toLocaleString(), color: 'blue', icon: IconUsers },
              { label: 'Platform Revenue', value: formatNZD(PLATFORM_STATS.platformRevenue), color: 'grape', icon: IconReceipt },
            ].map(({ label, value, color, icon: Icon }) => (
              <Card key={label} padding="lg" radius="lg" withBorder className={classes.statCard}>
                <ThemeIcon size={36} radius="md" color={color} variant="light" mb={8}>
                  <Icon size={18} />
                </ThemeIcon>
                <Text className={classes.statValue}>{value}</Text>
                <Text size="xs" c="var(--bm-text-muted)">{label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={16} mb={32}>
            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/charities"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="orange" variant="light">
                    <IconClock size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      {PLATFORM_STATS.pendingApplications} Pending Apps
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      Review registrations
                    </Text>
                  </Box>
                </Group>
                <IconArrowRight size={18} color="var(--bm-text-muted)" />
              </Group>
            </Card>

            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/charities"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="blue" variant="light">
                    <IconBell size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      {PLATFORM_STATS.stripePending} Stripe Setup
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      Awaiting Stripe onboarding
                    </Text>
                  </Box>
                </Group>
                <IconArrowRight size={18} color="var(--bm-text-muted)" />
              </Group>
            </Card>

            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/donors"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="green" variant="light">
                    <IconUsers size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      Manage Donors
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      Update account statuses
                    </Text>
                  </Box>
                </Group>
                <IconArrowRight size={18} color="var(--bm-text-muted)" />
              </Group>
            </Card>

            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/analytics"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="terracotta" variant="light">
                    <IconTrendingUp size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      Platform Analytics
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      View growth trends
                    </Text>
                  </Box>
                </Group>
                <IconArrowRight size={18} color="var(--bm-text-muted)" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Recent Activity */}
          <Card padding="lg" radius="lg" withBorder>
            <Group justify="space-between" mb={16}>
              <Text fw={700} size="md" c="var(--bm-text-dark)">Recent Activity</Text>
              <Button variant="subtle" color="sage" size="xs" rightSection={<IconArrowRight size={14} />}>
                View All
              </Button>
            </Group>

            {MOCK_ACTIVITY.map(item => {
              const Icon = ICON_MAP[item.icon];
              return (
                <div key={item.id} className={classes.activityItem}>
                  <ThemeIcon size={28} radius="xl" color={item.color} variant="light">
                    <Icon size={14} />
                  </ThemeIcon>
                  <Box flex={1}>
                    <Text size="sm" c="var(--bm-text-dark)" lh={1.5}>{item.message}</Text>
                    <Text size="xs" c="var(--bm-text-muted)">{item.time}</Text>
                  </Box>
                </div>
              );
            })}
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
