'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Tabs, Table, Modal,
  Textarea, Alert, Stack, Divider, ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconBuilding, IconCheck, IconX, IconPhone,
  IconEye, IconShieldCheck, IconClock, IconAlertCircle,
  IconMail, IconWorld, IconCalendar,
} from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

// ── Mock 데이터 (백엔드 API 연동 전 데모용) ─────────────────
type AppStatus = 'pending' | 'approved' | 'rejected' | 'consultation';

interface CharityApplication {
  id: string;
  legalName: string;
  displayName: string;
  ccNumber: string;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  region: string;
  mission: string;
  description: string;
  website: string;
  yearEstablished: string;
  status: AppStatus;
  appliedAt: string;
  note?: string;
}

const MOCK_APPLICATIONS: CharityApplication[] = [
  {
    id: '1', legalName: 'Auckland City Mission Incorporated', displayName: 'Auckland City Mission',
    ccNumber: 'CC20073', category: 'Community & Social Services',
    contactName: 'Sarah Thompson', contactEmail: 'sarah@acmission.org.nz',
    contactPhone: '+64 9 303 9200', city: 'Auckland', region: 'Auckland',
    mission: '노숙인과 취약계층에게 식사, 의료, 주거 서비스를 제공합니다.',
    description: '1856년 설립된 Auckland City Mission은 Auckland에서 가장 오래된 자선단체 중 하나입니다. 연간 20만 명 이상에게 서비스를 제공하며, 홈리스 지원, 알코올 중독 치료, 노인 복지 프로그램을 운영합니다.',
    website: 'https://www.acmission.org.nz', yearEstablished: '1856',
    status: 'pending', appliedAt: '2026-05-15T08:30:00Z',
  },
  {
    id: '2', legalName: 'Surf Life Saving New Zealand', displayName: 'Surf Life Saving NZ',
    ccNumber: 'CC37291', category: 'Community & Social Services',
    contactName: 'Mark Johnson', contactEmail: 'mark@surflifesaving.org.nz',
    contactPhone: '+64 4 384 8325', city: 'Wellington', region: 'Wellington',
    mission: '해변 안전을 책임지고 해양 사고를 예방합니다.',
    description: '뉴질랜드 전역 74개 클럽, 17,000명 이상의 자원봉사자가 활동하는 해양 안전 단체입니다.',
    website: 'https://www.surflifesaving.org.nz', yearEstablished: '1910',
    status: 'pending', appliedAt: '2026-05-16T14:20:00Z',
  },
  {
    id: '3', legalName: 'SPCA New Zealand', displayName: 'SPCA NZ',
    ccNumber: 'CC24106', category: 'Animal Welfare',
    contactName: 'Emma Wilson', contactEmail: 'emma@spca.nz',
    contactPhone: '+64 9 827 6094', city: 'Auckland', region: 'Auckland',
    mission: '동물 학대를 방지하고 모든 동물의 복지를 증진합니다.',
    description: '1882년 설립. 연간 50,000마리 이상의 동물을 구조, 보호, 입양 연계합니다.',
    website: 'https://www.spca.nz', yearEstablished: '1882',
    status: 'approved', appliedAt: '2026-05-10T09:15:00Z',
  },
  {
    id: '4', legalName: 'Youth Mental Health NZ Trust', displayName: 'Youth Mental Health NZ',
    ccNumber: 'CC51834', category: 'Health & Medical',
    contactName: 'James Park', contactEmail: 'james@ymh.org.nz',
    contactPhone: '+64 9 555 0199', city: 'Christchurch', region: 'Canterbury',
    mission: '청소년 정신건강 지원 및 위기 개입 서비스를 제공합니다.',
    description: '10~24세 청소년을 위한 정신건강 상담, 위기 개입, 학교 방문 프로그램을 운영합니다.',
    website: 'https://www.ymh.org.nz', yearEstablished: '2015',
    status: 'consultation', appliedAt: '2026-05-12T11:45:00Z',
    note: 'CC 번호 확인 필요. 담당자에게 서류 추가 요청 예정.',
  },
  {
    id: '5', legalName: 'Fake Charity Ltd', displayName: 'Help Everyone',
    ccNumber: 'CC99999', category: 'Other',
    contactName: 'Unknown Person', contactEmail: 'info@faketest.com',
    contactPhone: '', city: 'Auckland', region: 'Auckland',
    mission: '모든 사람을 돕습니다.',
    description: '우리는 모든 사람을 돕는 좋은 단체입니다.',
    website: '', yearEstablished: '2026',
    status: 'rejected', appliedAt: '2026-05-14T16:00:00Z',
    note: 'NZ Charities Services에서 CC99999 등록 확인 불가. 웹사이트 없음. 신청 거절.',
  },
];

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '검토 대기', color: 'orange', icon: <IconClock size={14} /> },
  approved: { label: '승인됨', color: 'green', icon: <IconCheck size={14} /> },
  rejected: { label: '거절됨', color: 'red', icon: <IconX size={14} /> },
  consultation: { label: '상담 진행', color: 'blue', icon: <IconPhone size={14} /> },
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Pacific/Auckland',
  }).format(new Date(dateStr));
}

export default function AdminCharitiesPage() {
  const [apps, setApps] = useState<CharityApplication[]>(MOCK_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const [selected, setSelected] = useState<CharityApplication | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<AppStatus | null>(null);

  const counts = {
    pending: apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
    consultation: apps.filter((a) => a.status === 'consultation').length,
  };

  const filtered = apps.filter((a) => activeTab === 'all' || a.status === activeTab);

  const applyAction = (id: string, status: AppStatus, note: string) => {
    setApps((prev) =>
      prev.map((a) => a.id === id ? { ...a, status, note } : a)
    );
    setSelected(null);
    setConfirmAction(null);
    setActionNote('');
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>
          {/* 페이지 헤더 */}
          <Group justify="space-between" mb={8}>
            <Box>
              <Group gap={8} mb={4}>
                <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>
                  Admin Panel
                </Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>단체 등록 관리</Title>
            </Box>
            <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" radius="md" p={10}>
              <Text size="xs" fw={600}>데모 모드</Text>
              <Text size="xs">백엔드 API 연동 후 실제 데이터가 표시됩니다</Text>
            </Alert>
          </Group>

          {/* 통계 카드 */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={32}>
            {[
              { key: 'pending', label: '검토 대기', color: 'orange', icon: IconClock },
              { key: 'approved', label: '승인됨', color: 'green', icon: IconCheck },
              { key: 'consultation', label: '상담 진행', color: 'blue', icon: IconPhone },
              { key: 'rejected', label: '거절됨', color: 'red', icon: IconX },
            ].map(({ key, label, color, icon: Icon }) => (
              <Card
                key={key} padding="lg" radius="lg" withBorder
                className={classes.statCard}
                style={{ cursor: 'pointer', borderColor: activeTab === key ? `var(--mantine-color-${color}-4)` : undefined }}
                onClick={() => setActiveTab(key)}
              >
                <ThemeIcon size={36} radius="md" color={color} variant="light" mb={8}>
                  <Icon size={18} />
                </ThemeIcon>
                <Text size="xl" fw={900} c={`var(--mantine-color-${color}-7)`}>
                  {counts[key as AppStatus]}
                </Text>
                <Text size="sm" c="var(--bm-text-muted)">{label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* 탭 + 목록 */}
          <Card padding="lg" radius="lg" withBorder>
            <Tabs value={activeTab} onChange={setActiveTab} mb={16}>
              <Tabs.List>
                <Tabs.Tab value="pending">검토 대기 ({counts.pending})</Tabs.Tab>
                <Tabs.Tab value="consultation">상담 ({counts.consultation})</Tabs.Tab>
                <Tabs.Tab value="approved">승인됨 ({counts.approved})</Tabs.Tab>
                <Tabs.Tab value="rejected">거절됨 ({counts.rejected})</Tabs.Tab>
                <Tabs.Tab value="all">전체</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>단체명</Table.Th>
                  <Table.Th>CC 번호</Table.Th>
                  <Table.Th>분야</Table.Th>
                  <Table.Th>신청일</Table.Th>
                  <Table.Th>상태</Table.Th>
                  <Table.Th>액션</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((app) => {
                  const sc = STATUS_CONFIG[app.status];
                  return (
                    <Table.Tr key={app.id}>
                      <Table.Td>
                        <Text fw={600} size="sm" c="var(--bm-text-dark)">{app.displayName}</Text>
                        <Text size="xs" c="var(--bm-text-muted)">{app.contactEmail}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" ff="monospace">{app.ccNumber}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{app.category}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(app.appliedAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={sc.color} variant="light" leftSection={sc.icon}>
                          {sc.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="상세 보기 / 처리">
                          <ActionIcon
                            variant="light"
                            color="sage"
                            radius="md"
                            onClick={() => setSelected(app)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {filtered.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '32px 0' }}>
                      <Text c="var(--bm-text-muted)">해당 상태의 신청이 없습니다.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Container>
      </main>
      <Footer />

      {/* ── 상세 모달 ── */}
      <Modal
        opened={!!selected}
        onClose={() => { setSelected(null); setConfirmAction(null); setActionNote(''); }}
        size="lg"
        radius="lg"
        title={
          <Group gap={8}>
            <IconBuilding size={18} color="var(--bm-sage-dark)" />
            <Text fw={700}>{selected?.displayName}</Text>
            {selected && (
              <Badge color={STATUS_CONFIG[selected.status].color} variant="light">
                {STATUS_CONFIG[selected.status].label}
              </Badge>
            )}
          </Group>
        }
      >
        {selected && (
          <Stack gap={16}>
            {/* 기본 정보 */}
            <SimpleGrid cols={2} spacing={12}>
              {[
                { icon: IconBuilding, label: '법인명', value: selected.legalName },
                { icon: IconShieldCheck, label: 'CC 번호', value: selected.ccNumber },
                { icon: IconMail, label: '담당자 이메일', value: selected.contactEmail },
                { icon: IconPhone, label: '연락처', value: selected.contactPhone || '—' },
                { icon: IconWorld, label: '웹사이트', value: selected.website || '—' },
                { icon: IconCalendar, label: '신청일', value: formatDate(selected.appliedAt) },
              ].map(({ icon: Icon, label, value }) => (
                <Box key={label} p={10} style={{ background: 'var(--bm-sage-bg)', borderRadius: 8 }}>
                  <Group gap={6} mb={2}>
                    <Icon size={12} color="var(--bm-sage-dark)" />
                    <Text size="xs" c="var(--bm-text-muted)">{label}</Text>
                  </Group>
                  <Text size="sm" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)" mb={6}>미션</Text>
              <Text size="sm" c="var(--bm-text-dark)" lh={1.7}>{selected.mission}</Text>
            </Box>

            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)" mb={6}>단체 소개</Text>
              <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>{selected.description}</Text>
            </Box>

            {selected.note && (
              <Alert icon={<IconAlertCircle size={14} />} color="blue" variant="light" radius="md">
                <Text size="xs" fw={600} mb={2}>메모</Text>
                <Text size="sm">{selected.note}</Text>
              </Alert>
            )}

            <Divider />

            {/* 액션 메모 */}
            <Textarea
              label="처리 메모 (선택)"
              placeholder="거절 사유, 상담 내용, 특이사항 등을 입력하세요..."
              value={actionNote}
              onChange={(e) => setActionNote(e.currentTarget.value)}
              autosize
              minRows={2}
              radius="md"
            />

            {/* 액션 버튼 */}
            <Group grow>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'approved', actionNote)}
                disabled={selected.status === 'approved'}
              >
                승인
              </Button>
              <Button
                color="blue"
                variant="light"
                leftSection={<IconPhone size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'consultation', actionNote)}
                disabled={selected.status === 'consultation'}
              >
                상담 진행
              </Button>
              <Button
                color="red"
                variant="light"
                leftSection={<IconX size={16} />}
                radius="xl"
                onClick={() => applyAction(selected.id, 'rejected', actionNote)}
                disabled={selected.status === 'rejected'}
              >
                거절
              </Button>
            </Group>

            <Text size="xs" c="var(--bm-text-muted)" ta="center">
              ⚠️ 현재 데모 모드 — 실제 이메일 발송 및 DB 저장은 백엔드 API 연동 후 작동합니다
            </Text>
          </Stack>
        )}
      </Modal>
    </>
  );
}
