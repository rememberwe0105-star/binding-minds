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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLeaf, IconLogout, IconLayoutDashboard, IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import classes from './Header.module.css';

const navLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Blog', href: '/blog' },
];

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logOut } = useAuth();

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
            <IconLeaf size={28} color="var(--bm-terracotta)" stroke={2} />
            <Text fw={700} size="xl" c="var(--bm-text-dark)">
              Binding Minds
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
            <Menu shadow="md" width={200} position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton className={classes.userBtn}>
                  <Group gap={8}>
                    <Avatar
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      size={32}
                      radius="xl"
                      color="sage"
                    >
                      {getInitials(user.displayName)}
                    </Avatar>
                    <Text size="sm" fw={500} c="var(--bm-text-dark)" className={classes.userName}>
                      {user.displayName || 'User'}
                    </Text>
                    <IconChevronDown size={14} color="var(--bm-text-muted)" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user.email}</Menu.Label>
                <Menu.Item
                  leftSection={<IconLayoutDashboard size={16} />}
                  component={Link}
                  href="/dashboard"
                >
                  My Dashboard
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
              <Button component={Link} href="/campaigns" color="terracotta" size="sm" radius="xl">
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
        title="Binding Minds"
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
              <Button component={Link} href="/campaigns" color="terracotta" fullWidth radius="xl" onClick={close}>
                Give Today
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </header>
  );
}
