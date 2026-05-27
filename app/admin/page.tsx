'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Box, Group, Button,
  Card, SimpleGrid, ThemeIcon, Alert, Loader,
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconCoin,
  IconBuilding, IconUsers, IconReceipt,
  IconClock, IconCheck, IconArrowRight,
  IconHeart, IconX, IconTrendingUp,
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminPlatformAnalytics,
  getAdminCharities,
  getAdminActivityLog,
  type PlatformAnalytics,
  type AdminActivityItem,
} from '@/lib/api';
import classes from './page.module.css';

// ── Activity Item 타입 (최근 활동) ──
interface ActivityItem {
  id: string;
  type: 'donation' | 'application' | 'approval' | 'rejection' | 'project' | 'system';
  message: string;
  time: string;
  icon: 'heart' | 'building' | 'check' | 'x' | 'clipboard' | 'alert';
  color: string;
}

const ICON_MAP = {
  heart: IconHeart,
  building: IconBuilding,
  check: IconCheck,
  x: IconX,
  clipboard: IconClock,
  alert: IconAlertCircle,
};

function formatNZD(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString('en-NZ')}`;
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getAdminPlatformAnalytics().catch(() => null),
      getAdminCharities('pending', 1, 1).catch(() => null),
      getAdminActivityLog(1, 10).catch(() => null),
    ]).then(([analyticsRes, charitiesRes, activityRes]) => {
      if (cancelled) return;
      if (analyticsRes) setAnalytics(analyticsRes);
      if (charitiesRes) setPendingCount(charitiesRes.total);
      if (activityRes && activityRes.items) {
        const ACTIVITY_ICON_MAP: Record<string, { icon: ActivityItem['icon']; color: string }> = {
          charity_approved: { icon: 'check', color: 'green' },
          charity_rejected: { icon: 'x', color: 'red' },
          donation_received: { icon: 'heart', color: 'terracotta' },
          project_created: { icon: 'clipboard', color: 'blue' },
          project_reviewed: { icon: 'check', color: 'green' },
          donor_suspended: { icon: 'x', color: 'red' },
          refund_issued: { icon: 'alert', color: 'orange' },
          system_event: { icon: 'alert', color: 'gray' },
        };
        setActivity(activityRes.items.map((item: AdminActivityItem) => {
          const config = ACTIVITY_ICON_MAP[item.type] ?? { icon: 'alert' as const, color: 'gray' };
          const timeDiff = Date.now() - new Date(item.created_at).getTime();
          const minutes = Math.floor(timeDiff / 60000);
          const hours = Math.floor(minutes / 60);
          const timeStr = hours > 0 ? `${hours}h ago` : minutes > 0 ? `${minutes}m ago` : 'just now';
          return {
            id: item.id,
            type: item.type.includes('donation') ? 'donation' : item.type.includes('charity') ? 'application' : 'project',
            message: item.message,
            time: timeStr,
            icon: config.icon,
            color: config.color,
          } as ActivityItem;
        }));
      }
      setError(null);
    }).catch((err: Error) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className={classes.page}>
          <Container size="xl" py={40}>
            <Box ta="center" py={80}>
              <Loader size="lg" color="sage" />
              <Text c="var(--bm-text-muted)" mt={12}>Loading platform data...</Text>
            </Box>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <ProtectedRoute allowedDemoRoles={['admin']}>
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
            {error && (
              <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" p={10}>
                <Text size="xs" fw={600}>API Error</Text>
                <Text size="xs">{error}</Text>
              </Alert>
            )}
          </Group>

          {/* Stat Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32} mt={24}>
            {[
              { label: 'Total Donations', value: formatNZD(analytics?.total_amount_minor ?? 0), color: 'terracotta', icon: IconCoin },
              { label: 'Active Charities', value: String(analytics?.active_charities ?? 0), color: 'sage', icon: IconBuilding },
              { label: 'Total Donors', value: (analytics?.active_donors ?? 0).toLocaleString(), color: 'blue', icon: IconUsers },
              { label: 'Platform Revenue', value: formatNZD(analytics?.total_platform_fee_minor ?? 0), color: 'grape', icon: IconReceipt },
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
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={16} mb={32}>
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
                      {pendingCount} Pending Apps
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
                    <IconBuilding size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      Manage Charities
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      View all applications
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

            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/projects"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="violet" variant="light">
                    <IconReceipt size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      Review Projects
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      Approve & moderate projects
                    </Text>
                  </Box>
                </Group>
                <IconArrowRight size={18} color="var(--bm-text-muted)" />
              </Group>
            </Card>

            <Card
              padding="lg" radius="lg" withBorder className={classes.actionCard}
              component={Link} href="/admin/donations"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between">
                <Group gap={12}>
                  <ThemeIcon size={40} radius="md" color="pink" variant="light">
                    <IconHeart size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)">
                      Donations
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      Manage transactions & refunds
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

            {activity.length === 0 && !analytics ? (
              <Box ta="center" py={32}>
                <Text c="var(--bm-text-muted)" size="sm">Activity data will appear once the backend is connected.</Text>
              </Box>
            ) : activity.length === 0 ? (
              <Box ta="center" py={32}>
                <Text c="var(--bm-text-muted)" size="sm">
                  Platform stats loaded: {analytics?.total_donations ?? 0} total donations, {analytics?.active_charities ?? 0} charities, {analytics?.active_donors ?? 0} donors.
                </Text>
              </Box>
            ) : (
              activity.map(item => {
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
              })
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
