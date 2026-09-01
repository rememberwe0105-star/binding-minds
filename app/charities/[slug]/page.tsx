'use client';

import { use, useState, useEffect } from 'react';
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
  Loader,
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
  IconLock,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { DonationCheckoutModal } from '@/components/DonationCheckoutModal';
import { ClaimProfileBanner } from '@/components/ClaimProfileBanner';
import { ShareButton } from '@/components/ShareButton';
import { SupporterFundraisersSection } from '@/components/SupporterFundraisers';
import { formatCurrency } from '@/data/campaigns';
import type { Organization } from '@/data/organizations';
import { getCharityBySlug, type ApiCharityDetail } from '@/lib/api';
import { adaptCharity, adaptProject, type AdaptedProject } from '@/lib/adapters';
import classes from './page.module.css';

// 기관 직접 기부용 "fake" Campaign (기부 모달 호환) — stripe 계정 값 포함
function orgToCampaign(org: Organization, stripeAccountId?: string | null): AdaptedProject {
  return {
    id: org.id,
    name: org.name,
    slug: `org/${org.slug}`,
    category: org.category,
    region: org.region,
    description: org.mission,
    longDescription: org.description,
    image: org.image,
    raised: org.totalRaised,
    goal: 0, // 기관 직접 기부는 목표 없음
    donorCount: org.donorCount,
    daysLeft: 0, // 상시 열려있음
    organizer: org.name,
    verified: org.verified,
    featured: false,
    trending: false,
    createdAt: '',
    stripeAccountId: stripeAccountId ?? undefined,
    backendProjectId: 0,
    charitySlug: org.slug,
    charityId: Number(org.id) || 0,
  };
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [donationOpened, setDonationOpened] = useState(false);

  // 백엔드 실데이터 (FE-004) — GET /charities/:slug (projects[] 포함)
  const [org, setOrg] = useState<Organization | null>(null);
  const [detail, setDetail] = useState<ApiCharityDetail | null>(null);
  const [orgCampaigns, setOrgCampaigns] = useState<AdaptedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCharityBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        setDetail(res);
        setOrg(adaptCharity(res));
        setOrgCampaigns((res.projects ?? []).map(adaptProject));
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className={classes.page}>
          <Box ta="center" py={120}>
            <Loader color="sage" size="lg" />
          </Box>
        </main>
        <Footer />
      </>
    );
  }

  if (failed || !org) {
    notFound();
  }

  const isPartnered = org.status === 'partnered';
  const fakeCampaign = orgToCampaign(org, detail?.stripe_account_id);

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
            <Group gap={8} mb={12}>
              <Badge
                size="lg"
                variant="filled"
                color="dark"
                leftSection={<IconShieldCheck size={14} />}
              >
                Registered Charity · {org.charityNumber}
              </Badge>
              {!isPartnered && (
                <Badge
                  size="lg"
                  variant="light"
                  color="orange"
                  leftSection={<IconLock size={14} />}
                >
                  Unclaimed Profile
                </Badge>
              )}
            </Group>
            <Title order={1} className={classes.heroTitle}>
              {org.name}
            </Title>
            <Text className={classes.heroMission}>{org.mission}</Text>
            <Group mt={24} gap={12}>
              {isPartnered ? (
                <Button
                  size="lg"
                  radius="xl"
                  color="terracotta"
                  leftSection={<IconHeart size={18} />}
                  onClick={() => setDonationOpened(true)}
                  className={classes.donateBtn}
                  disabled={!fakeCampaign.stripeAccountId}
                >
                  {fakeCampaign.stripeAccountId ? `Donate to ${org.name}` : 'Donations opening soon'}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href="/charity/apply"
                  size="lg"
                  radius="xl"
                  color="sage"
                  leftSection={<IconShieldCheck size={18} />}
                  className={classes.donateBtn}
                >
                  Claim this Profile
                </Button>
              )}
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
              {org.status !== 'unclaimed' && orgCampaigns.length > 0 && (
                <Button
                  component="a"
                  href="#org-projects"
                  variant="outline"
                  size="lg"
                  radius="xl"
                  color="white"
                  leftSection={<IconClipboardList size={18} />}
                  className={classes.websiteBtn}
                >
                  View Projects ({orgCampaigns.length})
                </Button>
              )}
              <ShareButton variant="outline" color="white" className={classes.websiteBtn} />
            </Group>
          </Container>
        </div>

        <Container size="lg" className={classes.contentArea}>
          {/* Claim / Interest 배너 — unclaimed 기관에만 표시 */}
          {!isPartnered && (
            <ClaimProfileBanner organization={org} />
          )}

          {/* 통계 카드 — partnered 기관에만 표시 */}
          {isPartnered && (
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
                  {org.region}
                </Text>
                <Text size="xs" c="dimmed">Region</Text>
              </div>
            </SimpleGrid>
          )}

          {/* unclaimed 기관 기본 정보 카드 */}
          {!isPartnered && (
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={16} mb={48}>
              <div className={classes.statCard}>
                <ThemeIcon size={40} radius="xl" color="sage" variant="light">
                  <IconShieldCheck size={20} />
                </ThemeIcon>
                <Text size="md" fw={700} mt={8} c="var(--bm-text-dark)">
                  {org.charityNumber}
                </Text>
                <Text size="xs" c="dimmed">CC Registration</Text>
              </div>
              <div className={classes.statCard}>
                <ThemeIcon size={40} radius="xl" color="grape" variant="light">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <Text size="md" fw={700} mt={8} c="var(--bm-text-dark)">
                  {org.category}
                </Text>
                <Text size="xs" c="dimmed">Category</Text>
              </div>
              <div className={classes.statCard}>
                <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                  <IconWorld size={20} />
                </ThemeIcon>
                <Text size="md" fw={700} mt={8} c="var(--bm-text-dark)">
                  {org.region}
                </Text>
                <Text size="xs" c="dimmed">Region</Text>
              </div>
            </SimpleGrid>
          )}

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

          {/* 관련 캠페인 — 기관이 관리 중(claimed 이상)이면 표시 (update 5) */}
          {org.status !== 'unclaimed' && orgCampaigns.length > 0 && (
            <div id="org-projects">
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
            </div>
          )}

          {/* P2P 서포터 펀드레이저 — 기관이 관리 중(claimed 이상)이면 표시 (update 5) */}
          {org.status !== 'unclaimed' && (
            <SupporterFundraisersSection charityName={org.name} charitySlug={org.slug} />
          )}

          {/* 정보 카드 */}
          <Box mt={48} className={classes.infoCard}>
            <Group gap={8} mb={8}>
              <IconWorld size={18} color="var(--bm-sage)" />
              <Text size="sm" fw={600} c="var(--bm-text-dark)">Charity Details</Text>
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
              <Group gap={8}>
                <Text size="xs" c="dimmed" w={100}>Status</Text>
                <Badge
                  size="sm"
                  color={isPartnered ? 'sage' : 'orange'}
                  variant="light"
                >
                  {isPartnered ? 'Active Partner' : 'Unclaimed Profile'}
                </Badge>
              </Group>
            </SimpleGrid>
          </Box>

          {/* 하단 CTA */}
          <Box ta="center" mt={48} mb={32}>
            {isPartnered ? (
              <>
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
              </>
            ) : (
              <>
                <Text size="md" c="var(--bm-text-muted)" mb={12}>
                  Are you from {org.name}?
                </Text>
                <Button
                  component={Link}
                  href="/charity/apply"
                  size="lg"
                  radius="xl"
                  color="sage"
                  leftSection={<IconShieldCheck size={18} />}
                >
                  Claim Your Profile & Start Receiving Donations
                </Button>
                <Text size="xs" c="dimmed" mt={8}>
                  Data sourced from NZ Charities Services public register
                </Text>
              </>
            )}
          </Box>
        </Container>
      </main>
      <Footer />

      {/* 기부 모달 — partnered 기관만 접근 가능 */}
      {isPartnered && (
        <DonationCheckoutModal
          opened={donationOpened}
          onClose={() => setDonationOpened(false)}
          campaign={fakeCampaign}
        />
      )}
    </>
  );
}

