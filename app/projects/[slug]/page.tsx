'use client';

import { use, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Progress,
  Box,
  SimpleGrid,
  SegmentedControl,
  TextInput,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconShieldCheck,
  IconHeart,
  IconUsers,
  IconClock,
  IconMapPin,
} from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { DonationCheckoutModal } from '@/components/DonationCheckoutModal';
import {
  getCampaignBySlug,
  getRelatedCampaigns,
  getProgress,
  formatCurrency,
} from '@/data/campaigns';
import classes from './page.module.css';

// Next.js App Router에서 동적 경로 파라미터
interface CampaignDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { slug } = use(params);
  const campaign = getCampaignBySlug(slug);
  const [donationAmount, setDonationAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  // 캠페인이 없으면 404
  if (!campaign) {
    return (
      <>
        <Header />
        <main className={classes.page}>
          <Container size="lg" className={classes.notFound}>
            <Title order={2}>Campaign not found</Title>
            <Text c="dimmed" mt={8} mb={24}>The campaign you&apos;re looking for doesn&apos;t exist.</Text>
            <Button component={Link} href="/projects" variant="outline" color="sage" radius="xl">
              Browse All Projects
            </Button>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const progress = getProgress(campaign);
  const relatedCampaigns = getRelatedCampaigns(campaign, 3);

  // 실제 기부 금액 (프리셋 또는 커스텀)
  const actualAmount = donationAmount === 'custom' ? customAmount : donationAmount;

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="lg">
          {/* 뒤로가기 */}
          <Link href="/projects" className={classes.backLink}>
            <Group gap={6}>
              <IconArrowLeft size={18} />
              <Text size="sm" fw={500}>Back to Projects</Text>
            </Group>
          </Link>

          {/* 2컬럼 레이아웃 */}
          <div className={classes.layout}>
            {/* 왼쪽: 이미지 + 상세 설명 */}
            <div className={classes.mainColumn}>
              {/* 히어로 이미지 */}
              <div className={classes.heroImage}>
                <NextImage
                  src={campaign.image}
                  alt={campaign.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 680px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <Badge className={classes.heroBadge} color="sage" variant="filled">
                  {campaign.category}
                </Badge>
              </div>

              {/* 캠페인 메타 */}
              <Box mt={24} mb={32}>
                <Group gap={8} mb={8}>
                  {campaign.verified && (
                    <Badge
                      color="sage"
                      variant="light"
                      size="sm"
                      leftSection={<IconShieldCheck size={14} />}
                    >
                      Verified Charity
                    </Badge>
                  )}
                </Group>

                <Title order={1} className={classes.campaignTitle}>
                  {campaign.name}
                </Title>

                <Group gap={16} mt={12}>
                  <Group gap={4}>
                    <IconMapPin size={14} color="var(--bm-text-muted)" />
                    <Text size="sm" c="var(--bm-text-muted)">{campaign.region}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">by <strong>{campaign.organizer}</strong></Text>
                </Group>
              </Box>

              {/* 상세 설명 */}
              <div className={classes.longDescription}>
                {campaign.longDescription.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('## ')) {
                    return <Title key={i} order={2} className={classes.descH2} mt={32} mb={12}>{trimmed.slice(3)}</Title>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <Title key={i} order={3} className={classes.descH3} mt={24} mb={8}>{trimmed.slice(4)}</Title>;
                  }
                  if (trimmed.startsWith('- **')) {
                    const parts = trimmed.slice(2).split('**');
                    return (
                      <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.8} mb={4} pl={16} className={classes.listItem}>
                        • <strong>{parts[1]}</strong>{parts[2]}
                      </Text>
                    );
                  }
                  if (trimmed.startsWith('- ')) {
                    return (
                      <Text key={i} size="md" c="var(--bm-text-dark)" lh={1.8} mb={4} pl={16} className={classes.listItem}>
                        • {trimmed.slice(2)}
                      </Text>
                    );
                  }
                  if (trimmed === '') return <Box key={i} h={8} />;
                  // 볼드 텍스트 처리
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
            </div>

            {/* 오른쪽: 기부 위젯 (Sticky) */}
            <div className={classes.sideColumn}>
              <div className={classes.donateWidget}>
                {/* 진행 현황 */}
                <Text size="xl" fw={800} c="var(--bm-sage-dark)">
                  {formatCurrency(campaign.raised)}
                </Text>
                <Text size="sm" c="dimmed" mb={12}>
                  raised of {formatCurrency(campaign.goal)} goal
                </Text>

                <Progress value={progress} color={progress >= 75 ? 'terracotta' : 'sage'} size="md" radius="xl" mb={16} />

                {/* 스탯 */}
                <Group gap={24} mb={24}>
                  <Box>
                    <Group gap={4}>
                      <IconUsers size={16} color="var(--bm-sage)" />
                      <Text size="sm" fw={700} c="var(--bm-text-dark)">{campaign.donorCount}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">donors</Text>
                  </Box>
                  <Box>
                    <Group gap={4}>
                      <IconClock size={16} color="var(--bm-terracotta)" />
                      <Text size="sm" fw={700} c="var(--bm-text-dark)">{campaign.daysLeft}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">days left</Text>
                  </Box>
                  <Box>
                    <Group gap={4}>
                      <IconHeart size={16} color="var(--bm-terracotta)" />
                      <Text size="sm" fw={700} c="var(--bm-text-dark)">{progress}%</Text>
                    </Group>
                    <Text size="xs" c="dimmed">funded</Text>
                  </Box>
                </Group>

                {/* 결제 주기 선택 */}
                <SegmentedControl
                  value={frequency}
                  onChange={(v) => setFrequency(v as 'one-time' | 'monthly')}
                  data={[
                    { value: 'one-time', label: 'One-time' },
                    { 
                      value: 'monthly', 
                      label: (
                        <Group gap={4} justify="center">
                          Monthly <IconHeart size={14} color="var(--bm-terracotta)" />
                        </Group>
                      )
                    },
                  ]}
                  fullWidth
                  size="sm"
                  color="terracotta"
                  mb={16}
                />

                {/* 금액 선택 */}
                <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={8}>
                  Choose Amount
                </Text>
                <SegmentedControl
                  value={donationAmount}
                  onChange={setDonationAmount}
                  data={[
                    { value: '10', label: '$10' },
                    { value: '20', label: '$20' },
                    { value: '50', label: '$50' },
                    { value: '100', label: '$100' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  fullWidth
                  size="md"
                  color="sage"
                  mb={12}
                />

                {donationAmount === 'custom' && (
                  <TextInput
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.currentTarget.value)}
                    leftSection={<Text size="sm" fw={600}>$</Text>}
                    size="md"
                    mb={12}
                    type="number"
                    min={10}
                  />
                )}

                {/* 세금 환급 힌트 */}
                {actualAmount && Number(actualAmount) > 0 && (
                  <Box className={classes.taxHint} mb={16}>
                    <Text size="xs" c="var(--bm-sage-dark)">
                      💰 You&apos;ll get <strong>${Math.round(Number(actualAmount) * 0.3333)}</strong> back as a tax refund
                    </Text>
                  </Box>
                )}

                {/* CTA 버튼 */}
                <Button
                  color="terracotta"
                  fullWidth
                  size="lg"
                  radius="xl"
                  className={classes.donateBtn}
                  onClick={openModal}
                >
                  Donate {actualAmount ? `$${actualAmount}` : ''} {frequency === 'monthly' ? 'Monthly' : 'Now'}
                </Button>

                <Text ta="center" size="xs" c="dimmed" mt={8}>
                  🔒 Secure payment via Stripe
                </Text>
              </div>
            </div>
          </div>

          {/* 관련 캠페인 */}
          {relatedCampaigns.length > 0 && (
            <Box mt={80}>
              <Title order={2} className={classes.relatedTitle} mb={24}>
                More Projects You Might Like
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
                {relatedCampaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Container>
      </main>
      <Footer />
      <DonationCheckoutModal opened={modalOpened} onClose={closeModal} campaign={campaign} frequency={frequency} />
    </>
  );
}
