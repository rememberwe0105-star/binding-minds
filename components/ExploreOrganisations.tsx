'use client';

import { useEffect, useState } from 'react';
import { Container, Text, Group, SimpleGrid, Button, Loader, Box } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { type Organization } from '@/data/organizations';
import { getCharities } from '@/lib/api';
import { adaptCharity } from '@/lib/adapters';
import { OrganizationCard } from '@/components/OrganizationCard';

// 히어로에서 특정 기관 스포트라이트를 없앤 대신,
// 탐색 흐름 속에서 여러 기관을 카드로 한꺼번에 소개하는 중립적 섹션
const FEATURED_COUNT = 8;

export function ExploreOrganisations() {
  // 백엔드 실데이터 (FE-004) — claimed/partnered 우선 노출
  const [featured, setFeatured] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCharities({ pageSize: 24, sort: 'claimed' })
      .then((res) => {
        if (cancelled) return;
        const rank = (s: string) => (s === 'partnered' ? 0 : s === 'claimed' ? 1 : 2);
        const orgs = res.items
          .map(adaptCharity)
          .sort((a, b) => rank(a.status) - rank(b.status))
          .slice(0, FEATURED_COUNT);
        setFeatured(orgs);
      })
      .catch(() => { /* 홈 섹션 — 실패 시 조용히 숨김 */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // 로드 실패로 표시할 기관이 없으면 섹션 자체를 숨김
  if (!loading && featured.length === 0) return null;

  return (
    <section style={{ padding: '64px 0', background: 'var(--bm-bg-warm)' }}>
      <Container size="xl">
        <Group justify="space-between" mb={20}>
          <Text size="xl" fw={800} c="var(--bm-text-dark)">
            🏛️ Explore Organisations
          </Text>
          <Button
            component={Link}
            href="/charities"
            variant="subtle"
            color="sage"
            radius="xl"
            rightSection={<IconArrowRight size={16} />}
          >
            View all
          </Button>
        </Group>
        <Text size="sm" c="var(--bm-text-muted)" mb={24} maw={560}>
          Registered New Zealand charities you can support directly — verified against
          the NZ Charities Register.
        </Text>
        {loading ? (
          <Box ta="center" py={40}>
            <Loader color="sage" size="md" />
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing={16}>
            {featured.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </section>
  );
}
