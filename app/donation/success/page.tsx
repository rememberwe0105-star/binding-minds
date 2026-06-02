'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container, Title, Text, Button, Box, ThemeIcon,
  Card, Group, Stack, Badge,
} from '@mantine/core';
import {
  IconConfetti, IconHeart, IconChartBar,
  IconBrandFacebook, IconBrandX, IconLink,
  IconCheck, IconSparkles,
  IconDownload, IconMail, IconReceipt, IconArrowRight,
  IconGift,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { downloadReceiptPdf } from '@/lib/generateReceiptPdf';
import type { DonationItem } from '@/lib/api';

const SITE_URL = 'https://binding-minds.vercel.app';
export const dynamic = 'force-dynamic';

function buildShareMessage(projectName?: string): string {
  if (projectName) {
    return `I just donated to "${projectName}" on DearGiver 🇳🇿💚 Every dollar makes a difference — check it out and join me!`;
  }
  return 'I just made a donation on DearGiver 🇳🇿💚 Supporting NZ communities, one gift at a time!';
}

function buildShareUrl(path: string = '/projects'): string {
  return `${SITE_URL}${path}?utm_source=share&utm_medium=social&utm_campaign=post_donation`;
}

function SuccessContent() {
  const [mounted, setMounted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();
  const [receiptDownloading, setReceiptDownloading] = useState(false);
  const searchParams = useSearchParams();

  const projectName = searchParams.get('project') || undefined;
  const amountRaw = searchParams.get('amount');
  const amount = amountRaw ? `$${Number(amountRaw).toLocaleString('en-NZ')}` : undefined;

  const shareMessage = buildShareMessage(projectName);
  const shareUrl = buildShareUrl(projectName ? `/projects` : '/projects');

  // 선물 기부 데이터
  const [giftData, setGiftData] = useState<{
    recipientName: string;
    recipientEmail: string | null;
    message: string | null;
    charityName: string;
    amount: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // localStorage에서 선물 기부 데이터 읽기
    try {
      const stored = localStorage.getItem('deargiver_gift');
      if (stored) {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGiftData(parsed);
        // 읽은 후 삭제 (재방문 시 중복 표시 방지)
        localStorage.removeItem('deargiver_gift');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }, [shareMessage, shareUrl]);

  const handleDownloadReceipt = async () => {
    if (!user) return;
    setReceiptDownloading(true);
    try {
      // Build a DonationItem-like object from URL params
      const mockItem: DonationItem = {
        id: 0,
        donation_amount_minor: amountRaw ? Math.round(Number(amountRaw) * 100) : 0,
        platform_fee_amount_minor: 0,
        charity_net_amount_minor: 0,
        currency_code: 'NZD',
        donation_status: 'succeeded',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        charity_display_name: projectName || 'DearGiver Charity',
        charity_id: 0,
        cc_number: undefined,
        stripe_checkout_session_id: undefined,
        stripe_payment_intent_id: undefined,
        receipt_no: undefined,
        receipt_status: undefined,
      };
      await downloadReceiptPdf({
        item: mockItem,
        donorName: user.displayName || user.email || 'Valued Donor',
        donorEmail: user.email || undefined,
      });
    } finally {
      setReceiptDownloading(false);
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`,
      '_blank', 'width=600,height=400'
    );
  };

  const shareToX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank', 'width=600,height=400'
    );
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: 'var(--bm-bg-cream)' }}>
        <Container size="sm">
          <Box ta="center" py={60}>
            {/* Celebration Icon */}
            <ThemeIcon
              size={100}
              radius="xl"
              color="sage"
              variant="light"
              mx="auto"
              mb={24}
              style={{
                animation: mounted ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <IconConfetti size={52} stroke={1.5} />
            </ThemeIcon>

            <Title order={1} style={{ fontSize: '2.2rem', color: 'var(--bm-text-dark)', marginBottom: 12 }}>
              Thank You! 🎉
            </Title>

            <Text size="lg" c="var(--bm-text-muted)" mb={8} maw={480} mx="auto">
              {amount
                ? <>Your <strong>{amount}</strong> donation has been successfully processed.</>
                : <>Your donation has been successfully processed.</>
              }
              {' '}You&apos;re making a real difference in New Zealand!
            </Text>

            {projectName && (
              <Text size="sm" fw={600} c="var(--bm-sage-dark)" mb={8}>
                Project: {projectName}
              </Text>
            )}

            {/* ── Gift Donation Card ── */}
            {giftData && (
              <Card
                padding={0}
                radius="xl"
                withBorder
                maw={480}
                mx="auto"
                mb={24}
                style={{
                  overflow: 'hidden',
                  border: '2px solid rgba(196,114,74,0.2)',
                }}
              >
                {/* 상단 배너 */}
                <Box
                  p={24}
                  style={{
                    background: 'linear-gradient(135deg, #4A7C71 0%, #3a6a5f 50%, #C4724A 100%)',
                    textAlign: 'center',
                  }}
                >
                  <ThemeIcon size={48} radius="xl" color="white" variant="subtle" mx="auto" mb={8}>
                    <IconGift size={28} color="white" />
                  </ThemeIcon>
                  <Text size="xs" c="rgba(255,255,255,0.8)" tt="uppercase" fw={700} style={{ letterSpacing: 2 }}>
                    Gift Donation
                  </Text>
                </Box>

                {/* 본문 */}
                <Box p={24} ta="center">
                  <Text size="sm" c="var(--bm-text-muted)" mb={4}>
                    A donation of
                  </Text>
                  <Text size="xl" fw={800} c="var(--bm-terracotta)" mb={4}>
                    {amount || `$${giftData.amount}`}
                  </Text>
                  <Text size="sm" c="var(--bm-text-muted)" mb={12}>
                    to <strong>{giftData.charityName}</strong>
                  </Text>

                  <Text size="sm" c="var(--bm-text-muted)" mb={2}>has been dedicated to</Text>
                  <Text size="lg" fw={800} c="var(--bm-text-dark)" mb={8}>
                    {giftData.recipientName} 🌿
                  </Text>

                  {giftData.message && (
                    <Box
                      p={16}
                      mb={12}
                      style={{
                        background: 'rgba(74,124,113,0.04)',
                        borderRadius: 12,
                        borderLeft: '3px solid var(--bm-sage)',
                      }}
                    >
                      <Text size="sm" c="var(--bm-text-dark)" fs="italic" lh={1.6}>
                        &ldquo;{giftData.message}&rdquo;
                      </Text>
                    </Box>
                  )}

                  <Text size="xs" c="dimmed" mb={12}>
                    {user?.displayName || 'Someone special'} made this gift through DearGiver
                  </Text>

                  <Group justify="center" gap={8}>
                    <Button
                      variant="light"
                      color="sage"
                      size="xs"
                      radius="md"
                      leftSection={<IconLink size={14} />}
                      onClick={() => {
                        const msg = `🎁 A gift donation of ${amount || `$${giftData.amount}`} was made to ${giftData.charityName} in honor of ${giftData.recipientName} via DearGiver! ${giftData.message ? `"${giftData.message}"` : ''}`;
                        navigator.clipboard.writeText(msg);
                      }}
                    >
                      Copy Gift Message
                    </Button>
                  </Group>
                </Box>
              </Card>
            )}

            {/* Receipt & Email Status */}
            <Card
              padding="lg"
              radius="lg"
              withBorder
              maw={480}
              mx="auto"
              mb={32}
              style={{ borderColor: 'var(--mantine-color-gray-3)' }}
            >
              <Stack gap={12}>
                <Group gap={10}>
                  <ThemeIcon size={32} radius="md" color="sage" variant="light">
                    <IconReceipt size={16} />
                  </ThemeIcon>
                  <Box style={{ flex: 1, textAlign: 'left' }}>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Donation Receipt</Text>
                    <Text size="xs" c="var(--bm-text-muted)">Your receipt is ready to download</Text>
                  </Box>
                  <Button
                    variant="light"
                    color="sage"
                    size="xs"
                    radius="md"
                    leftSection={<IconDownload size={14} />}
                    onClick={handleDownloadReceipt}
                    loading={receiptDownloading}
                    disabled={!amountRaw}
                  >
                    Download PDF
                  </Button>
                </Group>

                <Group gap={10}>
                  <ThemeIcon size={32} radius="md" color="terracotta" variant="light">
                    <IconMail size={16} />
                  </ThemeIcon>
                  <Box style={{ flex: 1, textAlign: 'left' }}>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Thank-You Email</Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      {user?.email
                        ? <>A receipt and thank-you message will be sent to <strong>{user.email}</strong></>
                        : 'Log in to receive receipt emails automatically'
                      }
                    </Text>
                  </Box>
                  <Badge size="sm" variant="light" color="sage">Coming Soon</Badge>
                </Group>

                <Box pt={8} style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                  <Text size="xs" c="var(--bm-text-muted)" ta="center">
                    Your donation is eligible for a <strong>33.33% NZ tax credit</strong>.
                    View all receipts in your{' '}
                    <a href="/dashboard?tab=receipts" style={{ color: 'var(--bm-sage-dark)', fontWeight: 600, textDecoration: 'none' }}>Receipt Vault</a>.
                  </Text>
                </Box>
              </Stack>
            </Card>

            {/* Primary Actions */}
            <Box style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }} mb={40}>
              <Button
                component={Link}
                href="/dashboard"
                color="sage"
                size="md"
                radius="xl"
                leftSection={<IconChartBar size={18} />}
                style={{ background: 'var(--bm-sage-dark)' }}
              >
                View My Dashboard
              </Button>
              <Button
                component={Link}
                href="/projects"
                variant="outline"
                color="dark"
                size="md"
                radius="xl"
                leftSection={<IconHeart size={18} />}
              >
                Donate Again
              </Button>
            </Box>

            {/* ── Share Your Impact ── */}
            <Card
              padding="xl"
              radius="xl"
              withBorder
              maw={480}
              mx="auto"
              style={{
                background: 'linear-gradient(135deg, rgba(142,184,151,0.08) 0%, rgba(230,126,94,0.06) 100%)',
                borderColor: 'var(--mantine-color-gray-3)',
              }}
            >
              <Group gap={8} justify="center" mb={12}>
                <IconSparkles size={18} color="var(--bm-terracotta-dark)" />
                <Text fw={700} size="md" c="var(--bm-text-dark)">
                  Share Your Impact
                </Text>
              </Group>

              <Text size="sm" c="var(--bm-text-muted)" mb={20} maw={360} mx="auto" lh={1.6}>
                Inspire others to give! Share your donation and help
                create a wave of generosity across New Zealand.
              </Text>

              {/* Share Message Preview */}
              <Card
                padding="md"
                radius="md"
                bg="white"
                mb={20}
                style={{ border: '1px dashed var(--mantine-color-gray-3)' }}
              >
                <Text size="xs" c="var(--bm-text-muted)" ta="left" lh={1.6} style={{ fontStyle: 'italic' }}>
                  &ldquo;{shareMessage}&rdquo;
                </Text>
              </Card>

              {/* Share Buttons */}
              <Stack gap={10}>
                <Group gap={10} justify="center">
                  <Button
                    variant="filled"
                    color="#1877F2"
                    radius="xl"
                    size="sm"
                    leftSection={<IconBrandFacebook size={18} />}
                    onClick={shareToFacebook}
                    style={{ flex: '1 1 0', maxWidth: 200 }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="filled"
                    color="dark"
                    radius="xl"
                    size="sm"
                    leftSection={<IconBrandX size={18} />}
                    onClick={shareToX}
                    style={{ flex: '1 1 0', maxWidth: 200 }}
                  >
                    Post on X
                  </Button>
                </Group>
                <Button
                  variant="light"
                  color={linkCopied ? 'green' : 'gray'}
                  radius="xl"
                  size="sm"
                  leftSection={linkCopied ? <IconCheck size={16} /> : <IconLink size={16} />}
                  onClick={copyLink}
                  fullWidth
                  maw={410}
                  mx="auto"
                >
                  {linkCopied ? 'Copied to Clipboard!' : 'Copy Share Link'}
                </Button>
              </Stack>
            </Card>
          </Box>
        </Container>
      </main>
      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
