'use client';

import { useState, useMemo } from 'react';
import { useMediaQuery } from '@mantine/hooks';
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
  Select,
  Slider,
  Divider,
  Loader,
  Alert,
  Pagination,
  Tooltip,
  Modal,
  Stack,
  ActionIcon,
} from '@mantine/core';
import {
  IconHeart,
  IconReceipt,
  IconCoin,
  IconCalendar,
  IconDownload,
  IconArrowRight,
  IconSearch,
  IconChartBar,
  IconFileText,
  IconShieldCheck,
  IconCalculator,
  IconInfoCircle,
  IconAlertCircle,
  IconMoodEmpty,
  IconGift,
  IconLoader2,
  IconHeartFilled,
  IconSparkles,
  IconTree,
  IconToolsKitchen2,
  IconSchool,
  IconPaw,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RewardsTab } from '@/components/RewardsTab';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatNZD,
  getEstimatedTaxRefund,
} from '@/data/donations';
import {
  useApiDonations,
  statusColor,
  statusLabel,
  formatMinor,
} from '@/hooks/useApiDonations';
import { useRewards } from '@/hooks/useRewards';
import { downloadReceiptPdf, downloadAllReceiptsPdf } from '@/lib/generateReceiptPdf';
import {
  downloadTaxSummaryPdf,
  getAvailableTaxYears,
  filterByTaxYear,
} from '@/lib/generateTaxSummaryPdf';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getCampaignBySlug, getProgress, formatCurrency } from '@/data/campaigns';
import type { Campaign } from '@/data/campaigns';
import { getOrganizationBySlug } from '@/data/organizations';
import type { Organization } from '@/data/organizations';
import classes from './page.module.css';

// ── 모바일 PDF 안내 모달 ────────────────────────────────────
function MobilePdfNotice({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="📄 PDF 다운로드 안내"
      centered
      radius="lg"
      size="sm"
    >
      <Stack gap={16} pb={8}>
        <Text size="sm" c="var(--bm-text-dark)" lh={1.7}>
          PDF 다운로드는 <strong>PC(컴퓨터) 환경</strong>에서 이용해 주세요.
        </Text>
        <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
          모바일 브라우저에서는 PDF 저장 방식이 기기마다 달라
          정상적으로 저장되지 않을 수 있습니다.
        </Text>
        <Box
          p={12}
          style={{
            background: 'var(--bm-sage-bg)',
            borderRadius: 8,
            borderLeft: '3px solid var(--bm-sage)',
          }}
        >
          <Text size="xs" c="var(--bm-sage-dark)" fw={600} mb={4}>
            💡 이용 방법
          </Text>
          <Text size="xs" c="var(--bm-text-muted)" lh={1.7}>
            PC에서 <strong>binding-minds.vercel.app</strong>에 접속하신 후
            대시보드 → Receipt Vault 또는 Donation Tax Credit 탭에서 다운로드해 주세요.
          </Text>
        </Box>
        <Button
          onClick={onClose}
          color="sage"
          radius="xl"
          fullWidth
          mt={4}
        >
          확인
        </Button>
      </Stack>
    </Modal>
  );
}

// ── 날짜 포맷 유틸 ──────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ===================== Overview 탭 (API 연동) =====================
function OverviewTab() {
  const { items, total, loading, error } = useApiDonations(5);

  const succeededItems = items.filter((d) => d.donation_status === 'succeeded');
  const totalMinor = succeededItems.reduce((s, d) => s + d.donation_amount_minor, 0);
  const totalNZD = totalMinor / 100;
  const taxRefund = getEstimatedTaxRefund(totalNZD);
  const uniqueCharities = new Set(items.map((d) => d.charity_display_name)).size;

  if (loading) {
    return (
      <Box ta="center" py={60}>
        <Loader size="lg" color="sage" />
        <Text c="var(--bm-text-muted)" mt={12}>Loading your donation data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">
        {error}
      </Alert>
    );
  }

  return (
    <>
      {/* 통계 카드 */}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing={16} mb={32}>
        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="terracotta" variant="light" mb={12}>
            <IconCoin size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{formatNZD(totalNZD)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donated</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={12}>
            <IconReceipt size={20} />
          </ThemeIcon>
          <Text className={classes.statValue} c="var(--bm-sage-dark)">{formatNZD(taxRefund)}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Est. Tax Refund (33.33%)</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="blue" variant="light" mb={12}>
            <IconHeart size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{uniqueCharities}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Charities Supported</Text>
        </Card>

        <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
          <ThemeIcon size={40} radius="md" color="grape" variant="light" mb={12}>
            <IconCalendar size={20} />
          </ThemeIcon>
          <Text className={classes.statValue}>{total}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Total Donations</Text>
        </Card>
      </SimpleGrid>

      {/* 최근 기부 */}
      <Card padding="lg" radius="lg" withBorder>
        <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={16}>Recent Donations</Text>
        {items.length === 0 ? (
          <Box ta="center" py={40}>
            <IconMoodEmpty size={40} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
            <Text c="var(--bm-text-muted)" mt={12}>No donations yet. Make your first donation!</Text>
            <Button component={Link} href="/projects" color="terracotta" mt={16} radius="xl"
              rightSection={<IconArrowRight size={16} />}>
              Explore Projects
            </Button>
          </Box>
        ) : (
          items.map((d, i) => (
            <div key={i} className={classes.recentItem}>
              <Box>
                <Text size="sm" fw={500} c="var(--bm-text-dark)">
                  {d.charity_display_name || '(단체 미연결)'}
                </Text>
                <Text size="xs" c="var(--bm-text-muted)">
                  {d.currency_code} · {formatDate(d.paid_at ?? d.created_at)}
                </Text>
              </Box>
              <Box ta="right">
                <Text size="sm" fw={700} c="var(--bm-sage-dark)">
                  {formatMinor(d.donation_amount_minor, d.currency_code)}
                </Text>
                <Badge size="xs" color={statusColor(d.donation_status)} variant="light">
                  {statusLabel(d.donation_status)}
                </Badge>
              </Box>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

// ===================== My Impact 탭 =====================
const IMPACT_MONTHLY = [
  { month: 'Oct', amount: 50 },
  { month: 'Nov', amount: 120 },
  { month: 'Dec', amount: 200 },
  { month: 'Jan', amount: 80 },
  { month: 'Feb', amount: 150 },
  { month: 'Mar', amount: 300 },
];

const IMPACT_CATEGORIES = [
  { name: 'Environment', value: 40 },
  { name: 'Education', value: 25 },
  { name: 'Community', value: 20 },
  { name: 'Health', value: 10 },
  { name: 'Animal Welfare', value: 5 },
];
const IMPACT_COLORS = ['#8eb897', '#4b6bfb', '#e67e5e', '#fab005', '#be4bdb'];

function ImpactTab() {
  const { items } = useApiDonations(100);
  const succeededItems = items.filter((d) => d.donation_status === 'succeeded');
  const totalNZD = succeededItems.reduce((s, d) => s + d.donation_amount_minor, 0) / 100;

  // Impact analogies based on total donated
  const treesPlanted = Math.floor(totalNZD / 25);
  const mealsProvided = Math.floor(totalNZD / 8);
  const booksForKids = Math.floor(totalNZD / 15);
  const shelterNights = Math.floor(totalNZD / 35);

  return (
    <Stack gap={24}>
      {/* Impact Analogies */}
      <Box>
        <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Your Real-World Impact</Text>
        <Text size="sm" c="var(--bm-text-muted)" mb={16}>Here&apos;s what your <strong>{formatNZD(totalNZD)}</strong> in donations could achieve:</Text>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={12}>
          {[
            { icon: IconTree, label: 'Native trees planted', value: treesPlanted, color: 'sage' },
            { icon: IconToolsKitchen2, label: 'Meals for families', value: mealsProvided, color: 'terracotta' },
            { icon: IconSchool, label: 'Books for children', value: booksForKids, color: 'blue' },
            { icon: IconPaw, label: 'Shelter nights for animals', value: shelterNights, color: 'grape' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} padding="lg" radius="lg" withBorder className={classes.statCard}
              style={{ background: 'linear-gradient(135deg, rgba(142,184,151,0.04) 0%, rgba(255,255,255,1) 100%)' }}
            >
              <ThemeIcon size={36} radius="md" color={color} variant="light" mb={8}>
                <Icon size={18} />
              </ThemeIcon>
              <Text fw={800} size="xl" c="var(--bm-text-dark)">{value}</Text>
              <Text size="xs" c="var(--bm-text-muted)" lh={1.4}>{label}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Charts Row */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        {/* Monthly Trend */}
        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Monthly Giving Trend</Text>
          <Text size="xs" c="var(--bm-text-muted)" mb={20}>Your donation pattern over the last 6 months</Text>
          <Box h={220}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={IMPACT_MONTHLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bm-sage-dark)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--bm-sage-dark)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 11}} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#868e96', fontSize: 11}} tickFormatter={(v) => `$${v}`} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RechartsTooltip formatter={(value: any) => [`$${value}`, 'Donated']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="var(--bm-sage-dark)" strokeWidth={2.5} fillOpacity={1} fill="url(#impactGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Category Breakdown */}
        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Giving by Category</Text>
          <Text size="xs" c="var(--bm-text-muted)" mb={12}>Where your donations are making an impact</Text>
          <Box h={220}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={IMPACT_CATEGORIES} innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" cx="50%" cy="45%">
                  {IMPACT_CATEGORIES.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={IMPACT_COLORS[index % IMPACT_COLORS.length]} />
                  ))}
                </Pie>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RechartsTooltip formatter={(value: any) => `${value}%`} />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </SimpleGrid>

      {/* Encouragement */}
      <Card padding="lg" radius="lg" withBorder
        style={{ background: 'linear-gradient(135deg, rgba(142,184,151,0.08) 0%, rgba(230,126,94,0.06) 100%)', textAlign: 'center' }}
      >
        <Group gap={8} justify="center" mb={8}>
          <IconSparkles size={18} color="var(--bm-terracotta-dark)" />
          <Text fw={700} size="md" c="var(--bm-text-dark)">You&apos;re making a difference!</Text>
        </Group>
        <Text size="sm" c="var(--bm-text-muted)" maw={500} mx="auto" lh={1.6}>
          Every dollar you donate helps build a stronger, more compassionate New Zealand.
          Keep it up — your generosity inspires others to give too.
        </Text>
      </Card>
    </Stack>
  );
}

// ===================== Donation History 탭 (API 연동) =====================
function DonationHistoryTab() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { items, total, page, pageSize, loading, error, setPage } = useApiDonations(20);

  // 클라이언트 사이드 상태 필터 (API에 status 필터가 없으므로)
  const filtered = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((d) => {
      if (statusFilter === 'completed') return d.donation_status === 'succeeded';
      if (statusFilter === 'pending') return d.donation_status === 'checkout_created';
      if (statusFilter === 'refunded') return d.donation_status === 'refunded';
      return true;
    });
  }, [items, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {/* 필터 바 */}
      <div className={classes.filterBar}>
        <Select
          placeholder="All Statuses"
          data={[
            { value: 'completed', label: '✅ Completed' },
            { value: 'pending', label: '⏳ Pending' },
            { value: 'refunded', label: '↩️ Refunded' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          radius="md"
          w={180}
        />
      </div>

      {loading && (
        <Box ta="center" py={40}>
          <Loader size="md" color="sage" />
        </Box>
      )}

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md" mb={16}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Text size="xs" c="var(--bm-text-muted)" mb={12}>
            {total} donation{total !== 1 ? 's' : ''} total
          </Text>

          <Card padding="lg" radius="lg" withBorder>
            <div className={classes.tableWrapper}>
              {filtered.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Charity</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Currency</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((d, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {d.charity_display_name || '(단체 미연결)'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {formatMinor(d.donation_amount_minor, d.currency_code)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="outline" color="sage">{d.currency_code}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {formatDate(d.paid_at ?? d.created_at)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={statusColor(d.donation_status)} variant="light" size="sm">
                            {statusLabel(d.donation_status)}
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
                    No donations found.
                  </Text>
                </Box>
              )}
            </div>
          </Card>

          {totalPages > 1 && (
            <Group justify="center" mt={20}>
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                color="sage"
                radius="md"
              />
            </Group>
          )}
        </>
      )}
    </>
  );
}

// ===================== Tax Summary 탭 (API 연동) =====================
function TaxSummaryTab() {
  const { user } = useAuth();
  const { items, loading } = useApiDonations(500); // 백엔드 제한 완화 후 500으로 설정

  // NZ 과세연도 목록 및 선택
  const availableYears = useMemo(() => getAvailableTaxYears(items), [items]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showMobileNotice, setShowMobileNotice] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)', true);

  // 선택된 연도 (기본값: 가장 최근 연도)
  const taxYear = selectedYear ?? availableYears[0] ?? new Date().getFullYear();

  // 해당 연도 기부 내역 필터링
  const yearItems = useMemo(
    () => filterByTaxYear(items, taxYear),
    [items, taxYear],
  );

  // 전체 집계 (Hero 배너용 — 전체 NZD 기준)
  const allSucceeded = items.filter((d) => d.donation_status === 'succeeded');
  const totalDonated = allSucceeded.reduce((s, d) => s + d.donation_amount_minor / 100, 0);
  const taxRefund = getEstimatedTaxRefund(totalDonated);

  const [simIncome, setSimIncome] = useState(65000);
  const [simDonation, setSimDonation] = useState(totalDonated);
  const simRefund = Math.round(simDonation * 0.3333);

  const donorName = user?.displayName || user?.email || 'Valued Donor';
  const donorEmail = user?.email || undefined;

  const handleDownload = async () => {
    if (yearItems.length === 0) return;
    if (isMobile) { setShowMobileNotice(true); return; }
    setDownloading(true);
    try {
      await downloadTaxSummaryPdf({
        items: yearItems,
        donorName,
        donorEmail,
        taxYear,
      });
    } finally {
      setDownloading(false);
    }
  };

  // 연도 드롭다운 데이터
  const yearOptions = availableYears.map((yr) => ({
    value: String(yr),
    label: `${yr} Tax Year  (1 Apr ${yr - 1} – 31 Mar ${yr})`,
  }));

  const taxGuide = [
    {
      step: '1',
      title: 'Download Your Summary',
      desc: 'Select your tax year and download the consolidated PDF from this page.',
    },
    {
      step: '2',
      title: 'Log In to myIR',
      desc: 'Visit ird.govt.nz and log in to your myIR account.',
    },
    {
      step: '3',
      title: 'Claim Your Credit',
      desc: 'Under "Income Tax", select "Donation Tax Credits" and enter your total NZD donations.',
    },
    {
      step: '4',
      title: 'Receive Your Refund',
      desc: 'IRD processes claims within 4–8 weeks. Your refund will be deposited to your bank.',
    },
  ];

  return (
    <>
      <MobilePdfNotice opened={showMobileNotice} onClose={() => setShowMobileNotice(false)} />
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
              Based on {formatNZD(totalDonated)} in qualifying NZD donations
            </Text>
          </Box>

          {/* 연도 선택 + 다운로드 버튼 */}
          <Group gap={10} align="flex-end">
            {availableYears.length > 0 && (
              <Select
                data={yearOptions}
                value={String(taxYear)}
                onChange={(v) => v && setSelectedYear(Number(v))}
                radius="xl"
                size="sm"
                w={260}
                styles={{
                  input: {
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                  },
                }}
              />
            )}
            <Tooltip
              label={
                yearItems.length === 0
                  ? 'No completed donations for this tax year'
                  : `Download ${taxYear} Giving Summary (${yearItems.length} donation${yearItems.length !== 1 ? 's' : ''})`
              }
              withArrow
            >
              <Button
                radius="xl"
                size="md"
                leftSection={
                  downloading
                    ? <IconLoader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : <IconDownload size={18} />
                }
                style={{ background: 'white', color: 'var(--bm-sage-dark)' }}
                disabled={yearItems.length === 0 || downloading || loading}
                loading={downloading}
                onClick={handleDownload}
              >
                {downloading ? 'Preparing PDF...' : 'Download Giving Summary'}
              </Button>
            </Tooltip>
          </Group>
        </Group>

        {/* 선택 연도 기부 건수 미리보기 */}
        {availableYears.length > 0 && (
          <Text size="xs" c="rgba(255,255,255,0.5)" mt={12} style={{ position: 'relative', zIndex: 1 }}>
            {yearItems.length > 0
              ? `${taxYear} Tax Year: ${yearItems.length} donation${yearItems.length !== 1 ? 's' : ''} · NZD ${
                  (yearItems.filter(d => d.currency_code === 'NZD').reduce((s, d) => s + d.donation_amount_minor, 0) / 100).toFixed(2)
                } eligible`
              : `No completed donations found for the ${taxYear} tax year.`
            }
          </Text>
        )}
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
            New Zealand offers a 33.33% tax credit on donations to approved charities.
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

// ===================== Receipt Vault 탭 (실데이터 연동) =====================
function ReceiptVaultTab() {
  const { user } = useAuth();
  const { items, loading, error } = useApiDonations(50);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showMobileNotice, setShowMobileNotice] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)', true);

  // succeeded 상태 기부건만 영수증 표시
  const receiptItems = useMemo(
    () => items.filter((d) => d.donation_status === 'succeeded'),
    [items],
  );

  const donorName = user?.displayName || user?.email || 'Valued Donor';
  const donorEmail = user?.email || undefined;

  const handleDownloadOne = async (item: typeof items[0], index: number) => {
    if (isMobile) { setShowMobileNotice(true); return; }
    setDownloadingId(index);
    try {
      await downloadReceiptPdf({ item, donorName, donorEmail, index });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (isMobile) { setShowMobileNotice(true); return; }
    setDownloadingAll(true);
    try {
      await downloadAllReceiptsPdf(receiptItems, donorName, donorEmail);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <Box ta="center" py={60}>
        <Loader size="lg" color="sage" />
        <Text c="var(--bm-text-muted)" mt={12}>Loading your receipts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <MobilePdfNotice opened={showMobileNotice} onClose={() => setShowMobileNotice(false)} />
      <Group justify="space-between" mb={24}>
        <Box>
          <Text fw={700} size="md" c="var(--bm-text-dark)">
            Your Donation Receipts
          </Text>
          <Text size="sm" c="var(--bm-text-muted)">
            {receiptItems.length} receipt{receiptItems.length !== 1 ? 's' : ''} from verified charities
          </Text>
        </Box>
        <Tooltip
          label={receiptItems.length === 0 ? 'No completed donations yet' : `Download all ${receiptItems.length} receipt${receiptItems.length !== 1 ? 's' : ''} as individual PDFs`}
          withArrow
        >
          <Button
            color="terracotta"
            radius="xl"
            leftSection={
              downloadingAll
                ? <IconLoader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <IconDownload size={16} />
            }
            disabled={receiptItems.length === 0 || downloadingAll}
            onClick={handleDownloadAll}
            loading={downloadingAll}
          >
            {downloadingAll ? 'Downloading...' : `Download All (${receiptItems.length})`}
          </Button>
        </Tooltip>
      </Group>

      {receiptItems.length > 0 ? (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={16}>
          {receiptItems.map((r, i) => (
            <Card key={i} padding="lg" radius="lg" withBorder className={classes.receiptCard}>
              <Group justify="space-between" mb={12}>
                <Badge
                  size="sm"
                  variant="light"
                  className={classes.irdBadge}
                  leftSection={<IconShieldCheck size={12} />}
                >
                  NZ Tax Receipt
                </Badge>
                <Text size="xs" c="var(--bm-text-muted)">
                  {r.paid_at ? formatDate(r.paid_at) : formatDate(r.created_at)}
                </Text>
              </Group>

              <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={4} lineClamp={2}>
                {r.charity_display_name || '(Charity not linked)'}
              </Text>
              <Text size="xs" c="var(--bm-text-muted)" mb={4}>
                {r.receipt_no ? `Receipt #${r.receipt_no}` : 'Receipt auto-generated'}
              </Text>
              {r.currency_code !== 'NZD' && (
                <Badge size="xs" variant="outline" color="orange" mb={8}>
                  {r.currency_code} — No NZ Tax Credit
                </Badge>
              )}

              <Divider mb={12} color="rgba(143, 151, 121, 0.08)" />

              <Group justify="space-between" align="center">
                <Box>
                  <Text size="lg" fw={800} c="var(--bm-sage-dark)">
                    {formatMinor(r.donation_amount_minor, r.currency_code)}
                  </Text>
                  {r.currency_code === 'NZD' && (
                    <Text size="xs" c="var(--bm-text-muted)">
                      ~{formatNZD(Math.round(r.donation_amount_minor / 100 * 0.3333))} tax credit
                    </Text>
                  )}
                </Box>
                <Button
                  variant="light"
                  color="sage"
                  size="xs"
                  radius="md"
                  leftSection={
                    downloadingId === i
                      ? <IconLoader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      : <IconDownload size={12} />
                  }
                  loading={downloadingId === i}
                  disabled={downloadingId === i}
                  onClick={() => handleDownloadOne(r, i)}
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
              No receipts yet. Completed donations will appear here.
            </Text>
            <Text size="xs" c="var(--bm-text-muted)" mt={4}>
              Only successfully completed donations generate tax receipts.
            </Text>
            <Button
              component={Link}
              href="/projects"
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

// ===================== My Causes 탭 =====================
function MyCausesTab() {
  const { favorites, toggleFavorite } = useFavorites();

  const savedOrgs = useMemo(() => {
    return favorites.organizations
      .map((slug) => getOrganizationBySlug(slug))
      .filter(Boolean) as Organization[];
  }, [favorites.organizations]);

  const savedProjects = useMemo(() => {
    return favorites.projects
      .map((slug) => getCampaignBySlug(slug))
      .filter(Boolean) as Campaign[];
  }, [favorites.projects]);

  const totalSaved = savedOrgs.length + savedProjects.length;

  if (totalSaved === 0) {
    return (
      <Card padding="xl" radius="lg" withBorder>
        <Box className={classes.emptyState}>
          <IconHeart size={48} color="var(--bm-sage)" style={{ opacity: 0.3 }} />
          <Text size="md" c="var(--bm-text-dark)" fw={600} mt={16}>
            No saved causes yet
          </Text>
          <Text size="sm" c="var(--bm-text-muted)" mt={4} maw={400} mx="auto">
            Browse charities and projects, then tap ♡ to save them here for quick access.
          </Text>
          <Group gap={12} mt={20} justify="center">
            <Button component={Link} href="/charities" variant="outline" color="sage" radius="xl">
              Browse Charities
            </Button>
            <Button component={Link} href="/projects" color="terracotta" radius="xl" rightSection={<IconArrowRight size={16} />}>
              Explore Projects
            </Button>
          </Group>
        </Box>
      </Card>
    );
  }

  return (
    <Stack gap={28}>
      {/* Saved Charities */}
      {savedOrgs.length > 0 && (
        <Box>
          <Group gap={8} mb={16}>
            <Text fw={700} size="md" c="var(--bm-text-dark)">Saved Charities</Text>
            <Badge size="sm" variant="light" color="sage">{savedOrgs.length}</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={16}>
            {savedOrgs.map((org) => (
              <Card key={org.id} padding="lg" radius="lg" withBorder className={classes.statCard}>
                <Group justify="space-between" mb={12}>
                  <Badge size="xs" variant="light" color="sage">{org.category}</Badge>
                  <Tooltip label="Remove from saved" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => toggleFavorite('organization', org.slug)}
                    >
                      <IconHeartFilled size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text size="sm" fw={700} c="var(--bm-text-dark)" mb={4} lineClamp={1}>
                  {org.name}
                </Text>
                <Text size="xs" c="var(--bm-text-muted)" mb={12} lineClamp={2} lh={1.5}>
                  {org.mission}
                </Text>
                <Button
                  component={Link}
                  href={`/charities/${org.slug}`}
                  variant="light"
                  color="sage"
                  size="xs"
                  radius="md"
                  fullWidth
                  rightSection={<IconArrowRight size={14} />}
                >
                  View Charity
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Saved Projects */}
      {savedProjects.length > 0 && (
        <Box>
          <Group gap={8} mb={16}>
            <Text fw={700} size="md" c="var(--bm-text-dark)">Saved Projects</Text>
            <Badge size="sm" variant="light" color="terracotta">{savedProjects.length}</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={16}>
            {savedProjects.map((project) => (
              <Card key={project.id} padding="lg" radius="lg" withBorder className={classes.statCard}>
                <Group justify="space-between" mb={12}>
                  <Badge size="xs" variant="light" color="terracotta">{project.category}</Badge>
                  <Tooltip label="Remove from saved" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => toggleFavorite('project', project.slug)}
                    >
                      <IconHeartFilled size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text size="sm" fw={700} c="var(--bm-text-dark)" mb={4} lineClamp={1}>
                  {project.name}
                </Text>
                <Text size="xs" c="var(--bm-text-muted)" mb={8} lineClamp={2} lh={1.5}>
                  {project.description}
                </Text>
                <Box mb={12}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={600} c="var(--bm-sage-dark)">
                      {formatCurrency(project.raised)}
                    </Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      of {formatCurrency(project.goal)}
                    </Text>
                  </Group>
                  <Box style={{ height: 4, borderRadius: 2, background: 'rgba(143,151,121,0.12)' }}>
                    <Box style={{
                      height: '100%',
                      borderRadius: 2,
                      width: `${Math.min(getProgress(project), 100)}%`,
                      background: 'var(--bm-sage)',
                    }} />
                  </Box>
                </Box>
                <Button
                  component={Link}
                  href={`/projects/${project.slug}`}
                  variant="light"
                  color="terracotta"
                  size="xs"
                  radius="md"
                  fullWidth
                  rightSection={<IconArrowRight size={14} />}
                >
                  View Project
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Stack>
  );
}

// ===================== 메인 대시보드 =====================
function DashboardContent() {
  const { user } = useAuth();
  const { currentTier, nextTier, unlockedCount, totalCount } = useRewards();

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
              {/* C안: 등급 한 줄 요약 */}
              <Group gap={6} mt={6}>
                <Text size="xs" c="var(--bm-text-muted)">
                  {currentTier.emoji} {currentTier.label}
                </Text>
                <Text size="xs" c="var(--bm-text-muted)">·</Text>
                <Text size="xs" c="var(--bm-text-muted)">
                  {unlockedCount}/{totalCount} badges
                </Text>
                {nextTier && (
                  <>
                    <Text size="xs" c="var(--bm-text-muted)">·</Text>
                    <Link
                      href="/dashboard?tab=rewards"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--bm-sage-dark)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {nextTier.minBadges - unlockedCount} to {nextTier.label} →
                    </Link>
                  </>
                )}
              </Group>
            </Box>
          </Group>

          {/* 탭 네비게이션 */}
          <Tabs defaultValue="overview" color="sage" radius="md">
            <Tabs.List className={classes.tabList}>
              <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="impact" leftSection={<IconSparkles size={16} />}>
                My Impact
              </Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<IconCalendar size={16} />}>
                Donation History
              </Tabs.Tab>
              <Tabs.Tab value="tax" leftSection={<IconCalculator size={16} />}>
                Donation Tax Credit
              </Tabs.Tab>
              <Tabs.Tab value="receipts" leftSection={<IconFileText size={16} />}>
                Receipt Vault
              </Tabs.Tab>
              <Tabs.Tab value="rewards" leftSection={<IconGift size={16} />}>
                My Rewards
              </Tabs.Tab>
              <Tabs.Tab value="causes" leftSection={<IconHeart size={16} />}>
                My Causes
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview">
              <OverviewTab />
            </Tabs.Panel>

            <Tabs.Panel value="impact">
              <ImpactTab />
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

            <Tabs.Panel value="rewards">
              <RewardsTab />
            </Tabs.Panel>

            <Tabs.Panel value="causes">
              <MyCausesTab />
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
