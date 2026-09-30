'use client';

import { useState, useEffect } from 'react';
import {
  Card, Text, Group, Box, Badge, Button, TextInput, Select, Stack,
  Avatar, Alert, Divider, ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconUsers, IconUserPlus, IconTrash, IconCrown, IconInfoCircle, IconMail,
} from '@tabler/icons-react';
import {
  getCharityMembers, inviteCharityMember, removeCharityMember, updateCharityMemberRole,
  BackendPendingError, type CharityMember, type CharityMemberRole,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BackendPendingDialog } from './BackendPendingDialog';

// ============================================================
// 기관 팀 관리 (Users & Permissions) — Growth 전용
//
// Owner: 기관 최종 관리자 (사용자 초대/삭제·billing·설정). 기관마다 필수 1명 유지.
// Member: 일반 구성원. 지금은 Owner/Member 2단계만 노출하되, role 은 확장 가능한
//         유니온으로 잡아 두어 나중에 Finance/Campaign Manager/Admin 세분화가 가능하다.
// 실 API 우선 호출 → 미구현이면 안내 후 데모 상태로 폴백 (게이트 패턴).
// ============================================================

// 지금 UI에 노출할 역할 (확장 시 이 배열에 추가)
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

const roleColor = (r: string) => (r === 'owner' ? 'terracotta' : r === 'admin' ? 'blue' : 'sage');
const statusColor = (s?: string) => (s === 'invited' || s === 'pending' ? 'yellow' : 'teal');

export function CharityMembersTab() {
  const { displayName, displayEmail } = useAuth();

  const [members, setMembers] = useState<CharityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CharityMemberRole>('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<BackendPendingError | null>(null);

  // 현재 로그인 사용자를 Owner 로 하는 데모 시드 (실 API 미구현 시 폴백)
  const demoSeed = (): CharityMember[] => [
    { id: 'me', email: displayEmail || 'owner@yourcharity.org.nz', name: displayName || 'You', member_role: 'owner', status: 'active' },
  ];

  useEffect(() => {
    let cancelled = false;
    getCharityMembers()
      .then((res) => { if (!cancelled) setMembers(res.members ?? []); })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof BackendPendingError) setMembers(demoSeed()); // 미구현 → 데모
        else setMembers(demoSeed());
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownerCount = members.filter((m) => m.member_role === 'owner').length;

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !/.+@.+\..+/.test(email)) { setError('Enter a valid email address.'); return; }
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setError('That email is already a member or invited.'); return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await inviteCharityMember({ email, role: inviteRole });
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e); // 안내 후 데모 반영
      else { setError(e instanceof Error ? e.message : 'Failed to send invite.'); setSubmitting(false); return; }
    }
    // 데모/성공 공통 — 목록에 초대 상태로 추가
    setMembers((prev) => [
      ...prev,
      { id: `inv-${Date.now()}`, email, name: email.split('@')[0], member_role: inviteRole, status: 'invited' },
    ]);
    setInviteEmail('');
    setInviteRole('member');
    setSubmitting(false);
  };

  const handleRoleChange = async (m: CharityMember, role: CharityMemberRole) => {
    // 마지막 Owner 를 강등하면 Owner 가 사라지므로 차단
    if (m.member_role === 'owner' && role !== 'owner' && ownerCount <= 1) {
      setError('Each organisation must keep at least one Owner.'); return;
    }
    setError(null);
    try {
      await updateCharityMemberRole(m.id, role);
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e);
      else { setError(e instanceof Error ? e.message : 'Failed to update role.'); return; }
    }
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, member_role: role } : x)));
  };

  const handleRemove = async (m: CharityMember) => {
    if (m.member_role === 'owner') { setError('The Owner cannot be removed. Transfer ownership first.'); return; }
    setError(null);
    try {
      await removeCharityMember(m.id);
    } catch (e) {
      if (e instanceof BackendPendingError) setPendingError(e);
      else { setError(e instanceof Error ? e.message : 'Failed to remove member.'); return; }
    }
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
  };

  return (
    <Stack gap={20} mt={20}>
      <BackendPendingDialog error={pendingError} onClose={() => setPendingError(null)} continuesWithDemo />

      {/* 초대 카드 */}
      <Card withBorder radius="lg" padding="xl">
        <Group gap={8} mb={4}>
          <IconUsers size={20} color="var(--bm-sage-dark)" />
          <Text fw={700} size="md" c="var(--bm-text-dark)">Users &amp; Permissions</Text>
          <Badge size="sm" variant="light" color="terracotta">Growth</Badge>
        </Group>
        <Text size="sm" c="var(--bm-text-muted)" mb={20}>
          Invite people to help manage your organisation. Owners can manage users, billing and
          settings; Members can help with day-to-day work. Each organisation keeps at least one Owner.
        </Text>

        <Group align="flex-end" gap={12} wrap="wrap">
          <TextInput
            label="Invite by email"
            placeholder="teammate@yourcharity.org.nz"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.currentTarget.value)}
            leftSection={<IconMail size={14} />}
            radius="md"
            style={{ flex: 1, minWidth: 240 }}
            type="email"
          />
          <Select
            label="Role"
            data={ROLE_OPTIONS}
            value={inviteRole}
            onChange={(v) => setInviteRole((v as CharityMemberRole) ?? 'member')}
            radius="md"
            w={150}
            allowDeselect={false}
          />
          <Button
            color="terracotta"
            radius="xl"
            leftSection={<IconUserPlus size={16} />}
            onClick={handleInvite}
            loading={submitting}
          >
            Send invite
          </Button>
        </Group>
        {error && (
          <Alert icon={<IconInfoCircle size={14} />} color="red" variant="light" radius="md" mt={12}>
            {error}
          </Alert>
        )}
      </Card>

      {/* 멤버 목록 */}
      <Card withBorder radius="lg" padding="xl">
        <Text fw={700} size="sm" c="var(--bm-text-dark)" mb={4}>Team members</Text>
        <Text size="xs" c="var(--bm-text-muted)" mb={16}>
          {loading ? 'Loading…' : `${members.length} ${members.length === 1 ? 'person' : 'people'}`}
        </Text>

        <Stack gap={10}>
          {members.map((m) => (
            <Group key={m.id} justify="space-between" wrap="nowrap"
              style={{ padding: '10px 4px', borderTop: '1px solid var(--bm-border, #eee)' }}>
              <Group gap={12} wrap="nowrap" style={{ minWidth: 0 }}>
                <Avatar radius="xl" color={m.member_role === 'owner' ? 'terracotta' : 'sage'}>
                  {(m.name || m.email).charAt(0).toUpperCase()}
                </Avatar>
                <Box style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{m.name || m.email}</Text>
                    {m.member_role === 'owner' && <IconCrown size={13} color="var(--bm-terracotta)" />}
                  </Group>
                  <Text size="xs" c="var(--bm-text-muted)" lineClamp={1}>{m.email}</Text>
                </Box>
              </Group>

              <Group gap={8} wrap="nowrap">
                <Badge size="sm" variant="light" color={statusColor(m.status)}>
                  {m.status === 'invited' || m.status === 'pending' ? 'Invited' : 'Active'}
                </Badge>
                {/* 역할 — Owner 가 1명뿐이면 그 Owner 는 변경 불가 */}
                <Select
                  data={ROLE_OPTIONS.some((r) => r.value === m.member_role)
                    ? ROLE_OPTIONS
                    : [...ROLE_OPTIONS, { value: m.member_role, label: ROLE_LABEL[m.member_role] ?? m.member_role }]}
                  value={m.member_role}
                  onChange={(v) => v && handleRoleChange(m, v as CharityMemberRole)}
                  size="xs"
                  w={140}
                  radius="md"
                  allowDeselect={false}
                  disabled={m.member_role === 'owner' && ownerCount <= 1}
                />
                <Tooltip label={m.member_role === 'owner' ? 'Owner cannot be removed' : 'Remove member'} withArrow>
                  <ActionIcon
                    variant="light"
                    color="red"
                    radius="md"
                    onClick={() => handleRemove(m)}
                    disabled={m.member_role === 'owner'}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          ))}
        </Stack>

        <Divider my={16} />
        <Text size="xs" c="dimmed">
          Roles can be expanded later (e.g. Finance, Campaign Manager, Admin) for more granular access.
        </Text>
      </Card>
    </Stack>
  );
}
