'use client';

import {
  Container,
  Title,
  Text,
  Box,
  Card,
  Badge,
  Button,
  SimpleGrid,
  ThemeIcon,
  Group,
} from '@mantine/core';
import {
  IconReceipt,
  IconUsers,
  IconFolderCheck,
  IconBuilding,
  IconArrowLeft,
  IconClock,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fraunces } from '@/lib/fonts';


// ============================================================
// Donation Tax Credits 가이드 (update 5)
// 메뉴/링크 구조를 먼저 잡아둔 placeholder 페이지 —
// 확정된 본문 콘텐츠가 오면 아래 섹션 목차를 채우는 방식으로 업데이트한다.
// ============================================================

const PLANNED_SECTIONS = [
  {
    icon: IconReceipt,
    title: 'What is the donation tax credit?',
    description: 'How the 33.33% credit works for eligible donations to approved donee organisations in New Zealand.',
  },
  {
    icon: IconUsers,
    title: 'Who can claim, and for what?',
    description: 'Eligibility basics — donation size, approved organisations, and the records IRD expects.',
  },
  {
    icon: IconFolderCheck,
    title: 'How Dear Giver helps at tax time',
    description: 'Receipts and giving records kept together, with standardised details ready for your claim.',
  },
  {
    icon: IconBuilding,
    title: 'Giving as a business or organisation',
    description: 'Different rules may apply to organisational giving — what to know before you claim.',
  },
];

export default function DonationTaxCreditsPage() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--bm-bg-warm)', minHeight: '70vh', paddingBottom: 64 }}>
        <Container size="xl" pt={24}>
          {/* 딥 틸 헤더 밴드 — Projects/Charities와 통일 */}
          <Box
            style={{
              textAlign: 'center',
              padding: '44px 24px 48px',
              marginBottom: 40,
              background:
                'radial-gradient(480px 300px at 84% 8%, rgba(127, 188, 173, 0.16), transparent 68%), radial-gradient(420px 280px at 8% 96%, rgba(226, 114, 91, 0.11), transparent 70%), var(--dg-hero-grad)',
              borderRadius: 20,
            }}
          >
            <Text size="md" fw={800} tt="uppercase" c="#eba98c" mb={8} style={{ letterSpacing: '1.5px' }}>
              Support
            </Text>
            <Title
              order={1}
              className={fraunces.className}
              style={{ fontSize: '2.35rem', color: 'var(--dg-hero-text)', lineHeight: 1.15 }}
            >
              Donation Tax Credits
            </Title>
            <Text fz={19} c="var(--dg-hero-muted)" maw={640} mt={10} mx="auto" lh={1.7}>
              A practical guide to New Zealand&apos;s 33.33% donation tax credit —
              and how Dear Giver keeps your records ready for it.
            </Text>
          </Box>
        </Container>

        <Container size="md">
          {/* Placeholder 안내 */}
          <Card
            withBorder
            radius="lg"
            padding="xl"
            mb={28}
            style={{ borderStyle: 'dashed', textAlign: 'center' }}
          >
            <ThemeIcon size={48} radius="xl" color="sage" variant="light" mx="auto" mb={12}>
              <IconClock size={24} />
            </ThemeIcon>
            <Group justify="center" gap={8} mb={8}>
              <Text fw={700} size="lg" c="var(--bm-text-dark)">Full guide coming soon</Text>
              <Badge variant="light" color="terracotta" size="sm">In progress</Badge>
            </Group>
            <Text size="sm" c="var(--bm-text-muted)" maw={520} mx="auto" lh={1.7}>
              We&apos;re putting the finishing touches on this guide. Here&apos;s what it
              will cover — check back shortly.
            </Text>
          </Card>

          {/* 예정 목차 (placeholder) */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16} mb={36}>
            {PLANNED_SECTIONS.map((s) => (
              <Card key={s.title} withBorder radius="lg" padding="lg">
                <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={10}>
                  <s.icon size={22} />
                </ThemeIcon>
                <Text size="sm" fw={700} c="var(--bm-text-dark)" mb={4}>{s.title}</Text>
                <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>{s.description}</Text>
              </Card>
            ))}
          </SimpleGrid>

          <Group justify="center">
            <Button
              component={Link}
              href="/support"
              variant="outline"
              color="sage"
              radius="xl"
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to Help Centre
            </Button>
          </Group>

          <Text ta="center" size="xs" c="dimmed" mt={28} fs="italic">
            This page provides general information only and is not tax advice.
            Check with IRD for your eligibility.
          </Text>
        </Container>
      </main>
      <Footer />
    </>
  );
}
