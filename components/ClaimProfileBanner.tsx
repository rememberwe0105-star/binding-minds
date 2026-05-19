'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Group,
  ThemeIcon,
  Alert,
  Divider,
  Modal,
} from '@mantine/core';
import {
  IconBuilding,
  IconArrowRight,
  IconHeart,
  IconCheck,
  IconUsers,
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
  const { user } = useAuth();
  const router = useRouter();
  const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] = useDisclosure(false);

  const handleInterest = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    // TODO: POST /api/v1/interest — 백엔드 연동 시 실제 API 호출로 교체
    // 현재는 localStorage에 기록하여 UI 상태만 유지
    const key = `interest_${organization.id}`;
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, new Date().toISOString());
      }
    }
    setInterestSent(true);
  };

  // 이미 관심을 표현한 적 있는지 확인
  const alreadySent = typeof window !== 'undefined'
    ? !!localStorage.getItem(`interest_${organization.id}`)
    : false;

  const showSent = interestSent || alreadySent;

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
            icon={<IconCheck size={16} />}
            color="sage"
            variant="light"
            radius="md"
          >
            <Group gap={8}>
              <Text size="sm" fw={600}>Interest recorded!</Text>
              {organization.interestCount > 0 && (
                <Group gap={4}>
                  <IconUsers size={14} />
                  <Text size="xs" c="dimmed">
                    {organization.interestCount + (interestSent && !alreadySent ? 1 : 0)} people interested
                  </Text>
                </Group>
              )}
            </Group>
            <Text size="xs" mt={4} c="var(--bm-text-muted)">
              We&apos;ll let {organization.name} know that donors are waiting.
              You&apos;ll be notified when donations become available.
            </Text>
          </Alert>
        ) : (
          <Group gap={12}>
            <Button
              color="terracotta"
              variant="light"
              radius="xl"
              size="md"
              leftSection={<IconHeart size={16} />}
              onClick={handleInterest}
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
