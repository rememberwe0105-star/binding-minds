'use client';

import {
  Container, Title, Text, Box, Group, Button,
  Card, SimpleGrid, ThemeIcon, Alert, Stack
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconArrowLeft,
  IconTrendingUp, IconChartPie,
  IconDownload, IconReceipt
} from '@tabler/icons-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock Analytics Data ──────────────────────────────────────────
const PLATFORM_TRENDS = [
  { month: 'Jan', volume: 85000, revenue: 850, newDonors: 120 },
  { month: 'Feb', volume: 92000, revenue: 920, newDonors: 145 },
  { month: 'Mar', volume: 105000, revenue: 1050, newDonors: 180 },
  { month: 'Apr', volume: 98000, revenue: 980, newDonors: 155 },
  { month: 'May', volume: 125000, revenue: 1250, newDonors: 210 },
  { month: 'Jun', volume: 148000, revenue: 1480, newDonors: 250 },
];

const CATEGORY_DATA = [
  { name: 'Community', value: 45 },
  { name: 'Education', value: 25 },
  { name: 'Environment', value: 15 },
  { name: 'Health', value: 10 },
  { name: 'Animal Welfare', value: 5 },
];
const COLORS = ['#e67e5e', '#4b6bfb', '#8eb897', '#fab005', '#be4bdb'];

function formatNZD(value: number): string {
  return `$${value.toLocaleString('en-NZ')}`;
}

export default function AdminAnalyticsPage() {
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
              <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" p={10}>
                <Text size="xs" fw={600}>Demo Mode</Text>
              </Alert>
              <Button color="terracotta" radius="xl" leftSection={<IconDownload size={16} />}>
                Export Report
              </Button>
            </Group>
          </Group>

          {/* Key Metrics row */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={16} mb={32}>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <Group justify="space-between" mb={12}>
                <Text size="sm" fw={600} c="var(--bm-text-muted)">Avg. Monthly Growth</Text>
                <ThemeIcon size={32} radius="md" color="green" variant="light">
                  <IconTrendingUp size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={900} c="var(--bm-text-dark)">+12.4%</Text>
              <Text size="xs" c="green.7">vs Previous 6 Months</Text>
            </Card>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <Group justify="space-between" mb={12}>
                <Text size="sm" fw={600} c="var(--bm-text-muted)">Project Success Rate</Text>
                <ThemeIcon size={32} radius="md" color="blue" variant="light">
                  <IconChartPie size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={900} c="var(--bm-text-dark)">87%</Text>
              <Text size="xs" c="var(--bm-text-muted)">Fully funded campaigns</Text>
            </Card>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <Group justify="space-between" mb={12}>
                <Text size="sm" fw={600} c="var(--bm-text-muted)">Avg Platform Fee Revenue</Text>
                <ThemeIcon size={32} radius="md" color="grape" variant="light">
                  <IconReceipt size={16} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={900} c="var(--bm-text-dark)">$1,083/mo</Text>
              <Text size="xs" c="var(--bm-text-muted)">Last 6 months average</Text>
            </Card>
          </SimpleGrid>

          {/* Charts Row */}
          <Stack gap={24}>
            {/* Main Area Chart for Volume */}
            <Card className={classes.chartCard}>
              <Box mb={24}>
                <Text fw={700} size="lg" c="var(--bm-text-dark)">Donation Volume Over Time</Text>
                <Text size="sm" c="var(--bm-text-muted)">Total funds raised across all platform charities (NZD)</Text>
              </Box>
              <Box h={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PLATFORM_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      formatter={(value: any) => formatNZD(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="var(--bm-terracotta-dark)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
              {/* Category Pie Chart */}
              <Card className={classes.chartCard}>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>Donations by Category</Text>
                <Text size="sm" c="var(--bm-text-muted)" mb={24}>Distribution of total platform funds</Text>
                <Box h={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_DATA}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <RechartsTooltip formatter={(value: any) => `${value}%`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>

              {/* New Donors Bar Chart */}
              <Card className={classes.chartCard}>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>New Donor Acquisition</Text>
                <Text size="sm" c="var(--bm-text-muted)" mb={24}>Number of first-time donors per month</Text>
                <Box h={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PLATFORM_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            </SimpleGrid>
          </Stack>
        </Container>
      </main>
      <Footer />
    </>
  );
}
