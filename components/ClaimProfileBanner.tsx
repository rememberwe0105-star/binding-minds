'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  Group,
  ThemeIcon,
  Alert,
  Divider,
  Modal,
  Checkbox,
  Loader,
} from '@mantine/core';
import {
  IconBuilding,
  IconArrowRight,
  IconHeart,
  IconCheck,
  IconUsers,
  IconMail,
  IconConfetti,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Organization } from '@/data/organizations';
import { useAuth } from '@/contexts/AuthContext';
import { useDisclosure } from '@mantine/hooks';

interface ClaimProfileBannerProps {
  organization: Organization;
}

export function ClaimProfileBanner({ organization }: ClaimProfileBannerProps) {
  const [interestSent, setInterestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [shareNameAgreed, setShareNameAgreed] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] = useDisclosure(false);
  const [consentModalOpened, { open: openConsentModal, close: closeConsentModal }] = useDisclosure(false);

  // 이미 관심을 표현한 적 있는지 확인
  const alreadySent = typeof window !== 'undefined'
    ? !!localStorage.getItem(`interest_${organization.id}`)
    : false;

  const showSent = interestSent || alreadySent;

  // "I'd love to donate!" 클릭 핸들러
  const handleInterestClick = useCallback(() => {
    if (!user) {
      openLoginModal();
      return;
    }
    // 이미 보낸 경우
    if (alreadySent) {
      setInterestSent(true);
      return;
    }
    // 동의 모달 열기
    openConsentModal();
  }, [user, alreadySent, openLoginModal, openConsentModal]);

  // 실제 관심 표현 + 이메일 발송
  const handleConfirmInterest = useCallback(async () => {
    if (!user) return;

    setSending(true);
    closeConsentModal();

    try {
      const donorName = shareNameAgreed
        ? (user.displayName || user.email?.split('@')[0] || 'A DearGiver user')
        : 'A DearGiver user';

      const res = await fetch('/api/interest-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: organization.id,
          charityName: organization.name,
          charitySlug: organization.slug,
          charityEmail: organization.contactEmail,
          donorName,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        // localStorage에 기록
        localStorage.setItem(`interest_${organization.id}`, new Date().toISOString());
        setInterestSent(true);
        setEmailSent(data.emailSent === true);
      }
    } catch (err) {
      console.error('Failed to send interest:', err);
      // 실패해도 localStorage에 기록
      localStorage.setItem(`interest_${organization.id}`, new Date().toISOString());
      setInterestSent(true);
    } finally {
      setSending(false);
    }
  }, [user, shareNameAgreed, organization, closeConsentModal]);

  return (
    <Box
      mb={32}
      style={{
        background: 'linear-gradient(135deg, rgba(74,124,113,0.06) 0%, rgba(74,124,113,0.12) 100%)',
        borderRadius: 16,
        border: '1px solid rgba(74,124,113,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* 기관 관계자용 — Claim Profile */}
      <Box p={24}>
        <Group gap={12} mb={12}>
          <ThemeIcon size={40} radius="xl" color="sage" variant="light">
            <IconBuilding size={20} />
          </ThemeIcon>
          <Box>
            <Text size="md" fw={700} c="var(--bm-text-dark)">
              Is this your charity?
            </Text>
            <Text size="sm" c="var(--bm-text-muted)">
              Claim your profile to manage your page and start receiving donations.
            </Text>
          </Box>
        </Group>

        <Text size="xs" c="var(--bm-text-muted)" lh={1.7} mb={16}>
          This profile was created from publicly available data on the NZ Charities Services register.
          If you are an authorised representative of <strong>{organization.name}</strong>,
          you can claim this profile, verify your identity, and complete Stripe onboarding
          to enable donations through DearGiver.
        </Text>

        <Button
          component={Link}
          href="/charity/apply"
          color="sage"
          radius="xl"
          size="md"
          rightSection={<IconArrowRight size={16} />}
        >
          Claim this Profile
        </Button>
      </Box>

      <Divider color="rgba(74,124,113,0.12)" />

      {/* 일반 사용자용 — Interest Expression */}
      <Box p={24}>
        <Group gap={12} mb={12}>
          <ThemeIcon size={40} radius="xl" color="terracotta" variant="light">
            <IconHeart size={20} />
          </ThemeIcon>
          <Box>
            <Text size="md" fw={700} c="var(--bm-text-dark)">
              Want to donate to {organization.name}?
            </Text>
            <Text size="sm" c="var(--bm-text-muted)">
              Let them know you&apos;re interested — we&apos;ll notify the charity on your behalf.
            </Text>
          </Box>
        </Group>

        <Text size="xs" c="var(--bm-text-muted)" lh={1.7} mb={16}>
          Donations are only available once a charity has claimed their profile and completed onboarding.
          By expressing interest, you help us invite {organization.name} to join DearGiver
          so you can support them directly.
        </Text>

        {showSent ? (
          <Alert
            icon={emailSent ? <IconConfetti size={16} /> : <IconCheck size={16} />}
            color="sage"
            variant="light"
            radius="md"
          >
            <Group gap={8}>
              <Text size="sm" fw={600}>
                {emailSent
                  ? `${organization.name} has been notified! 🎉`
                  : 'Interest recorded!'}
              </Text>
              {(organization.interestCount > 0 || interestSent) && (
                <Group gap={4}>
                  <IconUsers size={14} />
                  <Text size="xs" c="dimmed">
                    {organization.interestCount + (interestSent && !alreadySent ? 1 : 0)} people interested
                  </Text>
                </Group>
              )}
            </Group>
            <Text size="xs" mt={4} c="var(--bm-text-muted)">
              {emailSent
                ? `We've sent an invitation email to ${organization.name} on your behalf. You'll be notified when they join DearGiver!`
                : `We'll let ${organization.name} know that donors are waiting. You'll be notified when donations become available.`}
            </Text>
          </Alert>
        ) : sending ? (
          <Group gap={12}>
            <Loader size="sm" color="sage" />
            <Text size="sm" c="var(--bm-text-muted)">
              Sending your interest to {organization.name}...
            </Text>
          </Group>
        ) : (
          <Group gap={12}>
            <Button
              color="terracotta"
              variant="light"
              radius="xl"
              size="md"
              leftSection={<IconHeart size={16} />}
              onClick={handleInterestClick}
            >
              I&apos;d love to donate!
            </Button>
            {organization.interestCount > 0 && (
              <Group gap={4}>
                <IconUsers size={14} color="var(--bm-text-muted)" />
                <Text size="xs" c="dimmed">
                  {organization.interestCount} people interested
                </Text>
              </Group>
            )}
          </Group>
        )}
      </Box>

      {/* ── 동의 모달 ── */}
      <Modal
        opened={consentModalOpened}
        onClose={closeConsentModal}
        title={<Text fw={700} size="lg">Notify {organization.name}</Text>}
        centered
        radius="lg"
      >
        <Box py="sm">
          <ThemeIcon size={56} radius="xl" color="terracotta" variant="light" mx="auto" mb={16} style={{ display: 'flex' }}>
            <IconMail size={28} />
          </ThemeIcon>

          <Text size="md" fw={600} c="var(--bm-text-dark)" ta="center" mb={8}>
            Let {organization.name} know you&apos;re waiting!
          </Text>

          <Text size="sm" c="var(--bm-text-muted)" lh={1.6} mb={20} ta="center">
            DearGiver will send an invitation email to <strong>{organization.name}</strong> on your behalf,
            encouraging them to claim their profile so you can donate directly.
          </Text>

          {/* 이름 공유 동의 */}
          <Box
            mb={24}
            p={16}
            style={{
              background: 'rgba(74,124,113,0.06)',
              borderRadius: 12,
              border: '1px solid rgba(74,124,113,0.1)',
            }}
          >
            <Checkbox
              checked={shareNameAgreed}
              onChange={(e) => setShareNameAgreed(e.currentTarget.checked)}
              label={
                <Text size="sm" c="var(--bm-text-dark)">
                  Share my name with {organization.name}
                </Text>
              }
              description={
                shareNameAgreed && user
                  ? `The email will say "${user.displayName || user.email?.split('@')[0] || 'You'} is waiting to support ${organization.name}"`
                  : 'The email will say "A DearGiver user is waiting to support your charity"'
              }
              color="sage"
              radius="sm"
            />
          </Box>

          {!organization.contactEmail && (
            <Alert color="yellow" variant="light" radius="md" mb={16}>
              <Text size="xs">
                We don&apos;t have a contact email for this charity yet.
                Your interest will be recorded and we&apos;ll reach out when we can.
              </Text>
            </Alert>
          )}

          <Button
            color="terracotta"
            fullWidth
            radius="xl"
            size="md"
            leftSection={<IconHeart size={16} />}
            onClick={handleConfirmInterest}
          >
            {organization.contactEmail ? 'Send My Interest' : 'Record My Interest'}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            fullWidth
            radius="xl"
            mt={8}
            onClick={closeConsentModal}
          >
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* 로그인 유도 모달 */}
      <Modal
        opened={loginModalOpened}
        onClose={closeLoginModal}
        title={<Text fw={700} size="lg">Support {organization.name}</Text>}
        centered
        radius="lg"
      >
        <Box ta="center" py="md">
          <ThemeIcon size={64} radius="xl" color="terracotta" variant="light" mb={16}>
            <IconHeart size={32} />
          </ThemeIcon>
          <Text size="md" fw={600} c="var(--bm-text-dark)" mb={8}>
            Log in to express your interest
          </Text>
          <Text size="sm" c="var(--bm-text-muted)" lh={1.6} mb={24}>
            Sign in or create an account so we can notify you as soon as {organization.name} starts accepting donations on DearGiver.
          </Text>
          <Button
            color="sage"
            fullWidth
            radius="xl"
            size="md"
            onClick={() => router.push('/auth')}
          >
            Log In or Sign Up
          </Button>
          <Button
            variant="subtle"
            color="gray"
            fullWidth
            radius="xl"
            mt={8}
            onClick={closeLoginModal}
          >
            Maybe later
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
