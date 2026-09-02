'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Text,
  Group,
  Box,
  Badge,
  Button,
  TextInput,
  Textarea,
  Stack,
  SegmentedControl,
  SimpleGrid,
  ThemeIcon,
  Progress,
  Avatar,
  Select,
  Alert,
  Divider,
} from '@mantine/core';
import {
  IconUsersGroup,
  IconHeartHandshake,
  IconCheck,
  IconX,
  IconLink,
  IconEyeOff,
  IconWorld,
  IconInfoCircle,
  IconSparkles,
} from '@tabler/icons-react';
import {
  createFundraiser,
  updateFundraiserStatus,
  getPublicFundraisers,
  BackendPendingError,
  type PublicFundraiser,
} from '@/lib/api';
import { BackendPendingDialog } from './BackendPendingDialog';

// ============================================================
// P2P Supporter Fundraisers (Growth 유료 기능) — update 5
//
// 기부자가 기관/프로젝트를 위해 개인 모금 페이지를 만들어
// 친구·가족·whānau·커뮤니티에 공유하는 기능의 프론트 데모.
// - Public: 기관 승인 후 공개 페이지 게시 / Private: 링크로만 공유(즉시)
// - 실데이터·저장은 백엔드 v8.4 요청 (게이트 패턴으로 배선됨)
// ============================================================

// --- 공용 타입/데모 데이터 ---

interface DemoFundraiser {
  id: string;
  owner: string;
  title: string;
  level: 'organisation' | 'project';
  target: string; // 대상 기관/프로젝트명
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'declined';
  raised: number;
  goal: number;
  supporters: number;
}

// ============================================================
// 1) 펀드레이저 생성 모달 — "Start a fundraiser"
// ============================================================

interface FundraiserModalProps {
  opened: boolean;
  onClose: () => void;
  charityName: string;
  charitySlug: string;
  /** 프로젝트 상세에서 열면 전달 — project-level 기본 선택 */
  projectName?: string;
  projectSlug?: string;
}

export function FundraiserModal({
  opened,
  onClose,
  charityName,
  charitySlug,
  projectName,
  projectSlug,
}: FundraiserModalProps) {
  const [level, setLevel] = useState<'organisation' | 'project'>(projectName ? 'project' : 'organisation');
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [pendingError, setPendingError] = useState<BackendPendingError | null>(null);

  const goalNum = Number(goal);
  const canSubmit = title.trim().length > 2 && goalNum >= 50;

  const reset = () => {
    setTitle(''); setGoal(''); setMessage('');
    setVisibility('public'); setCreated(false);
    onClose();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await createFundraiser({
        charitySlug,
        campaignSlug: level === 'project' ? projectSlug : undefined,
        level,
        title: title.trim(),
        goalAmount: goalNum,
        message: message.trim() || undefined,
        visibility,
      });
      setCreated(true);
    } catch (e) {
      if (e instanceof BackendPendingError) {
        setPendingError(e);
        setCreated(true); // 안내 후 데모 완료 화면으로 계속
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BackendPendingDialog error={pendingError} onClose={() => setPendingError(null)} continuesWithDemo />
      <Modal
        opened={opened}
        onClose={reset}
        centered
        radius="lg"
        size="md"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
        title={
          <Group gap={8}>
            <IconHeartHandshake size={20} color="var(--bm-terracotta)" />
            <Text fw={700} c="var(--bm-text-dark)">Start a fundraiser</Text>
          </Group>
        }
      >
        {created ? (
          <Stack gap={14} ta="center" py={8}>
            <ThemeIcon size={56} radius="xl" color="sage" variant="light" mx="auto">
              <IconSparkles size={28} />
            </ThemeIcon>
            <Text fw={700} size="lg" c="var(--bm-text-dark)">Fundraiser created! (preview)</Text>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
              {visibility === 'public'
                ? <>Your fundraiser has been sent to <strong>{charityName}</strong> for a quick
                    review. Once approved, it will appear on their public page.</>
                : <>Your private fundraiser is ready — share the link below with friends,
                    family and whānau. It won&apos;t appear on any public page.</>}
            </Text>
            <Box p={10} style={{ background: 'rgba(74,124,113,0.06)', borderRadius: 8 }}>
              <Group gap={6} justify="center">
                <IconLink size={14} color="var(--bm-sage-dark)" />
                <Text size="xs" ff="monospace" c="var(--bm-sage-dark)">
                  binding-minds.vercel.app/f/{charitySlug}-demo
                </Text>
              </Group>
            </Box>
            <Button color="sage" radius="xl" onClick={reset}>Done</Button>
          </Stack>
        ) : (
          <Stack gap={14}>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.6}>
              Create your own giving page for <strong>{charityName}</strong> and share it
              with friends, family and whānau.
            </Text>

            {projectName && (
              <Box>
                <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={6}>Fundraise for</Text>
                <SegmentedControl
                  fullWidth
                  radius="md"
                  color="sage"
                  value={level}
                  onChange={(v) => setLevel(v as 'organisation' | 'project')}
                  data={[
                    { label: `Project: ${projectName.length > 18 ? `${projectName.slice(0, 18)}…` : projectName}`, value: 'project' },
                    { label: 'The organisation', value: 'organisation' },
                  ]}
                />
              </Box>
            )}

            <TextInput
              label="Fundraiser title"
              placeholder="e.g. My birthday fundraiser for native forests"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              radius="md"
              required
            />
            <TextInput
              label="Goal (NZD)"
              placeholder="500"
              leftSection={<Text size="sm" fw={600}>$</Text>}
              type="number"
              min={50}
              value={goal}
              onChange={(e) => setGoal(e.currentTarget.value)}
              radius="md"
              required
              description="Minimum $50"
            />
            <Textarea
              label="Your message (optional)"
              placeholder="Tell people why this cause matters to you…"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              radius="md"
              autosize
              minRows={2}
              maxRows={4}
              maxLength={300}
            />

            <Box>
              <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={6}>Visibility</Text>
              <SegmentedControl
                fullWidth
                radius="md"
                color="sage"
                value={visibility}
                onChange={(v) => setVisibility(v as 'public' | 'private')}
                data={[
                  { label: 'Public', value: 'public' },
                  { label: 'Private (link only)', value: 'private' },
                ]}
              />
              <Text size="xs" c="dimmed" mt={6} lh={1.55}>
                {visibility === 'public'
                  ? 'Public fundraisers are reviewed by the organisation before appearing on their page.'
                  : 'Private fundraisers are shared by link only and never appear on public pages.'}
              </Text>
            </Box>

            <Button
              color="terracotta"
              radius="xl"
              fullWidth
              onClick={submit}
              loading={submitting}
              disabled={!canSubmit}
            >
              Create fundraiser
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}

// ============================================================
// 2) 기관/프로젝트 페이지의 Supporter Fundraisers 섹션
// ============================================================

interface SupporterFundraisersSectionProps {
  charityName: string;
  charitySlug: string;
  projectName?: string;
  projectSlug?: string;
}

export function SupporterFundraisersSection({
  charityName,
  charitySlug,
  projectName,
  projectSlug,
}: SupporterFundraisersSectionProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const target = projectName ?? charityName;

  // 실데이터 — 공개(승인된) 서포터 펀드레이저 (FE 3번: 목업 제거)
  const [fundraisers, setFundraisers] = useState<PublicFundraiser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!charitySlug) { setLoading(false); return; }
    getPublicFundraisers(charitySlug)
      .then((res) => {
        if (cancelled) return;
        let items = res.items ?? [];
        // 프로젝트 상세에서는 해당 프로젝트 대상 펀드레이저만 (백엔드가 필터 안 하면 프론트에서)
        if (projectSlug) {
          items = items.filter((f) => !f.level || f.level === 'project');
        }
        setFundraisers(items);
      })
      .catch(() => { if (!cancelled) setFundraisers([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [charitySlug, projectSlug]);

  return (
    <Box mt={48}>
      <Group justify="space-between" mb={6}>
        <Group gap={8}>
          <IconUsersGroup size={18} color="var(--bm-sage-dark)" />
          <Text fw={700} size="lg" c="var(--bm-text-dark)">Supporter Fundraisers</Text>
          <Badge size="sm" variant="light" color="sage">Community-led</Badge>
        </Group>
        <Button
          color="terracotta"
          radius="xl"
          size="sm"
          leftSection={<IconHeartHandshake size={16} />}
          onClick={() => setModalOpened(true)}
        >
          Start a fundraiser
        </Button>
      </Group>
      <Text size="sm" c="var(--bm-text-muted)" mb={16} maw={620}>
        Personal giving pages created by supporters of {target} — approved by the
        organisation before appearing here.
      </Text>

      {loading ? (
        <Text size="sm" c="dimmed" py={8}>Loading supporter fundraisers…</Text>
      ) : fundraisers.length === 0 ? (
        <Card withBorder radius="lg" padding="lg" ta="center">
          <Text size="sm" c="var(--bm-text-muted)">
            No supporter fundraisers yet — be the first to start one for {target}.
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          {fundraisers.map((f) => {
            const raised = Math.round((f.raised_minor ?? 0) / 100);
            const goal = Math.round((f.goal_minor ?? 0) / 100);
            const owner = f.owner_name || 'Supporter';
            return (
              <Card key={f.id} withBorder radius="lg" padding="lg">
                <Group gap={10} mb={10}>
                  <Avatar radius="xl" color="sage">{owner.charAt(0)}</Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={700} c="var(--bm-text-dark)" lineClamp={1}>{f.title}</Text>
                    <Text size="xs" c="var(--bm-text-muted)">by {owner} · supporting {f.project_title || target}</Text>
                  </Box>
                </Group>
                <Progress value={goal > 0 ? (raised / goal) * 100 : 0} color="sage" size="sm" radius="xl" mb={8} />
                <Group justify="space-between">
                  <Text size="xs" c="var(--bm-text-muted)">
                    <strong>${raised.toLocaleString()}</strong>{goal > 0 ? ` of $${goal.toLocaleString()}` : ''}
                  </Text>
                  <Text size="xs" c="dimmed">{f.supporter_count ?? 0} supporters</Text>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      <FundraiserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        charityName={charityName}
        charitySlug={charitySlug}
        projectName={projectName}
        projectSlug={projectSlug}
      />
    </Box>
  );
}

// ============================================================
// 3) 기관 대시보드 "Supporter Fundraisers" 탭 (Growth 전용)
// ============================================================

const DEMO_DASHBOARD_FUNDRAISERS: DemoFundraiser[] = [
  { id: 'fr-101', owner: 'Hana W.', title: "Hana's 40th Birthday — trees instead of gifts", level: 'project', target: 'Restore Native Forest', visibility: 'public', status: 'approved', raised: 640, goal: 1000, supporters: 18 },
  { id: 'fr-102', owner: 'Te Rōpū Whānau', title: 'Our whānau half-marathon challenge', level: 'organisation', target: 'Organisation', visibility: 'public', status: 'approved', raised: 1240, goal: 2000, supporters: 32 },
  { id: 'fr-103', owner: 'Jordan M.', title: 'Office bake sale — matched giving week', level: 'organisation', target: 'Organisation', visibility: 'public', status: 'pending', raised: 0, goal: 500, supporters: 0 },
  { id: 'fr-104', owner: 'Aroha K.', title: "Grandma's memorial garden fund", level: 'project', target: 'Restore Native Forest', visibility: 'private', status: 'approved', raised: 380, goal: 800, supporters: 9 },
  { id: 'fr-105', owner: 'Sam T.', title: 'Untitled fundraiser', level: 'organisation', target: 'Organisation', visibility: 'public', status: 'declined', raised: 0, goal: 300, supporters: 0 },
];

const STATUS_COLOR: Record<DemoFundraiser['status'], string> = {
  pending: 'yellow',
  approved: 'teal',
  declined: 'red',
};

export function SupporterFundraisersTab() {
  const [items, setItems] = useState<DemoFundraiser[]>(DEMO_DASHBOARD_FUNDRAISERS);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<BackendPendingError | null>(null);

  const filtered = items.filter((f) =>
    (!statusFilter || f.status === statusFilter) && (!levelFilter || f.level === levelFilter),
  );

  const totalRaised = items.filter((f) => f.status === 'approved').reduce((s, f) => s + f.raised, 0);
  const activeCount = items.filter((f) => f.status === 'approved').length;
  const pendingCount = items.filter((f) => f.status === 'pending').length;

  // 승인/거절 — 실 API 우선, 미구현이면 안내 후 데모 상태 변경 (게이트)
  const decide = async (id: string, status: 'approved' | 'declined') => {
    try {
      await updateFundraiserStatus(id, status);
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e);
      else return;
    }
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  return (
    <Stack gap={20} mt={20}>
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" radius="md">
        <Text size="xs" lh={1.6}>
          <strong>Preview.</strong> Sample fundraisers shown. Approve/Decline already
          calls the live API first — this tab switches to real data automatically once
          the backend endpoints respond (요청서 v8.4).
        </Text>
      </Alert>

      {/* 요약 통계 */}
      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={12}>
        <Card withBorder radius="lg" padding="md" ta="center">
          <Text fw={800} size="lg" c="var(--bm-sage-dark)">${totalRaised.toLocaleString()}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Raised via fundraisers</Text>
        </Card>
        <Card withBorder radius="lg" padding="md" ta="center">
          <Text fw={800} size="lg" c="var(--bm-text-dark)">{activeCount}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Active fundraisers</Text>
        </Card>
        <Card withBorder radius="lg" padding="md" ta="center">
          <Text fw={800} size="lg" c={pendingCount > 0 ? 'var(--bm-terracotta)' : 'var(--bm-text-dark)'}>{pendingCount}</Text>
          <Text size="xs" c="var(--bm-text-muted)">Awaiting review</Text>
        </Card>
      </SimpleGrid>

      {/* 필터 */}
      <Group gap={10}>
        <Select
          placeholder="All statuses"
          data={[
            { value: 'pending', label: '⏳ Pending approval' },
            { value: 'approved', label: '✅ Approved' },
            { value: 'declined', label: '⛔ Declined' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          radius="md"
          size="sm"
          w={190}
        />
        <Select
          placeholder="All levels"
          data={[
            { value: 'organisation', label: 'Organisation-level' },
            { value: 'project', label: 'Project-level' },
          ]}
          value={levelFilter}
          onChange={setLevelFilter}
          clearable
          radius="md"
          size="sm"
          w={180}
        />
      </Group>

      {/* 목록 */}
      <Stack gap={10}>
        {filtered.map((f) => (
          <Card key={f.id} withBorder radius="lg" padding="md">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Group gap={10} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <Avatar radius="xl" color="sage">{f.owner.charAt(0)}</Avatar>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={700} c="var(--bm-text-dark)" lineClamp={1}>{f.title}</Text>
                  <Group gap={6} mt={2}>
                    <Text size="xs" c="var(--bm-text-muted)">by {f.owner}</Text>
                    <Badge size="xs" variant="outline" color="gray">
                      {f.level === 'project' ? f.target : 'Organisation'}
                    </Badge>
                    <Badge
                      size="xs"
                      variant="light"
                      color={f.visibility === 'public' ? 'sage' : 'gray'}
                      leftSection={f.visibility === 'public' ? <IconWorld size={9} /> : <IconEyeOff size={9} />}
                    >
                      {f.visibility}
                    </Badge>
                    <Badge size="xs" variant="light" color={STATUS_COLOR[f.status]}>{f.status}</Badge>
                  </Group>
                </Box>
              </Group>

              <Box ta="right" style={{ flexShrink: 0 }}>
                <Text size="sm" fw={700} c="var(--bm-sage-dark)">
                  ${f.raised.toLocaleString()} / ${f.goal.toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">{f.supporters} supporters</Text>
                {f.status === 'pending' && (
                  <Group gap={6} mt={6} justify="flex-end">
                    <Button
                      size="xs"
                      radius="xl"
                      color="sage"
                      leftSection={<IconCheck size={12} />}
                      onClick={() => decide(f.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      radius="xl"
                      variant="light"
                      color="red"
                      leftSection={<IconX size={12} />}
                      onClick={() => decide(f.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </Group>
                )}
              </Box>
            </Group>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card withBorder radius="lg" padding="xl" ta="center">
            <Text size="sm" c="var(--bm-text-muted)">No fundraisers match the current filters.</Text>
          </Card>
        )}
      </Stack>

      <Divider />
      <Text size="xs" c="dimmed">
        Public fundraisers appear on your organisation and project pages after approval.
        Private fundraisers are shared by link only and never listed publicly.
      </Text>

      <BackendPendingDialog error={pendingError} onClose={() => setPendingError(null)} continuesWithDemo />
    </Stack>
  );
}
