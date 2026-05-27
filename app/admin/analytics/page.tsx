'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Box, Group, Button,
  Card, SimpleGrid, ThemeIcon, Alert, Stack, Loader
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconArrowLeft,
  IconTrendingUp, IconChartPie,
  IconDownload, IconReceipt
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminPlatformAnalytics,
  type PlatformAnalytics,
} from '@/lib/api';
import classes from './page.module.css';

function formatNZD(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString('en-NZ')}`;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminPlatformAnalytics()
      .then(setAnalytics)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Transform API data for charts
  const trendData = analytics?.monthly_trend.map(t => ({
    month: t.month.length > 5 ? t.month.slice(5) : t.month,
    volume: t.donations_minor / 100,
    newDonors: t.new_donors,
    donationCount: t.donation_count,
  })) ?? [];

  // Calculate derived metrics
  const totalVolume = analytics?.total_amount_minor ?? 0;
  const totalFees = analytics?.total_platform_fee_minor ?? 0;
  const avgDonation = analytics?.avg_donation_minor ?? 0;
  const monthCount = trendData.length || 1;
  const avgMonthlyFee = totalFees / monthCount;

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
          <Group justify="space-between" mb={24}>
            <Box>
              <Group gap={8} mb={4}>
                <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Platform Analytics</Title>
            </Box>
            <Group>
              <Button color="terracotta" radius="xl" leftSection={<IconDownload size={16} />}>
                Export Report
              </Button>
            </Group>
          </Group>

          {loading && (
            <Box ta="center" py={80}>
              <Loader size="lg" color="sage" />
              <Text c="var(--bm-text-muted)" mt={12}>Loading analytics data...</Text>
            </Box>
          )}

          {error && (
            <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={24}>
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          {!loading && analytics && (
            <>
              {/* Key Metrics row */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={16} mb={32}>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <Group justify="space-between" mb={12}>
                    <Text size="sm" fw={600} c="var(--bm-text-muted)">Total Platform Volume</Text>
                    <ThemeIcon size={32} radius="md" color="green" variant="light">
                      <IconTrendingUp size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={900} c="var(--bm-text-dark)">{formatNZD(totalVolume)}</Text>
                  <Text size="xs" c="green.7">{analytics.total_donations} total donations</Text>
                </Card>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <Group justify="space-between" mb={12}>
                    <Text size="sm" fw={600} c="var(--bm-text-muted)">Average Donation</Text>
                    <ThemeIcon size={32} radius="md" color="blue" variant="light">
                      <IconChartPie size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={900} c="var(--bm-text-dark)">{formatNZD(avgDonation)}</Text>
                  <Text size="xs" c="var(--bm-text-muted)">{analytics.active_charities} active charities</Text>
                </Card>
                <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
                  <Group justify="space-between" mb={12}>
                    <Text size="sm" fw={600} c="var(--bm-text-muted)">Avg Platform Fee Revenue</Text>
                    <ThemeIcon size={32} radius="md" color="grape" variant="light">
                      <IconReceipt size={16} />
                    </ThemeIcon>
                  </Group>
                  <Text size="xl" fw={900} c="var(--bm-text-dark)">{formatNZD(Math.round(avgMonthlyFee))}/mo</Text>
                  <Text size="xs" c="var(--bm-text-muted)">Last {monthCount} months average</Text>
                </Card>
              </SimpleGrid>

              {/* Charts */}
              <Stack gap={24}>
                {/* Main Area Chart for Volume */}
                <Card className={classes.chartCard}>
                  <Box mb={24}>
                    <Text fw={700} size="lg" c="var(--bm-text-dark)">Donation Volume Over Time</Text>
                    <Text size="sm" c="var(--bm-text-muted)">Total funds raised across all platform charities (NZD)</Text>
                  </Box>
                  <Box h={350}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--bm-terracotta-dark)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--bm-terracotta-dark)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                        <RechartsTooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => `$${Number(value).toLocaleString('en-NZ')}`}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="volume" stroke="var(--bm-terracotta-dark)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>

                {/* New Donors Bar Chart */}
                <Card className={classes.chartCard}>
                  <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>New Donor Acquisition</Text>
                  <Text size="sm" c="var(--bm-text-muted)" mb={24}>Number of first-time donors per month</Text>
                  <Box h={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 12}} />
                        <RechartsTooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`${value} donors`, 'New Donors']}
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="newDonors" fill="var(--bm-sage-dark)" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Stack>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
