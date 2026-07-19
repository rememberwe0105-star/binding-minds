'use client';

import { Container, Text, Group, SimpleGrid, Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { organizations } from '@/data/organizations';
import { OrganizationCard } from '@/components/OrganizationCard';

// 히어로에서 특정 기관 스포트라이트를 없앤 대신,
// 탐색 흐름 속에서 여러 기관을 카드로 한꺼번에 소개하는 중립적 섹션
const FEATURED_COUNT = 8;

export function ExploreOrganisations() {
  // 검증된 기관 우선, 관심 표현이 많은 순으로 균형 있게 노출
  const featured = [...organizations]
    .sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return b.interestCount - a.interestCount;
    })
    .slice(0, FEATURED_COUNT);

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
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing={16}>
          {featured.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
