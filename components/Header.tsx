'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Group,
  Button,
  Text,
  Burger,
  Drawer,
  Stack,
  Avatar,
  Menu,
  UnstyledButton,
  Progress,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconLayoutDashboard, IconChevronDown, IconSettings, IconGift, IconBuilding } from '@tabler/icons-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import classes from './Header.module.css';

const navLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Charities', href: '/charities' },
];

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logOut } = useAuth();

  // ── Rewards 후크 (로그인 상태에서만) ──
  const { currentTier, nextTier, unlockedCount, totalCount, loading: rewardsLoading } = useRewards();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      // 로그아웃 실패 시 무시
    }
  };

  // 사용자 이니셜 (Avatar 폴백)
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}>
      <Container size="xl" className={classes.inner}>
        {/* 로고 */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Group gap={8} className={classes.logo}>
            <NextImage
              src="/images/dg-logo-v2.png"
              alt="DearGiver"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
            <Text fw={700} size="xl" c="var(--dg-teal-dark)">
              DearGiver
            </Text>
          </Group>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <Group gap={32} visibleFrom="sm" className={classes.nav}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={classes.link}>
              {link.label}
            </Link>
          ))}
        </Group>

        {/* 데스크톱 CTA / 유저 메뉴 */}
        <Group gap={12} visibleFrom="sm">
          {loading ? (
            // 로딩 중 placeholder
            <div style={{ width: 120, height: 36 }} />
          ) : user ? (
            // 로그인 상태: Avatar + 드롭다운
            <Menu shadow="md" width={220} position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton className={classes.userBtn}>
                  <Group gap={8}>
                    {/* A안: Avatar Ring — 등급 색상 테두리 */}
                    <Tooltip
                      label={
                        rewardsLoading ? 'Loading...' :
                        `${currentTier.emoji} ${currentTier.label} · ${unlockedCount}/${totalCount} badges`
                      }
                      position="bottom"
                      withArrow
                      offset={6}
                    >
                      <div
                        className={classes.avatarRing}
                        style={{ '--tier-color': `var(--mantine-color-${currentTier.color}-5)` } as React.CSSProperties}
                      >
                        <Avatar
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          size={32}
                          radius="xl"
                          color="sage"
                        >
                          {getInitials(user.displayName)}
                        </Avatar>
                      </div>
                    </Tooltip>
                    <Text size="sm" fw={500} c="var(--dg-text-dark)" className={classes.userName}>
                      {user.displayName || 'User'}
                    </Text>
                    <IconChevronDown size={14} color="var(--dg-text-muted)" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {/* B안: 드롭다운 상단 — Tier 카드 */}
                {!rewardsLoading && (
                  <>
                    <div className={classes.tierCard}>
                      <Group gap={8} mb={6}>
                        <span style={{ fontSize: '1.1rem' }}>{currentTier.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <Text size="xs" fw={700} c="var(--bm-text-dark)" lh={1.2}>
                            {currentTier.label}
                          </Text>
                          <Text size="xs" c="var(--bm-text-muted)" lh={1.2}>
                            {unlockedCount}/{totalCount} badges
                          </Text>
                        </div>
                      </Group>
                      <Progress
                        value={nextTier ? ((unlockedCount - currentTier.minBadges) / (nextTier.minBadges - currentTier.minBadges)) * 100 : 100}
                        color={currentTier.color}
                        size={4}
                        radius="xl"
                      />
                      {nextTier && (
                        <Text size="xs" c="var(--bm-text-muted)" mt={4}>
                          {nextTier.minBadges - unlockedCount} badge{nextTier.minBadges - unlockedCount !== 1 ? 's' : ''} to {nextTier.label}
                        </Text>
                      )}
                    </div>
                    <Menu.Divider />
                  </>
                )}
                <Menu.Label>{user.email}</Menu.Label>
                <Menu.Item
                  leftSection={<IconLayoutDashboard size={16} />}
                  component={Link}
                  href="/dashboard"
                >
                  My Dashboard
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconBuilding size={16} />}
                  component={Link}
                  href="/charity/dashboard"
                >
                  Organisation Dashboard
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconGift size={16} />}
                  component={Link}
                  href="/dashboard?tab=rewards"
                >
                  My Rewards
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  component={Link}
                  href="/settings"
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            // 비로그인 상태
            <>
              <Button
                component={Link}
                href="/auth"
                variant="subtle"
                color="dark"
                size="sm"
              >
                Log in
              </Button>
              <Button component={Link} href="/projects" color="terracotta" size="sm" radius="xl">
                Give Today
              </Button>
            </>
          )}
        </Group>

        {/* 모바일 햄버거 */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </Container>

      {/* 모바일 드로어 */}
      <Drawer
        opened={opened}
        onClose={close}
        size="70%"
        padding="md"
        title="DearGiver"
        hiddenFrom="sm"
      >
        <Stack gap="md">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={classes.mobileLink} onClick={close}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Group gap={8} py={8}>
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  size={28}
                  radius="xl"
                  color="sage"
                >
                  {getInitials(user.displayName)}
                </Avatar>
                <Text size="sm" fw={500}>{user.displayName || 'User'}</Text>
              </Group>
              <Button
                variant="outline"
                color="red"
                fullWidth
                leftSection={<IconLogout size={16} />}
                onClick={() => { handleLogout(); close(); }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/auth"
                variant="outline"
                color="dark"
                fullWidth
                onClick={close}
              >
                Log in
              </Button>
              <Button component={Link} href="/projects" color="terracotta" fullWidth radius="xl" onClick={close}>
                Give Today
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </header>
  );
}
