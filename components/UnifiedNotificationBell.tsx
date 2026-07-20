'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ActionIcon, Indicator, Box, Text, Group, Stack,
  Badge, ScrollArea, Button, ThemeIcon, Divider,
} from '@mantine/core';
import {
  IconBell, IconBuilding, IconClipboardCheck,
  IconHeart, IconAlertTriangle, IconX,
  IconCheck, IconRefresh, IconCoin, IconTarget,
  IconBuildingBank, IconMail, IconClock,
  IconTrophy, IconChartLine, IconFileText,
  IconCalendar, IconNews, IconPlayerPause,
  IconShieldCheck, IconServer,
} from '@tabler/icons-react';
import {
  getDonorNotifications,
  getCharityNotifications,
  getAdminNotifications,
  markUserNotificationRead,
  markAllUserNotificationsRead,
  markNotificationRead,
  markAllNotificationsRead,
  type UserNotification,
  type AdminNotification,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DemoRole } from '@/contexts/AuthContext';
import classes from './UnifiedNotificationBell.module.css';

// ---------------------------------------------------------------------------
// Icon & color maps per notification type
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  // Donor
  donation_confirmed: IconHeart,
  receipt_ready: IconFileText,
  badge_unlocked: IconTrophy,
  project_milestone: IconChartLine,
  campaign_update: IconNews,
  tax_reminder: IconCalendar,
  monthly_report: IconChartLine,
  charity_news: IconBuilding,
  // Charity
  donation_received: IconCoin,
  project_approved: IconCheck,
  project_rejected: IconX,
  project_suspended: IconPlayerPause,
  fundraising_milestone: IconTarget,
  settlement_complete: IconBuildingBank,
  stripe_issue: IconAlertTriangle,
  admin_message: IconMail,
  document_expiry: IconClock,
  refund_issued: IconRefresh,
  // Admin
  new_application: IconBuilding,
  project_review: IconClipboardCheck,
  large_donation: IconHeart,
  refund_request: IconAlertTriangle,
  daily_summary: IconChartLine,
  anomaly_detection: IconShieldCheck,
  system: IconServer,
};

const COLOR_MAP: Record<string, string> = {
  // Donor
  donation_confirmed: 'terracotta',
  receipt_ready: 'sage',
  badge_unlocked: 'grape',
  project_milestone: 'blue',
  campaign_update: 'cyan',
  tax_reminder: 'orange',
  monthly_report: 'blue',
  charity_news: 'teal',
  // Charity
  donation_received: 'green',
  project_approved: 'green',
  project_rejected: 'red',
  project_suspended: 'orange',
  fundraising_milestone: 'blue',
  settlement_complete: 'teal',
  stripe_issue: 'red',
  admin_message: 'violet',
  document_expiry: 'orange',
  refund_issued: 'red',
  // Admin
  new_application: 'blue',
  project_review: 'violet',
  large_donation: 'green',
  refund_request: 'orange',
  daily_summary: 'cyan',
  anomaly_detection: 'red',
  system: 'gray',
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bellColor: string }> = {
  donor:   { label: 'Donor',   color: 'terracotta', bellColor: 'var(--bm-terracotta, #c4704b)' },
  charity: { label: 'Charity', color: 'blue',       bellColor: 'var(--mantine-color-blue-5, #3b82f6)' },
  admin:   { label: 'Admin',   color: 'violet',     bellColor: 'var(--mantine-color-violet-5, #8b5cf6)' },
};

// ---------------------------------------------------------------------------
// Time helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Normalize AdminNotification → UserNotification
// ---------------------------------------------------------------------------

function normalizeAdminNotif(n: AdminNotification): UserNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    action_url: n.action_url,
    created_at: n.created_at,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnifiedNotificationBell() {
  const { demoRole, userRole, serviceUser } = useAuth();

  // Determine active role
  const activeRole: DemoRole = useMemo(() => {
    // charity_paid 데모도 알림 구성은 charity와 동일하게 취급
    if (demoRole) return demoRole === 'charity_paid' ? 'charity' : demoRole;
    if (userRole === 'platform_admin') return 'admin';
    if (userRole === 'charity_admin') return 'charity';
    if (userRole === 'donor') return 'donor';
    return null;
  }, [demoRole, userRole]);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch notifications based on role ──
  const fetchNotifications = useCallback(async () => {
    if (!activeRole) return;
    setLoading(true);
    try {
      let items: UserNotification[] = [];
      let unread = 0;

      if (activeRole === 'admin') {
        const res = await getAdminNotifications();
        items = res.items.map(normalizeAdminNotif);
        unread = res.unread_count;
      } else if (activeRole === 'charity') {
        const charityId = serviceUser?.charity_id;
        if (!charityId) {
          // charity_id가 없으면 알림을 가져올 수 없음
          setLoading(false);
          return;
        }
        const res = await getCharityNotifications(charityId);
        items = res.items;
        unread = res.unread_count;
      } else {
        // donor
        const res = await getDonorNotifications();
        items = res.items;
        unread = res.unread_count;
      }

      setNotifications(items);
      setUnreadCount(unread);
    } catch {
      // API not ready — silently ignore
    } finally {
      setLoading(false);
    }
  }, [activeRole, serviceUser?.charity_id]);

  // Fetch on mount + poll every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // ── Mark read ──
  const handleMarkRead = async (id: string) => {
    try {
      if (activeRole === 'admin') {
        await markNotificationRead(id);
      } else {
        await markUserNotificationRead(id);
      }
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (activeRole === 'admin') {
        await markAllNotificationsRead();
      } else {
        await markAllUserNotificationsRead();
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    }
  };

  // Don't render if no role
  if (!activeRole) return null;

  const roleConfig = ROLE_CONFIG[activeRole];

  return (
    <Box pos="relative" ref={dropdownRef}>
      <Indicator
        color={roleConfig.color}
        label={unreadCount > 0 ? String(unreadCount) : undefined}
        disabled={unreadCount === 0}
        size={18}
        offset={4}
        processing={unreadCount > 0}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size={36}
          radius="xl"
          onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
          className={classes.bellButton}
        >
          <IconBell size={20} />
        </ActionIcon>
      </Indicator>

      {isOpen && (
        <Box className={classes.dropdown}>
          {/* Header */}
          <Group justify="space-between" p="sm" pb={8}>
            <Group gap={8}>
              <Text fw={700} size="sm">Notifications</Text>
              <Badge
                color={roleConfig.color}
                variant="light"
                size="xs"
                className={classes.roleIndicator}
              >
                {roleConfig.label}
              </Badge>
              {unreadCount > 0 && (
                <Badge color="red" variant="filled" size="xs">{unreadCount}</Badge>
              )}
            </Group>
            <Group gap={4}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xs"
                onClick={() => fetchNotifications()}
                loading={loading}
              >
                <IconRefresh size={14} />
              </ActionIcon>
              {unreadCount > 0 && (
                <Button
                  variant="subtle"
                  color="sage"
                  size="compact-xs"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
            </Group>
          </Group>

          <Divider />

          {/* Notification List */}
          <ScrollArea h={340} offsetScrollbars>
            {notifications.length === 0 ? (
              <Box className={classes.emptyState}>
                <IconBell size={32} color="var(--bm-text-muted)" />
                <Text size="sm" c="var(--bm-text-muted)" mt={8}>
                  No notifications yet
                </Text>
              </Box>
            ) : (
              <Stack gap={0}>
                {notifications.map((n) => {
                  const Icon = ICON_MAP[n.type] ?? IconBell;
                  const color = COLOR_MAP[n.type] ?? 'gray';
                  return (
                    <Box
                      key={n.id}
                      className={`${classes.notificationItem} ${!n.read ? classes.unread : ''}`}
                      data-role={activeRole}
                      onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                    >
                      <Group wrap="nowrap" gap={10} align="flex-start">
                        <ThemeIcon
                          size={28}
                          radius="xl"
                          color={color}
                          variant={n.read ? 'light' : 'filled'}
                          mt={2}
                        >
                          <Icon size={14} />
                        </ThemeIcon>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            size="xs"
                            fw={n.read ? 400 : 700}
                            c="var(--bm-text-dark)"
                            lineClamp={1}
                          >
                            {n.title}
                          </Text>
                          <Text size="xs" c="var(--bm-text-muted)" lineClamp={2} lh={1.4}>
                            {n.message}
                          </Text>
                          <Text size="xs" c="dimmed" mt={2}>{timeAgo(n.created_at)}</Text>
                        </Box>
                        {!n.read && (
                          <ActionIcon
                            variant="subtle"
                            color="sage"
                            size="xs"
                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          >
                            <IconCheck size={12} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </ScrollArea>

          {/* Footer */}
          <Divider />
          <Box className={classes.footer}>
            <Button
              variant="subtle"
              color="sage"
              size="compact-xs"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
