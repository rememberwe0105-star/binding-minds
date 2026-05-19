'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Popover,
  ActionIcon,
  Indicator,
  Box,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconLayoutDashboard, IconChevronDown, IconSettings, IconGift, IconBuilding, IconShieldCheck, IconBell, IconCheck, IconHeart, IconTrophy, IconChartLine } from '@tabler/icons-react';
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

// ── Mock Notifications ──
interface Notification {
  id: string;
  type: 'donation' | 'badge' | 'milestone' | 'project';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: 'heart' | 'trophy' | 'chart' | 'check';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'donation', title: 'Donation Confirmed', message: 'Your $50 donation to Restore Native Forest was processed', time: '10 min ago', read: false, icon: 'heart' },
  { id: 'n2', type: 'badge', title: 'New Badge Unlocked!', message: '🌱 Tree Planter — you\'ve donated to 3 environmental projects', time: '2 hours ago', read: false, icon: 'trophy' },
  { id: 'n3', type: 'milestone', title: 'Project Milestone', message: 'Restore Native Forest reached 80% of its goal!', time: '5 hours ago', read: false, icon: 'chart' },
  { id: 'n4', type: 'donation', title: 'Receipt Ready', message: 'Your tax receipt for March donations is ready to download', time: '1 day ago', read: true, icon: 'check' },
  { id: 'n5', type: 'project', title: 'Project Update', message: 'Auckland City Mission shared a new impact report', time: '2 days ago', read: true, icon: 'chart' },
];

const NOTIF_ICON_MAP = {
  heart: IconHeart,
  trophy: IconTrophy,
  chart: IconChartLine,
  check: IconCheck,
};

const NOTIF_COLOR_MAP = {
  heart: 'terracotta',
  trophy: 'grape',
  chart: 'blue',
  check: 'sage',
};

// ── Notification Bell Component ──
function NotificationBell() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [opened, setOpened] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <Popover width="min(360px, calc(100vw - 32px))" position="bottom-end" withArrow shadow="lg" opened={opened} onChange={setOpened} radius="lg">
      <Popover.Target>
        <Indicator color="red" size={8} offset={4} disabled={unreadCount === 0} processing>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={36}
            radius="xl"
            onClick={() => setOpened(o => !o)}
            className={classes.notifBtn}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown p={0} style={{ overflow: 'hidden' }}>
        <Group justify="space-between" p="sm" pb={8}>
          <Text fw={700} size="sm" c="var(--bm-text-dark)">Notifications</Text>
          {unreadCount > 0 && (
            <Button variant="subtle" size="compact-xs" color="sage" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </Group>
        <Divider />
        <ScrollArea.Autosize mah={340} type="scroll">
          {notifications.length === 0 ? (
            <Box ta="center" py={32}>
              <Text size="sm" c="var(--bm-text-muted)">No notifications yet</Text>
            </Box>
          ) : (
            notifications.map((n) => {
              const Icon = NOTIF_ICON_MAP[n.icon];
              const color = NOTIF_COLOR_MAP[n.icon];
              return (
                <Box
                  key={n.id}
                  className={`${classes.notifItem} ${!n.read ? classes.notifUnread : ''}`}
                  onClick={() => markAsRead(n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap={12} align="flex-start" wrap="nowrap">
                    <ActionIcon variant="light" color={color} radius="xl" size={32} style={{ flexShrink: 0, marginTop: 2 }}>
                      <Icon size={16} />
                    </ActionIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap={6} mb={2}>
                        <Text size="xs" fw={600} c="var(--bm-text-dark)" lineClamp={1}>{n.title}</Text>
                        {!n.read && <Box style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mantine-color-blue-5)', flexShrink: 0 }} />}
                      </Group>
                      <Text size="xs" c="var(--bm-text-muted)" lineClamp={2} lh={1.4}>{n.message}</Text>
                      <Text size="xs" c="var(--bm-text-muted)" mt={4} style={{ opacity: 0.6 }}>{n.time}</Text>
                    </Box>
                  </Group>
                </Box>
              );
            })
          )}
        </ScrollArea.Autosize>
        <Divider />
        <Box ta="center" py={8}>
          <Button variant="subtle" color="sage" size="compact-xs" component={Link} href="/settings" onClick={() => setOpened(false)}>
            Notification Settings
          </Button>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logOut, demoRole, displayName: authDisplayName, displayEmail: authDisplayEmail } = useAuth();

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
          ) : (user || demoRole) ? (
            // 로그인 상태 또는 데모 역할 시뮬레이션
            <Group gap={8}>
            <NotificationBell />
            <Menu shadow="md" width={220} position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton className={classes.userBtn}>
                  <Group gap={8}>
                    {/* Avatar — 데모 모드면 역할 색상, 실제 로그인이면 티어 링 */}
                    {demoRole ? (
                      <Avatar
                        size={32}
                        radius="xl"
                        color={demoRole === 'admin' ? 'blue' : demoRole === 'charity' ? 'terracotta' : 'sage'}
                      >
                        {getInitials(authDisplayName)}
                      </Avatar>
                    ) : (
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
                          src={user?.photoURL}
                          alt={authDisplayName}
                          size={32}
                          radius="xl"
                          color="sage"
                        >
                          {getInitials(authDisplayName)}
                        </Avatar>
                      </div>
                    </Tooltip>
                    )}
                    <Text size="sm" fw={500} c="var(--dg-text-dark)" className={classes.userName}>
                      {authDisplayName}
                    </Text>
                    <IconChevronDown size={14} color="var(--dg-text-muted)" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {/* Tier card — 실제 로그인 시에만 */}
                {!demoRole && !rewardsLoading && (
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
                <Menu.Label>{authDisplayEmail}{demoRole ? ` (${demoRole} demo)` : ''}</Menu.Label>

                {/* 역할별 메뉴 항목 */}
                {(!demoRole || demoRole === 'donor') && (
                  <Menu.Item
                    leftSection={<IconLayoutDashboard size={16} />}
                    component={Link}
                    href="/dashboard"
                  >
                    My Dashboard
                  </Menu.Item>
                )}
                {(!demoRole || demoRole === 'charity') && (
                  <Menu.Item
                    leftSection={<IconBuilding size={16} />}
                    component={Link}
                    href="/charity/dashboard"
                  >
                    Organisation Dashboard
                  </Menu.Item>
                )}
                {(!demoRole || demoRole === 'admin') && (
                  <Menu.Item
                    leftSection={<IconShieldCheck size={16} />}
                    component={Link}
                    href="/admin"
                  >
                    Admin Panel
                  </Menu.Item>
                )}
                {(!demoRole || demoRole === 'donor') && (
                  <Menu.Item
                    leftSection={<IconGift size={16} />}
                    component={Link}
                    href="/dashboard?tab=rewards"
                  >
                    My Rewards
                  </Menu.Item>
                )}
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
            </Group>
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
