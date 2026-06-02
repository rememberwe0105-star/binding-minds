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
  IconRoute,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RewardsTab } from '@/components/RewardsTab';
import { RecurringDonationsCard } from '@/components/RecurringDonationsCard';
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

      {/* Recurring Donations */}
      <Box mt={20}>
        <RecurringDonationsCard items={items} />
      </Box>
    </>
  );
}

// ===================== My Impact 탭 =====================
const IMPACT_COLORS = ['#4A7C71', '#C4724A', '#4b6bfb', '#fab005', '#be4bdb', '#20c997'];

// 마일스톤 정의
interface Milestone {
  id: string;
  icon: typeof IconTree;
  label: string;
  description: string;
  color: string;
  check: (stats: { count: number; total: number; streak: number; categories: number }) => boolean;
}

const MILESTONES: Milestone[] = [
  { id: 'first', icon: IconHeart, label: 'First Giver', description: 'Made your first donation', color: 'terracotta', check: (s) => s.count >= 1 },
  { id: 'five', icon: IconSparkles, label: 'High Five', description: '5 donations completed', color: 'sage', check: (s) => s.count >= 5 },
  { id: 'ten', icon: IconTree, label: 'Tree Hugger', description: '10 donations completed', color: 'sage', check: (s) => s.count >= 10 },
  { id: 'hundred', icon: IconCoin, label: 'Century Club', description: 'Donated $100 in total', color: 'terracotta', check: (s) => s.total >= 100 },
  { id: 'fivehundred', icon: IconShieldCheck, label: 'Champion', description: 'Donated $500 in total', color: 'blue', check: (s) => s.total >= 500 },
  { id: 'thousand', icon: IconGift, label: 'Philanthropist', description: 'Donated $1,000 in total', color: 'grape', check: (s) => s.total >= 1000 },
  { id: 'streak3', icon: IconCalendar, label: 'Hat Trick', description: '3-month giving streak', color: 'sage', check: (s) => s.streak >= 3 },
  { id: 'diverse', icon: IconChartBar, label: 'Diversifier', description: 'Donated to 3+ categories', color: 'blue', check: (s) => s.categories >= 3 },
];

function ImpactTab() {
  const { items, loading } = useApiDonations(500);
  const succeededItems = useMemo(
    () => items.filter((d) => d.donation_status === 'succeeded'),
    [items]
  );
  const totalNZD = useMemo(
    () => succeededItems.reduce((s, d) => s + d.donation_amount_minor, 0) / 100,
    [succeededItems]
  );

  // ── 실제 데이터 기반 월별 트렌드 ──
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result: { month: string; amount: number }[] = [];

    // 최근 6개월
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      const monthTotal = succeededItems
        .filter((item) => {
          const itemDate = new Date(item.paid_at || item.created_at || '');
          return itemDate.getMonth() === monthIdx && itemDate.getFullYear() === year;
        })
        .reduce((sum, item) => sum + item.donation_amount_minor, 0) / 100;

      result.push({ month: months[monthIdx], amount: monthTotal });
    }
    return result;
  }, [succeededItems]);

  // ── 실제 데이터 기반 카테고리 분석 ──
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    succeededItems.forEach((item) => {
      const name = item.charity_display_name || 'Other';
      map.set(name, (map.get(name) || 0) + item.donation_amount_minor / 100);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // 상위 6개
  }, [succeededItems]);

  // ── 기부 스트릭 계산 ──
  const givingStreak = useMemo(() => {
    const now = new Date();
    let streak = 0;

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      const hasGiving = succeededItems.some((item) => {
        const itemDate = new Date(item.paid_at || item.created_at || '');
        return itemDate.getMonth() === monthIdx && itemDate.getFullYear() === year;
      });

      if (hasGiving) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [succeededItems]);

  // ── 유니크 카테고리 수 (charity name 기반) ──
  const uniqueCategories = useMemo(
    () => new Set(succeededItems.map((d) => d.charity_display_name)).size,
    [succeededItems]
  );

  // ── 마일스톤 체크 ──
  const milestoneStats = { count: succeededItems.length, total: totalNZD, streak: givingStreak, categories: uniqueCategories };
  const earnedMilestones = MILESTONES.filter((m) => m.check(milestoneStats));
  const nextMilestone = MILESTONES.find((m) => !m.check(milestoneStats));

  // Impact analogies based on total donated
  const treesPlanted = Math.floor(totalNZD / 25);
  const mealsProvided = Math.floor(totalNZD / 8);
  const booksForKids = Math.floor(totalNZD / 15);
  const shelterNights = Math.floor(totalNZD / 35);

  if (loading) {
    return (
      <Box ta="center" py={60}>
        <Loader size="lg" color="sage" />
        <Text size="sm" c="var(--bm-text-muted)" mt={12}>Loading your impact data...</Text>
      </Box>
    );
  }

  if (succeededItems.length === 0) {
    return (
      <Card padding="xl" radius="lg" withBorder ta="center" py={60}>
        <ThemeIcon size={64} radius="xl" color="sage" variant="light" mx="auto" mb={16}>
          <IconSparkles size={32} />
        </ThemeIcon>
        <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={8}>Start Your Impact Journey</Text>
        <Text size="sm" c="var(--bm-text-muted)" maw={400} mx="auto" lh={1.6} mb={20}>
          Make your first donation to see your real-world impact, earn milestones, and track your giving journey.
        </Text>
        <Button component={Link} href="/projects" color="sage" radius="xl" size="md" rightSection={<IconArrowRight size={16} />}>
          Explore Projects
        </Button>
      </Card>
    );
  }

  return (
    <Stack gap={24}>
      {/* ── Giving Streak Banner ── */}
      {givingStreak > 0 && (
        <Card padding="lg" radius="lg" withBorder
          style={{
            background: givingStreak >= 3
              ? 'linear-gradient(135deg, rgba(196,114,74,0.08) 0%, rgba(74,124,113,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(74,124,113,0.04) 0%, rgba(255,255,255,1) 100%)',
          }}
        >
          <Group gap={12}>
            <ThemeIcon size={44} radius="xl" color={givingStreak >= 3 ? 'terracotta' : 'sage'} variant="light">
              <IconCalendar size={22} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Group gap={8}>
                <Text fw={800} size="xl" c="var(--bm-text-dark)">{givingStreak}</Text>
                <Text fw={700} size="md" c="var(--bm-text-dark)">month giving streak 🔥</Text>
              </Group>
              <Text size="xs" c="var(--bm-text-muted)">
                {givingStreak >= 6
                  ? "Incredible commitment! You're a true changemaker."
                  : givingStreak >= 3
                    ? "Amazing consistency! Keep the momentum going."
                    : "Great start! Donate next month to keep your streak alive."}
              </Text>
            </Box>
          </Group>
        </Card>
      )}

      {/* ── Impact Analogies ── */}
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

      {/* ── Milestones ── */}
      <Box>
        <Group gap={8} mb={12}>
          <Text fw={700} size="md" c="var(--bm-text-dark)">Milestones</Text>
          <Badge size="sm" color="sage" variant="light">{earnedMilestones.length}/{MILESTONES.length}</Badge>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={10}>
          {MILESTONES.map((m) => {
            const earned = m.check(milestoneStats);
            const MIcon = m.icon;
            return (
              <Tooltip key={m.id} label={m.description} position="top" withArrow>
                <Card
                  padding="md"
                  radius="lg"
                  withBorder
                  style={{
                    opacity: earned ? 1 : 0.35,
                    background: earned
                      ? 'linear-gradient(135deg, rgba(74,124,113,0.06) 0%, rgba(196,114,74,0.04) 100%)'
                      : undefined,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                  }}
                  ta="center"
                >
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    color={earned ? m.color : 'gray'}
                    variant={earned ? 'light' : 'subtle'}
                    mx="auto"
                    mb={6}
                  >
                    <MIcon size={16} />
                  </ThemeIcon>
                  <Text fw={700} size="xs" c={earned ? 'var(--bm-text-dark)' : 'dimmed'}>{m.label}</Text>
                  {earned && <Text size="xs" c="var(--bm-text-muted)">✓ Earned</Text>}
                </Card>
              </Tooltip>
            );
          })}
        </SimpleGrid>

        {nextMilestone && (
          <Alert color="sage" variant="light" radius="md" mt={12} icon={<IconSparkles size={16} />}>
            <Text size="xs">
              <strong>Next milestone:</strong> {nextMilestone.label} — {nextMilestone.description}
            </Text>
          </Alert>
        )}
      </Box>

      {/* ── Charts Row ── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        {/* Monthly Trend — REAL DATA */}
        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Monthly Giving Trend</Text>
          <Text size="xs" c="var(--bm-text-muted)" mb={20}>Your actual donation pattern over the last 6 months</Text>
          <Box h={220}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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

        {/* Top Charities Supported — REAL DATA */}
        <Card padding="xl" radius="lg" withBorder>
          <Text fw={700} size="md" c="var(--bm-text-dark)" mb={4}>Top Charities Supported</Text>
          <Text size="xs" c="var(--bm-text-muted)" mb={12}>Where your donations are making an impact</Text>
          {categoryData.length > 0 ? (
            <Box h={220}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" cx="50%" cy="45%">
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={IMPACT_COLORS[index % IMPACT_COLORS.length]} />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <RechartsTooltip formatter={(value: any) => `$${value}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box ta="center" py={40}>
              <Text size="sm" c="dimmed">No data yet</Text>
            </Box>
          )}
        </Card>
      </SimpleGrid>

      {/* ── Encouragement ── */}
      <Card padding="lg" radius="lg" withBorder
        style={{ background: 'linear-gradient(135deg, rgba(142,184,151,0.08) 0%, rgba(230,126,94,0.06) 100%)', textAlign: 'center' }}
      >
        <Group gap={8} justify="center" mb={8}>
          <IconSparkles size={18} color="var(--bm-terracotta-dark)" />
          <Text fw={700} size="md" c="var(--bm-text-dark)">You&apos;re making a difference!</Text>
        </Group>
        <Text size="sm" c="var(--bm-text-muted)" maw={500} mx="auto" lh={1.6}>
          {totalNZD >= 500
            ? "Your incredible generosity is transforming lives across Aotearoa. You're a true champion of change!"
            : totalNZD >= 100
              ? "Your consistent giving is building a stronger New Zealand. Every dollar creates ripples of positive change."
              : "Every dollar you donate helps build a stronger, more compassionate New Zealand. Keep it up — your generosity inspires others to give too."}
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

// ===================== My Causes 탭 + Donor Journey =====================
interface CharityRelationship {
  charityName: string;
  charityId?: number;
  totalDonated: number;
  donationCount: number;
  firstDonation: string;
  lastDonation: string;
  currency: string;
  donations: { amount: number; date: string; status: string }[];
}

function MyCausesTab() {
  const { favorites, toggleFavorite } = useFavorites();
  const { items, loading } = useApiDonations(500);
  const [expandedCharity, setExpandedCharity] = useState<string | null>(null);

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

  // ── 기관별 관계 데이터 구축 ──
  const charityRelationships = useMemo(() => {
    const succeededItems = items.filter((d) => d.donation_status === 'succeeded');
    const map = new Map<string, CharityRelationship>();

    succeededItems.forEach((d) => {
      const name = d.charity_display_name || 'Unknown Charity';
      const dateStr = d.paid_at || d.created_at || new Date().toISOString();
      const existing = map.get(name);

      if (existing) {
        existing.totalDonated += d.donation_amount_minor;
        existing.donationCount += 1;
        if (dateStr < existing.firstDonation) existing.firstDonation = dateStr;
        if (dateStr > existing.lastDonation) existing.lastDonation = dateStr;
        existing.donations.push({
          amount: d.donation_amount_minor,
          date: dateStr,
          status: d.donation_status,
        });
      } else {
        map.set(name, {
          charityName: name,
          charityId: d.charity_id,
          totalDonated: d.donation_amount_minor,
          donationCount: 1,
          firstDonation: dateStr,
          lastDonation: dateStr,
          currency: d.currency_code || 'NZD',
          donations: [{ amount: d.donation_amount_minor, date: dateStr, status: d.donation_status }],
        });
      }
    });

    // 날짜순 정렬 (각 기관 내)
    map.forEach((rel) => {
      rel.donations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return Array.from(map.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }, [items]);

  const totalSaved = savedOrgs.length + savedProjects.length;
  const hasJourney = charityRelationships.length > 0;
  const hasAnything = totalSaved > 0 || hasJourney;

  if (!hasAnything && !loading) {
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
      {/* ── Your Giving Journey ── */}
      {(hasJourney || loading) && (
        <Box>
          <Group gap={8} mb={4}>
            <IconRoute size={20} color="var(--bm-terracotta)" />
            <Text fw={700} size="md" c="var(--bm-text-dark)">Your Giving Journey</Text>
            {hasJourney && (
              <Badge size="sm" variant="light" color="terracotta">{charityRelationships.length} charities</Badge>
            )}
          </Group>
          <Text size="xs" c="var(--bm-text-muted)" mb={16}>
            Your relationship with the charities you&apos;ve supported
          </Text>

          {loading ? (
            <Box ta="center" py={30}>
              <Loader size="sm" color="sage" />
              <Text size="xs" c="dimmed" mt={8}>Loading your journey...</Text>
            </Box>
          ) : (
            <Stack gap={12}>
              {charityRelationships.map((rel) => {
                const isExpanded = expandedCharity === rel.charityName;
                const monthsSinceFirst = Math.max(1, Math.ceil(
                  (Date.now() - new Date(rel.firstDonation).getTime()) / (1000 * 60 * 60 * 24 * 30)
                ));

                return (
                  <Card
                    key={rel.charityName}
                    padding="lg"
                    radius="lg"
                    withBorder
                    className={classes.statCard}
                    style={{
                      cursor: 'pointer',
                      background: isExpanded
                        ? 'linear-gradient(135deg, rgba(74,124,113,0.03) 0%, rgba(196,114,74,0.02) 100%)'
                        : undefined,
                    }}
                    onClick={() => setExpandedCharity(isExpanded ? null : rel.charityName)}
                  >
                    {/* Header */}
                    <Group justify="space-between" mb={12}>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={700} c="var(--bm-text-dark)" lineClamp={1}>
                          {rel.charityName}
                        </Text>
                        <Text size="xs" c="var(--bm-text-muted)">
                          Supporter since {formatDate(rel.firstDonation)} · {monthsSinceFirst}mo
                        </Text>
                      </Box>
                      <Text size="xs" c="dimmed">{isExpanded ? '▲' : '▼'}</Text>
                    </Group>

                    {/* Stats Row */}
                    <SimpleGrid cols={3} spacing={8}>
                      <Box ta="center" p={8} style={{ background: 'rgba(74,124,113,0.04)', borderRadius: 8 }}>
                        <Text fw={800} size="sm" c="var(--bm-sage-dark)">
                          {formatMinor(rel.totalDonated, rel.currency)}
                        </Text>
                        <Text size="xs" c="var(--bm-text-muted)">Total Donated</Text>
                      </Box>
                      <Box ta="center" p={8} style={{ background: 'rgba(196,114,74,0.04)', borderRadius: 8 }}>
                        <Text fw={800} size="sm" c="var(--bm-terracotta-dark, var(--bm-terracotta))">
                          {rel.donationCount}
                        </Text>
                        <Text size="xs" c="var(--bm-text-muted)">Donations</Text>
                      </Box>
                      <Box ta="center" p={8} style={{ background: 'rgba(75,107,251,0.04)', borderRadius: 8 }}>
                        <Text fw={800} size="sm" c="#4b6bfb">
                          {formatMinor(Math.round(rel.totalDonated / rel.donationCount), rel.currency)}
                        </Text>
                        <Text size="xs" c="var(--bm-text-muted)">Avg Gift</Text>
                      </Box>
                    </SimpleGrid>

                    {/* Expanded Timeline */}
                    {isExpanded && (
                      <Box mt={16} pt={16} style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                        <Text size="xs" fw={700} c="var(--bm-text-dark)" mb={12}>
                          Donation Timeline
                        </Text>
                        <Stack gap={0}>
                          {rel.donations.map((don, idx) => (
                            <Group
                              key={idx}
                              gap={12}
                              style={{
                                position: 'relative',
                                paddingLeft: 20,
                                paddingBottom: idx < rel.donations.length - 1 ? 16 : 0,
                              }}
                            >
                              {/* Timeline dot + line */}
                              <Box
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 4,
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: idx === 0 ? 'var(--bm-terracotta)' : 'var(--bm-sage)',
                                  border: '2px solid white',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                                  zIndex: 1,
                                }}
                              />
                              {idx < rel.donations.length - 1 && (
                                <Box
                                  style={{
                                    position: 'absolute',
                                    left: 4,
                                    top: 14,
                                    width: 2,
                                    height: 'calc(100% - 6px)',
                                    background: 'var(--mantine-color-gray-3)',
                                  }}
                                />
                              )}

                              <Box style={{ flex: 1 }}>
                                <Group justify="space-between">
                                  <Text size="sm" fw={600} c="var(--bm-text-dark)">
                                    {formatMinor(don.amount, rel.currency)}
                                  </Text>
                                  <Text size="xs" c="dimmed">{formatDate(don.date)}</Text>
                                </Group>
                                {idx === rel.donations.length - 1 && (
                                  <Badge size="xs" variant="light" color="sage" mt={4}>First donation 🌱</Badge>
                                )}
                                {idx === 0 && rel.donations.length > 1 && (
                                  <Badge size="xs" variant="light" color="terracotta" mt={4}>Most recent</Badge>
                                )}
                              </Box>
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* ── Saved Charities ── */}
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

      {/* ── Saved Projects ── */}
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
              <Tabs.Tab value="causes" leftSection={<IconRoute size={16} />}>
                My Causes & Journey
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
