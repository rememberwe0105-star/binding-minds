'use client';

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
} from '@mantine/core';
import {
  IconHeart,
  IconReceipt,
  IconCoin,
  IconCalendar,
  IconLeaf,
  IconDownload,
  IconArrowRight,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import classes from './page.module.css';

// 목업 기부 내역 데이터
const mockDonations = [
  { id: 1, campaign: 'Restore Aotearoa\'s Native Forest', amount: 50, date: '2026-05-10', status: 'completed' },
  { id: 2, campaign: 'Feed the Community', amount: 25, date: '2026-05-05', status: 'completed' },
  { id: 3, campaign: 'Education For All', amount: 100, date: '2026-04-28', status: 'completed' },
];

function DashboardContent() {
  const { user } = useAuth();

  const totalDonated = mockDonations.reduce((sum, d) => sum + d.amount, 0);
  const taxRefund = Math.round(totalDonated * 0.3333);
  const totalCampaigns = new Set(mockDonations.map((d) => d.campaign)).size;

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
                Here&apos;s your giving summary.
              </Text>
            </Box>
          </Group>

          {/* 통계 카드 */}
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing={16} mb={32}>
            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={40} radius="md" color="terracotta" variant="light" mb={12}>
                <IconCoin size={20} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="var(--bm-text-dark)">${totalDonated}</Text>
              <Text size="xs" c="var(--bm-text-muted)">Total Donated</Text>
            </Card>

            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={40} radius="md" color="sage" variant="light" mb={12}>
                <IconReceipt size={20} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="var(--bm-sage-dark)">${taxRefund}</Text>
              <Text size="xs" c="var(--bm-text-muted)">Est. Tax Refund</Text>
            </Card>

            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={40} radius="md" color="blue" variant="light" mb={12}>
                <IconHeart size={20} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="var(--bm-text-dark)">{totalCampaigns}</Text>
              <Text size="xs" c="var(--bm-text-muted)">Campaigns Supported</Text>
            </Card>

            <Card padding="lg" radius="lg" withBorder className={classes.statCard}>
              <ThemeIcon size={40} radius="md" color="grape" variant="light" mb={12}>
                <IconCalendar size={20} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="var(--bm-text-dark)">{mockDonations.length}</Text>
              <Text size="xs" c="var(--bm-text-muted)">Total Donations</Text>
            </Card>
          </SimpleGrid>

          {/* 기부 내역 테이블 */}
          <Card padding="lg" radius="lg" withBorder mb={32}>
            <Group justify="space-between" mb={16}>
              <Title order={4} c="var(--bm-text-dark)">Recent Donations</Title>
              <Button
                variant="subtle"
                color="terracotta"
                size="xs"
                rightSection={<IconDownload size={14} />}
              >
                Download Receipts
              </Button>
            </Group>

            {mockDonations.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Campaign</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockDonations.map((d) => (
                    <Table.Tr key={d.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{d.campaign}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600}>${d.amount}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">{d.date}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" variant="light" size="sm">
                          {d.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Box ta="center" py={40}>
                <IconLeaf size={48} color="var(--bm-sage)" style={{ opacity: 0.4 }} />
                <Text size="md" c="var(--bm-text-muted)" mt={12}>
                  You haven&apos;t made any donations yet.
                </Text>
                <Button
                  component={Link}
                  href="/campaigns"
                  color="terracotta"
                  mt={16}
                  radius="xl"
                  rightSection={<IconArrowRight size={16} />}
                >
                  Find a Cause
                </Button>
              </Box>
            )}
          </Card>

          {/* Tax Refund CTA */}
          <Card
            padding="xl"
            radius="lg"
            className={classes.taxCard}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap={16}>
              <Box>
                <Text size="sm" fw={600} c="rgba(255,255,255,0.7)" tt="uppercase" mb={4}>
                  Tax Season Helper
                </Text>
                <Title order={3} c="white" mb={4}>
                  Claim your ${taxRefund} tax refund
                </Title>
                <Text size="sm" c="rgba(255,255,255,0.6)">
                  We&apos;ve consolidated your donation receipts for easy claiming.
                </Text>
              </Box>
              <Button color="white" variant="white" radius="xl" rightSection={<IconDownload size={16} />}>
                Download Tax Summary
              </Button>
            </Group>
          </Card>
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
