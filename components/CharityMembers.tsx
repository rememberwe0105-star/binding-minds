'use client';

import { useState, useEffect } from 'react';
import {
  Card, Text, Group, Box, Badge, Button, TextInput, Select, Stack, Title,
  Avatar, Alert, ActionIcon, Tooltip, Table, Menu, Modal, ThemeIcon, UnstyledButton,
} from '@mantine/core';
import {
  IconUsers, IconPlus, IconChevronDown, IconDotsVertical, IconInfoCircle,
  IconExternalLink, IconMail, IconTrash, IconCrown, IconUser, IconSend, IconCheck,
} from '@tabler/icons-react';
import {
  getCharityMembers, inviteCharityMember, removeCharityMember, updateCharityMemberRole,
  resendCharityInvite, getCharityBillingPortal,
  BackendPendingError, type CharityMember, type CharityMemberRole,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BackendPendingDialog } from './BackendPendingDialog';

// ============================================================
// 기관 팀 관리 — Users & permissions (Growth 전용)
//
// 클라이언트 레퍼런스 디자인 기준:
//  · 플랜 좌석 카드("2 of 3 users included in your plan") + View plan & billing + Invite user
//  · User / Role / Status / Last active / Actions 테이블
//    - Active → "Manage ▾" (역할 변경 / 제거)
//    - Pending → "Resend invite" + ⋮ (초대 취소)
//  · "Pending invites will expire in 7 days."
//
// Owner: 최종 관리자(사용자 초대/삭제·billing·설정). 기관마다 최소 1명 유지.
// role 은 확장 가능한 유니온(finance/campaign_manager/admin 등)으로 정의돼 있어
// 나중에 ROLE_OPTIONS 에 추가만 하면 세분화할 수 있다.
// 실 API 우선 호출 → 미구현이면 안내 후 데모 상태로 폴백 (게이트 패턴).
// ============================================================

const DEFAULT_SEAT_LIMIT = 3; // 백엔드가 seat_limit 을 주기 전까지의 기본값 (Growth 플랜 기준)

const ROLE_OPTIONS: { value: CharityMemberRole; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'owner', label: 'Owner' },
];

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  finance: 'Finance',
  campaign_manager: 'Campaign Manager',
};

const isPending = (m: CharityMember) => m.status === 'invited' || m.status === 'pending';

function initials(m: CharityMember): string {
  const base = (m.name || m.email.split('@')[0]).trim();
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || base[0]?.toUpperCase() || '?';
}

function timeAgo(iso?: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '—';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo > 1 ? 's' : ''} ago`;
}

function StatusPill({ pending }: { pending: boolean }) {
  const color = pending ? 'var(--mantine-color-orange-6)' : 'var(--bm-sage-dark, #2f5d50)';
  const bg = pending ? 'var(--mantine-color-orange-0)' : 'rgba(74,124,113,0.10)';
  return (
    <Group gap={6} wrap="nowrap" style={{ display: 'inline-flex', background: bg, borderRadius: 6, padding: '3px 10px' }}>
      <Box w={7} h={7} style={{ borderRadius: '50%', background: color }} />
      <Text size="sm" fw={500} style={{ color }}>{pending ? 'Pending' : 'Active'}</Text>
    </Group>
  );
}

export function CharityMembersTab() {
  const { displayName, displayEmail } = useAuth();

  const [members, setMembers] = useState<CharityMember[]>([]);
  const [seatLimit, setSeatLimit] = useState(DEFAULT_SEAT_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<BackendPendingError | null>(null);

  // 초대 모달
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CharityMemberRole>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 현재 로그인 사용자를 Owner 로 하는 데모 시드 (실 API 미구현 시 폴백)
  const demoSeed = (): CharityMember[] => [
    {
      id: 'me',
      email: displayEmail || 'owner@yourcharity.org.nz',
      name: displayName || 'You',
      member_role: 'owner',
      status: 'active',
      last_active_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    let cancelled = false;
    getCharityMembers()
      .then((res) => {
        if (cancelled) return;
        setMembers(res.members ?? []);
        if (typeof res.seat_limit === 'number') setSeatLimit(res.seat_limit);
      })
      .catch(() => { if (!cancelled) setMembers(demoSeed()); }) // 미구현/오류 → 데모
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownerCount = members.filter((m) => m.member_role === 'owner' && !isPending(m)).length;
  const seatsUsed = members.length;
  const seatsFull = seatsUsed >= seatLimit;

  // 실 API 호출 → 미구현이면 안내만 하고 데모 반영, 그 외 오류는 중단
  const runGated = async (call: () => Promise<unknown>): Promise<boolean> => {
    try {
      await call();
      return true;
    } catch (e) {
      if (e instanceof BackendPendingError) { setPendingError(e); return true; }
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      return false;
    }
  };

  const openInvite = () => {
    setInviteEmail(''); setInviteRole('member'); setInviteError(null); setInviteOpen(true);
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!/.+@.+\..+/.test(email)) { setInviteError('Enter a valid email address.'); return; }
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setInviteError('This person is already a user or has a pending invite.'); return;
    }
    setSubmitting(true);
    setError(null);
    const ok = await runGated(() => inviteCharityMember({ email, role: inviteRole }));
    setSubmitting(false);
    if (!ok) return;
    setMembers((prev) => [
      ...prev,
      { id: `inv-${Date.now()}`, email, name: email.split('@')[0], member_role: inviteRole, status: 'invited', last_active_at: null },
    ]);
    setInviteOpen(false);
    setNotice(`Invite sent to ${email}.`);
  };

  const handleRoleChange = async (m: CharityMember, role: CharityMemberRole) => {
    if (m.member_role === 'owner' && role !== 'owner' && ownerCount <= 1) {
      setError('Each organisation must keep at least one Owner.'); return;
    }
    setError(null);
    if (await runGated(() => updateCharityMemberRole(m.id, role))) {
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, member_role: role } : x)));
      setNotice(`${m.name || m.email} is now ${ROLE_LABEL[role] ?? role}.`);
    }
  };

  const handleRemove = async (m: CharityMember) => {
    if (m.member_role === 'owner' && !isPending(m) && ownerCount <= 1) {
      setError('The only Owner cannot be removed. Make someone else an Owner first.'); return;
    }
    setError(null);
    if (await runGated(() => removeCharityMember(m.id))) {
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
      setNotice(isPending(m) ? `Invite to ${m.email} cancelled.` : `${m.name || m.email} has been removed.`);
    }
  };

  const handleResend = async (m: CharityMember) => {
    setError(null);
    if (await runGated(() => resendCharityInvite(m.id))) setNotice(`Invite resent to ${m.email}.`);
  };

  const handleBilling = async () => {
    setError(null);
    try {
      const { url } = await getCharityBillingPortal();
      if (url) window.location.href = url;
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e);
      else setError(e instanceof Error ? e.message : 'Could not open plan & billing.');
    }
  };

  return (
    <Stack gap={20} mt={20}>
      <BackendPendingDialog error={pendingError} onClose={() => setPendingError(null)} continuesWithDemo />

      <Box>
        <Title order={3} c="var(--bm-text-dark)">Users &amp; permissions</Title>
        <Text size="sm" c="var(--bm-text-muted)" mt={4}>Manage who can access your organisation.</Text>
      </Box>

      {/* 플랜 좌석 카드 */}
      <Card withBorder radius="lg" padding="lg">
        <Group justify="space-between" wrap="wrap" gap={16}>
          <Group gap={16} wrap="nowrap">
            <ThemeIcon size={56} radius="xl" color="sage" variant="light">
              <IconUsers size={26} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="md" c="var(--bm-text-dark)">
                {seatsUsed} of {seatLimit} users included in your plan
              </Text>
              <Text size="sm" c="var(--bm-text-muted)">Invite team members to help manage your organisation.</Text>
              <UnstyledButton onClick={handleBilling} mt={4}>
                <Group gap={4}>
                  <Text size="sm" fw={600} c="var(--bm-sage-dark)">View plan &amp; billing</Text>
                  <IconExternalLink size={14} color="var(--bm-sage-dark)" />
                </Group>
              </UnstyledButton>
            </Box>
          </Group>
          <Tooltip label={`Your plan includes up to ${seatLimit} users`} disabled={!seatsFull} withArrow>
            <Button
              color="sage"
              radius="md"
              size="md"
              leftSection={<IconPlus size={18} />}
              onClick={openInvite}
              disabled={seatsFull}
              style={{ background: seatsFull ? undefined : 'var(--bm-sage-dark, #2f5d50)' }}
            >
              Invite user
            </Button>
          </Tooltip>
        </Group>
      </Card>

      {notice && (
        <Alert icon={<IconCheck size={14} />} color="teal" variant="light" radius="md" withCloseButton onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert icon={<IconInfoCircle size={14} />} color="red" variant="light" radius="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 사용자 테이블 */}
      <Card withBorder radius="lg" padding={0}>
        <Group gap={10} px="lg" py="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <IconUsers size={20} color="var(--bm-sage-dark)" />
          <Text fw={700} size="md" c="var(--bm-text-dark)">Users</Text>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="md" horizontalSpacing="lg" miw={720}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Last active</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading && (
                <Table.Tr><Table.Td colSpan={5}><Text size="sm" c="dimmed">Loading users…</Text></Table.Td></Table.Tr>
              )}
              {!loading && members.map((m) => {
                const pending = isPending(m);
                const isOnlyOwner = m.member_role === 'owner' && !pending && ownerCount <= 1;
                return (
                  <Table.Tr key={m.id}>
                    <Table.Td>
                      <Group gap={12} wrap="nowrap">
                        <Avatar radius="xl" color={pending ? 'grape' : 'sage'}>{initials(m)}</Avatar>
                        <Box style={{ minWidth: 0 }}>
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>
                              {m.name || m.email.split('@')[0]}
                            </Text>
                            {m.member_role === 'owner' && <IconCrown size={13} color="var(--bm-terracotta)" />}
                          </Group>
                          <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{m.email}</Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={m.member_role === 'owner' ? 'teal' : 'gray'}
                        radius="sm"
                        tt="none"
                        size="lg"
                        fw={500}
                      >
                        {ROLE_LABEL[m.member_role] ?? m.member_role}
                      </Badge>
                    </Table.Td>
                    <Table.Td><StatusPill pending={pending} /></Table.Td>
                    <Table.Td>
                      <Text size="sm" c="var(--bm-text-muted)">{pending ? '—' : timeAgo(m.last_active_at)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {pending ? (
                        <Group gap={6} wrap="nowrap">
                          <Button variant="default" radius="md" size="sm" leftSection={<IconSend size={14} />} onClick={() => handleResend(m)}>
                            Resend invite
                          </Button>
                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" aria-label="More actions"><IconDotsVertical size={16} /></ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleRemove(m)}>
                                Cancel invite
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      ) : (
                        <Menu position="bottom-end" withinPortal>
                          <Menu.Target>
                            <Button variant="default" radius="md" size="sm" rightSection={<IconChevronDown size={14} />}>
                              Manage
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Role</Menu.Label>
                            {ROLE_OPTIONS.map((r) => (
                              <Menu.Item
                                key={r.value}
                                leftSection={r.value === 'owner' ? <IconCrown size={14} /> : <IconUser size={14} />}
                                rightSection={m.member_role === r.value ? <IconCheck size={14} /> : null}
                                disabled={m.member_role === r.value || (isOnlyOwner && r.value !== 'owner')}
                                onClick={() => handleRoleChange(m, r.value)}
                              >
                                Make {r.label}
                              </Menu.Item>
                            ))}
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              disabled={isOnlyOwner}
                              onClick={() => handleRemove(m)}
                            >
                              {isOnlyOwner ? 'Remove user (only Owner)' : 'Remove user'}
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>

        <Group gap={8} px="lg" py="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <IconInfoCircle size={16} color="var(--bm-text-muted)" />
          <Text size="sm" c="var(--bm-text-muted)">Pending invites will expire in 7 days.</Text>
        </Group>
      </Card>

      {/* 초대 모달 */}
      <Modal
        opened={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={<Text fw={700}>Invite user</Text>}
        centered
        radius="lg"
      >
        <Stack gap={14}>
          <Text size="sm" c="var(--bm-text-muted)">
            They’ll get an email invitation to join your organisation on Dear Giver.
          </Text>
          <TextInput
            label="Email"
            placeholder="teammate@yourcharity.org.nz"
            leftSection={<IconMail size={14} />}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.currentTarget.value)}
            type="email"
            radius="md"
            data-autofocus
          />
          <Select
            label="Role"
            data={ROLE_OPTIONS}
            value={inviteRole}
            onChange={(v) => setInviteRole((v as CharityMemberRole) ?? 'member')}
            allowDeselect={false}
            radius="md"
            description={inviteRole === 'owner'
              ? 'Owners can manage users, billing and organisation settings.'
              : 'Members can help with day-to-day work.'}
          />
          {inviteError && <Text size="sm" c="red">{inviteError}</Text>}
          <Group justify="flex-end" mt={4}>
            <Button variant="default" radius="md" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              radius="md"
              leftSection={<IconSend size={16} />}
              onClick={handleInvite}
              loading={submitting}
              style={{ background: 'var(--bm-sage-dark, #2f5d50)' }}
            >
              Send invite
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
