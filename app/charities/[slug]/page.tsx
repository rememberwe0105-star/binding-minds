'use client';

import { use, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Box,
  SimpleGrid,
  Button,
  ThemeIcon,
  Divider,
  Title as MantineTitle,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconCalendar,
  IconWorld,
  IconHeart,
  IconUsers,
  IconClipboardList,
  IconExternalLink,
  IconArrowLeft,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { DonationCheckoutModal } from '@/components/DonationCheckoutModal';
import { getOrganizationBySlug, ORGANIZER_TO_ORG_SLUG } from '@/data/organizations';
import { campaigns, formatCurrency } from '@/data/campaigns';
import type { Campaign } from '@/data/campaigns';
import classes from './page.module.css';

// Organization → "fake" Campaign 변환 (기부 모달 호환용)
function orgToCampaign(org: ReturnType<typeof getOrganizationBySlug>): Campaign {
  return {
    id: org!.id,
    name: org!.name,
    slug: `org/${org!.slug}`,
    category: org!.category,
    region: org!.region,
    description: org!.mission,
    longDescription: org!.description,
    image: org!.image,
    raised: org!.totalRaised,
    goal: 0, // 기관 직접 기부는 목표 없음
    donorCount: org!.donorCount,
    daysLeft: 0, // 상시 열려있음
    organizer: org!.name,
    verified: org!.verified,
    featured: false,
    trending: false,
    createdAt: '',
  };
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const org = getOrganizationBySlug(slug);
  const [donationOpened, setDonationOpened] = useState(false);

  if (!org) {
    notFound();
  }

  // 이 기관의 캠페인 찾기
  const orgCampaigns = campaigns.filter((c) => {
    const mappedSlug = ORGANIZER_TO_ORG_SLUG[c.organizer];
    return mappedSlug === org.slug;
  });

  const fakeCampaign = orgToCampaign(org);

  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* Hero 섹션 */}
        <div className={classes.hero}>
          <div className={classes.heroImage}>
            <NextImage
              src={org.image}
              alt={org.name}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className={classes.heroOverlay} />
          </div>
          <Container size="lg" className={classes.heroContent}>
            <Link href="/charities" className={classes.backLink}>
              <IconArrowLeft size={16} />
              Back to Charities
            </Link>
            <Badge
              size="lg"
              variant="filled"
              color="dark"
              mb={12}
              leftSection={<IconShieldCheck size={14} />}
            >
              Verified Organisation · {org.charityNumber}
            </Badge>
            <Title order={1} className={classes.heroTitle}>
              {org.name}
            </Title>
            <Text className={classes.heroMission}>{org.mission}</Text>
            <Group mt={24} gap={12}>
              <Button
                size="lg"
                radius="xl"
                color="terracotta"
                leftSection={<IconHeart size={18} />}
                onClick={() => setDonationOpened(true)}
                className={classes.donateBtn}
              >
                Donate to {org.name}
              </Button>
              {org.website && (
                <Button
                  variant="outline"
                  size="lg"
                  radius="xl"
                  color="white"
                  component="a"
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  rightSection={<IconExternalLink size={16} />}
                  className={classes.websiteBtn}
                >
                  Visit Website
                </Button>
              )}
            </Group>
          </Container>
        </div>

        <Container size="lg" className={classes.contentArea}>
          {/* 통계 카드 */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={16} mb={48}>
            <div className={classes.statCard}>
              <ThemeIcon size={40} radius="xl" color="terracotta" variant="light">
                <IconHeart size={20} />
              </ThemeIcon>
              <Text size="xl" fw={800} mt={8} c="var(--bm-text-dark)">
                {formatCurrency(org.totalRaised)}
              </Text>
              <Text size="xs" c="dimmed">Total Raised</Text>
            </div>
            <div className={classes.statCard}>
              <ThemeIcon size={40} radius="xl" color="sage" variant="light">
                <IconUsers size={20} />
              </ThemeIcon>
              <Text size="xl" fw={800} mt={8} c="var(--bm-text-dark)">
                {org.donorCount.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">Donors</Text>
            </div>
            <div className={classes.statCard}>
              <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                <IconClipboardList size={20} />
              </ThemeIcon>
              <Text size="xl" fw={800} mt={8} c="var(--bm-text-dark)">
                {org.activeCampaigns}
              </Text>
              <Text size="xs" c="dimmed">Active Projects</Text>
            </div>
            <div className={classes.statCard}>
              <ThemeIcon size={40} radius="xl" color="grape" variant="light">
                <IconCalendar size={20} />
              </ThemeIcon>
              <Text size="xl" fw={800} mt={8} c="var(--bm-text-dark)">
                {org.yearFounded}
              </Text>
              <Text size="xs" c="dimmed">Established</Text>
            </div>
          </SimpleGrid>

          {/* 상세 소개 */}
          <Box className={classes.descriptionBlock}>
            <div className={classes.markdown}>
              {org.description.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('## ')) {
                  return <MantineTitle key={i} order={2} className={classes.descH2} mt={32} mb={12}>{trimmed.slice(3)}</MantineTitle>;
                }
                if (trimmed.startsWith('### ')) {
                  return <MantineTitle key={i} order={3} className={classes.descH3} mt={24} mb={8}>{trimmed.slice(4)}</MantineTitle>;
                }
                if (trimmed.startsWith('- **')) {
                  const parts = trimmed.slice(2).split('**');
                  return (
                    <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.8} mb={4} pl={16}>
                      • <strong>{parts[1]}</strong>{parts[2]}
                    </Text>
                  );
                }
                if (trimmed.startsWith('- ')) {
                  return (
                    <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.8} mb={4} pl={16}>
                      • {trimmed.slice(2)}
                    </Text>
                  );
                }
                if (trimmed === '') return <Box key={i} h={8} />;
                const boldParts = trimmed.split(/\*\*(.*?)\*\*/g);
                return (
                  <Text key={i} size="md" c="var(--bm-text-muted)" lh={1.8} mb={8}>
                    {boldParts.map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </Text>
                );
              })}
            </div>
          </Box>

          {/* 관련 캠페인 */}
          {orgCampaigns.length > 0 && (
            <>
              <Divider
                my={48}
                label={
                  <Group gap={8}>
                    <IconClipboardList size={16} />
                    <Text fw={600}>Active Projects by {org.name}</Text>
                  </Group>
                }
                labelPosition="center"
              />
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={20}>
                {orgCampaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </SimpleGrid>
            </>
          )}

          {/* 정보 카드 */}
          <Box mt={48} className={classes.infoCard}>
            <Group gap={8} mb={8}>
              <IconWorld size={18} color="var(--bm-sage)" />
              <Text size="sm" fw={600} c="var(--bm-text-dark)">Organisation Details</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12}>
              <Group gap={8}>
                <Text size="xs" c="dimmed" w={100}>Category</Text>
                <Badge size="sm" color="sage" variant="light">{org.category}</Badge>
              </Group>
              <Group gap={8}>
                <Text size="xs" c="dimmed" w={100}>Region</Text>
                <Text size="sm">{org.region}</Text>
              </Group>
              <Group gap={8}>
                <Text size="xs" c="dimmed" w={100}>Registration</Text>
                <Text size="sm" ff="monospace">{org.charityNumber}</Text>
              </Group>
              <Group gap={8}>
                <Text size="xs" c="dimmed" w={100}>Website</Text>
                <Text
                  size="sm"
                  component="a"
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="var(--bm-terracotta)"
                >
                  {org.website.replace('https://', '')}
                </Text>
              </Group>
            </SimpleGrid>
          </Box>

          {/* 하단 CTA */}
          <Box ta="center" mt={48} mb={32}>
            <Button
              size="xl"
              radius="xl"
              color="terracotta"
              leftSection={<IconHeart size={20} />}
              onClick={() => setDonationOpened(true)}
              className={classes.donateBtn}
            >
              Support {org.name} Today
            </Button>
            <Text size="xs" c="dimmed" mt={8}>
              33.33% tax credit on all donations to verified NZ charities
            </Text>
          </Box>
        </Container>
      </main>
      <Footer />

      {/* 기부 모달 */}
      <DonationCheckoutModal
        opened={donationOpened}
        onClose={() => setDonationOpened(false)}
        campaign={fakeCampaign}
      />
    </>
  );
}
