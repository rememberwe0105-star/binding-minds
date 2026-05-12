'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Box,
  Group,
  ThemeIcon,
  Button,
  Avatar,
  Table,
  Badge,
  Tabs,
  TextInput,
  Select,
  Slider,
  Divider,
} from '@mantine/core';
import {
  IconHeart,
  IconReceipt,
  IconCoin,
  IconCalendar,
  IconLeaf,
  IconDownload,
  IconArrowRight,
  IconSearch,
  IconChartBar,
  IconFileText,
  IconShieldCheck,
  IconCalculator,
  IconInfoCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockDonations,
  mockReceipts,
  formatNZD,
  formatDate,
  getTotalDonated,
  getEstimatedTaxRefund,
  getUniqueCampaigns,
  getMonthlyTotals,
  getCategoryTotals,
} from '@/data/donations';
import classes from './page.module.css';

// ===================== Overview 탭 =====================
function OverviewTab() {
  const completedDonations = mockDonations.filter((d) => d.status === 'completed');
  const totalDonated = getTotalDonated(mockDonations);
  const taxRefund = getEstimatedTaxRefund(totalDonated);
  const uniqueCampaigns = getUniqueCampaigns(mockDonations);
  const monthlyTotals = getMonthlyTotals(mockDonations);
  const categoryTotals = getCategoryTotals(mockDonations);
  const maxMonthly = Math.max(...monthlyTotals.map((m) => m.total), 1);

  // 최근 기부 5건
  const recentDonations = [...completedDonations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      {/* 통계 카드 */}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing={16} mb={32}>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="terracotta" variant="light" mb={12}>
            <IconCoin size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(totalDonated)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donated</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={12}>
            <IconReceipt size={20} />
          </ThemeIcon>
          <Text className={classes.statValue} c="var(--bm-sage-dark)">{formatNZD(taxRefund)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Est. Tax Refund</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="blue" variant="light" mb={12}>
            <IconHeart size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{uniqueCampaigns}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Campaigns Supported</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="grape" variant="light" mb={12}>
            <IconCalendar size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{completedDonations.length}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donations</Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={20} mb={32}>
        {/* 월별 차트 */}
        <Card padding="lg" radius="lg" withBorder className={classes.chartCard}>
          <Group justify="space-between" mb={12}>
            <Text fw={700} size="sm" c="var(--bm-text-dark)">Monthly Giving</Text>
            <Text size="xs" c="var(--bm-text-muted)">2026</Text>
          </Group>
          <div className={classes.chartContainer}>
            {monthlyTotals.map((m) => (
              <div key={m.month} className={classes.chartBar}>
                <Text className={classes.barAmount}>
                  {m.total > 0 ? `$${m.total}` : ''}
                </Text>
                <div
                  className={classes.barFill}
                  style={{
                    height: `${m.total > 0 ? (m.total / maxMonthly) * 100 : 2}%`,
                    opacity: m.total > 0 ? 1 : 0.15,
                  }}
                />
                <Text className={classes.barLabel}>{m.month}</Text>
              </div>
            ))}
          </div>
        </Card>

        {/* 카테고리별 분포 */}
        <Card padding="lg" radius="lg" withBorder className={classes.chartCard}>
          <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={20}>
            Giving by Category
          </Text>
          {categoryTotals.map((cat) => {
            const maxCat = categoryTotals[0]?.total || 1;
            return (
              <div key={cat.category} className={classes.categoryBar}>
                <Text className={classes.categoryLabel}>{cat.category}</Text>
                <div
                  className={classes.categoryFill}
                  style={{ width: `${(cat.total / maxCat) * 100}%` }}
                />
                <Text className={classes.categoryAmount}>{formatNZD(cat.total)}</Text>
              </div>
            );
          })}
        </Card>
      </SimpleGrid>

      {/* 최근 기부 */}
      <Card padding="lg" radius="lg" withBorder>
        <Group justify="space-between" mb={16}>
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Recent Donations</Text>
          <Button variant="subtle" color="terracotta" size="xs">
            View All →
          </Button>
        </Group>

        {recentDonations.map((d) => (
          <div key={d.id} className={classes.recentItem}>
            <Box>
              <Text size="sm" fw={500} c="var(--bm-text-dark)">{d.campaignName}</Text>
              <Text size="xs" c="var(--bm-text-muted)">{d.charityName} · {formatDate(d.date)}</Text>
            </Box>
            <Text size="sm" fw={700} c="var(--bm-sage-dark)">{formatNZD(d.amount)}</Text>
          </div>
        ))}
      </Card>
    </>
  );
}

// ===================== Donation History 탭 =====================
function DonationHistoryTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>('all');

  const filtered = useMemo(() => {
    let result = [...mockDonations];

    // 검색
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.campaignName.toLowerCase().includes(q));
    }

    // 상태 필터
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    // 날짜 필터
    if (dateFilter === 'thisYear') {
      const year = new Date().getFullYear();
      result = result.filter((d) => new Date(d.date).getFullYear() === year);
    } else if (dateFilter === 'lastYear') {
      const year = new Date().getFullYear() - 1;
      result = result.filter((d) => new Date(d.date).getFullYear() === year);
    }

    // 최신순 정렬
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [search, statusFilter, dateFilter]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'refunded': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      {/* 필터 바 */}
      <div className={classes.filterBar}>
        <TextInput
          className={classes.searchInput}
          placeholder="Search campaigns..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
        />
        <Select
          placeholder="Status"
          data={[
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'refunded', label: 'Refunded' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          radius="md"
          w={150}
        />
        <Select
          placeholder="Period"
          data={[
            { value: 'all', label: 'All Time' },
            { value: 'thisYear', label: 'This Year' },
            { value: 'lastYear', label: 'Last Year' },
          ]}
          value={dateFilter}
          onChange={setDateFilter}
          radius="md"
          w={150}
        />
      </div>

      <Text size="xs" c="var(--bm-text-muted)" mb={12}>
        {filtered.length} donation{filtered.length !== 1 ? 's' : ''} found
      </Text>

      <Card padding="lg" radius="lg" withBorder>
        <div className={classes.tableWrapper}>
          {filtered.length > 0 ? (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Campaign</Table.Th>
                  <Table.Th>Charity</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td>
                      <Link href={`/campaigns/${d.campaignSlug}`} className={classes.campaignLink}>
                        {d.campaignName}
                      </Link>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="var(--bm-text-muted)">{d.charityName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>{formatNZD(d.amount)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{formatDate(d.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColor(d.status)} variant="light" size="sm">
                        {d.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Box className={classes.emptyState}>
              <IconSearch size={40} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
              <Text size="md" c="var(--bm-text-muted)" mt={12}>
                No donations match your filters.
              </Text>
            </Box>
          )}
        </div>
      </Card>
    </>
  );
}

// ===================== Tax Summary 탭 =====================
function TaxSummaryTab() {
  const totalDonated = getTotalDonated(mockDonations);
  const taxRefund = getEstimatedTaxRefund(totalDonated);
  const qualifyingCount = mockDonations.filter((d) => d.status === 'completed').length;

  const [simIncome, setSimIncome] = useState(65000);
  const [simDonation, setSimDonation] = useState(totalDonated);
  const simRefund = Math.round(simDonation * 0.3333);

  const taxGuide = [
    {
      step: '1',
      title: 'Gather Your Receipts',
      desc: 'Download your consolidated tax summary from this page — we\'ve done the hard work for you.',
    },
    {
      step: '2',
      title: 'Log In to myIR',
      desc: 'Visit ird.govt.nz and log in to your myIR account.',
    },
    {
      step: '3',
      title: 'Claim Your Credit',
      desc: 'Under "Income Tax", select "Donation Tax Credits" and upload or enter your total donations.',
    },
    {
      step: '4',
      title: 'Receive Your Refund',
      desc: 'IRD processes claims within 4-8 weeks. Your refund will be deposited directly to your bank account.',
    },
  ];

  return (
    <>
      {/* Tax Hero Banner */}
      <div className={classes.taxHero}>
        <div className={classes.taxHeroBlob} />
        <Group justify="space-between" align="flex-end" wrap="wrap" gap={24} style={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Text size="sm" fw={600} c="rgba(255,255,255,0.6)" tt="uppercase" mb={4}>
              Your Estimated Tax Refund
            </Text>
            <Text className={classes.taxRefundAmount}>{formatNZD(taxRefund)}</Text>
            <Text size="sm" c="rgba(255,255,255,0.6)" mt={8}>
              Based on {formatNZD(totalDonated)} in qualifying donations across {qualifyingCount} transactions
            </Text>
          </Box>
          <Button
            color="terracotta"
            radius="xl"
            size="md"
            leftSection={<IconDownload size={18} />}
            style={{ background: 'white', color: 'var(--bm-sage-dark)' }}
          >
            Download Tax Summary
          </Button>
        </Group>
      </div>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={20} mb={24}>
        {/* Tax Calculator */}
        <Card padding="xl" radius="lg" withBorder className={classes.calculatorCard}>
          <Group gap={8} mb={16}>
            <IconCalculator size={20} color="var(--bm-sage-dark)" />
            <Text fw={700} size="md" c="var(--bm-text-dark)">Tax Credit Calculator</Text>
          </Group>
          <Text size="sm" c="var(--bm-text-muted)" mb={24}>
            Slide to estimate your tax refund based on your annual donations.
          </Text>

          <Box mb={24}>
            <Text size="xs" fw={600} c="var(--bm-text-dark)" mb={8}>
              Annual Income: {formatNZD(simIncome)}
            </Text>
            <div className={classes.sliderContainer}>
              <Slider
                value={simIncome}
                onChange={setSimIncome}
                min={20000}
                max={200000}
                step={5000}
                color="sage"
                marks={[
                  { value: 20000, label: '$20k' },
                  { value: 100000, label: '$100k' },
                  { value: 200000, label: '$200k' },
                ]}
              />
            </div>
          </Box>

          <Box mb={24}>
            <Text size="xs" fw={600} c="var(--bm-text-dark)" mb={8}>
              Annual Donations: {formatNZD(simDonation)}
            </Text>
            <div className={classes.sliderContainer}>
              <Slider
                value={simDonation}
                onChange={setSimDonation}
                min={0}
                max={Math.min(simIncome, 50000)}
                step={50}
                color="terracotta"
                marks={[
                  { value: 0, label: '$0' },
                  { value: Math.min(simIncome, 50000), label: formatNZD(Math.min(simIncome, 50000)) },
                ]}
              />
            </div>
          </Box>

          <div className={classes.refundResult}>
            <Text size="xs" c="var(--bm-text-muted)" mb={4}>Your Estimated Refund</Text>
            <Text className={classes.refundValue}>{formatNZD(simRefund)}</Text>
            <Text size="xs" c="var(--bm-text-muted)" mt={4}>
              That&apos;s {simIncome > 0 ? ((simRefund / simIncome) * 100).toFixed(1) : '0'}% of your income back
            </Text>
          </div>
        </Card>

        {/* Tax Guide */}
        <Card padding="xl" radius="lg" withBorder>
          <Group gap={8} mb={16}>
            <IconInfoCircle size={20} color="var(--bm-terracotta)" />
            <Text fw={700} size="md" c="var(--bm-text-dark)">How to Claim</Text>
          </Group>
          <Text size="sm" c="var(--bm-text-muted)" mb={20}>
            New Zealand offers a 33.33% tax credit on donations to approved organisations.
            Here&apos;s how to claim yours:
          </Text>

          {taxGuide.map((item) => (
            <div key={item.step} className={classes.guideItem}>
              <ThemeIcon size={28} radius="xl" color="sage" variant="light">
                <Text size="xs" fw={800}>{item.step}</Text>
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={600} c="var(--bm-text-dark)">{item.title}</Text>
                <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>{item.desc}</Text>
              </Box>
            </div>
          ))}
        </Card>
      </SimpleGrid>
    </>
  );
}

// ===================== Receipt Vault 탭 =====================
function ReceiptVaultTab() {
  return (
    <>
      <Group justify="space-between" mb={24}>
        <Box>
          <Text fw={700} size="md" c="var(--bm-text-dark)">
            Your Donation Receipts
          </Text>
          <Text size="sm" c="var(--bm-text-muted)">
            {mockReceipts.length} receipt{mockReceipts.length !== 1 ? 's' : ''} from verified organisations
          </Text>
        </Box>
        <Button
          color="terracotta"
          radius="xl"
          leftSection={<IconDownload size={16} />}
          disabled={mockReceipts.length === 0}
        >
          Download All (ZIP)
        </Button>
      </Group>

      {mockReceipts.length > 0 ? (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={16}>
          {mockReceipts.map((r) => (
            <Card key={r.id} padding="lg" radius="lg" withBorder className={classes.receiptCard}>
              <Group justify="space-between" mb={12}>
                <Badge
                  size="sm"
                  variant="light"
                  className={classes.irdBadge}
                  leftSection={<IconShieldCheck size={12} />}
                >
                  IRD Approved
                </Badge>
                <Text size="xs" c="var(--bm-text-muted)">{formatDate(r.date)}</Text>
              </Group>

              <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={4} lineClamp={2}>
                {r.campaignName}
              </Text>
              <Text size="xs" c="var(--bm-text-muted)" mb={12}>
                {r.charityName}
              </Text>

              <Divider mb={12} color="rgba(143, 151, 121, 0.08)" />

              <Group justify="space-between" align="center">
                <Text size="lg" fw={800} c="var(--bm-sage-dark)">
                  {formatNZD(r.amount)}
                </Text>
                <Button
                  variant="light"
                  color="sage"
                  size="xs"
                  radius="md"
                  leftSection={<IconDownload size={14} />}
                >
                  PDF
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card padding="xl" radius="lg" withBorder>
          <Box className={classes.emptyState}>
            <IconFileText size={48} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
            <Text size="md" c="var(--bm-text-muted)" mt={12}>
              No receipts yet. Your donation receipts will appear here.
            </Text>
            <Button
              component={Link}
              href="/campaigns"
              color="terracotta"
              mt={20}
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
            >
              Make Your First Donation
            </Button>
          </Box>
        </Card>
      )}
    </>
  );
}

// ===================== 메인 대시보드 =====================
function DashboardContent() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="lg">
          {/* 인사 */}
          <Group gap={16} mb={32}>
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName || 'User'}
              size={56}
              radius="xl"
              color="sage"
            >
              {user?.displayName?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Title order={2} className={classes.greeting}>
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}!
              </Title>
              <Text size="sm" c="var(--bm-text-muted)">
                Here&apos;s your giving journey at a glance.
              </Text>
            </Box>
          </Group>

          {/* 탭 네비게이션 */}
          <Tabs defaultValue="overview" color="sage" radius="md">
            <Tabs.List className={classes.tabList}>
              <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<IconCalendar size={16} />}>
                Donation History
              </Tabs.Tab>
              <Tabs.Tab value="tax" leftSection={<IconCalculator size={16} />}>
                Tax Summary
              </Tabs.Tab>
              <Tabs.Tab value="receipts" leftSection={<IconFileText size={16} />}>
                Receipt Vault
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview">
              <OverviewTab />
            </Tabs.Panel>

            <Tabs.Panel value="history">
              <DonationHistoryTab />
            </Tabs.Panel>

            <Tabs.Panel value="tax">
              <TaxSummaryTab />
            </Tabs.Panel>

            <Tabs.Panel value="receipts">
              <ReceiptVaultTab />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
