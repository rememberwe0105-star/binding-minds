'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Box,
  Group,
  TextInput,
  Button,
  Avatar,
  SimpleGrid,
  Switch,
  Divider,
  Badge,
  Stack,
  ThemeIcon,
  Tabs,
} from '@mantine/core';
import {
  IconUser,
  IconBell,
  IconLock,
  IconCheck,
  IconDeviceFloppy,
  IconCreditCard,
  IconShieldCheck,
  IconLogout,
  IconTrash,
} from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import classes from './page.module.css';

function SettingsContent() {
  const { user, logOut, demoRole, userRole } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});

  // Determine active role for notification settings
  const activeNotifRole = demoRole ?? (userRole === 'platform_admin' ? 'admin' : userRole === 'charity_admin' ? 'charity' : 'donor');

  // Role-based notification items
  type NotifItem = { key: string; label: string; description: string; defaultOn: boolean; mandatory?: boolean };

  const DONOR_NOTIF_ITEMS: NotifItem[] = [
    { key: 'donation_receipts', label: 'Donation Receipts', description: 'Receive a receipt email after every donation', defaultOn: true },
    { key: 'badge_notifications', label: 'Badge Unlocked', description: 'Get notified when you earn a new achievement badge', defaultOn: true },
    { key: 'milestone_updates', label: 'Project Milestones', description: 'Updates when projects you supported reach funding milestones', defaultOn: true },
    { key: 'monthly_report', label: 'Monthly Impact Report', description: 'Summary of your giving activity and impact', defaultOn: true },
    { key: 'campaign_updates', label: 'Campaign Updates', description: 'Updates from campaigns you\'ve supported', defaultOn: false },
    { key: 'tax_reminders', label: 'Tax Season Reminders', description: 'Reminder to claim your donation tax credit before March 31', defaultOn: true },
    { key: 'charity_news', label: 'Charity News', description: 'News and annual reports from charities you\'ve donated to', defaultOn: false },
  ];

  const CHARITY_NOTIF_ITEMS: NotifItem[] = [
    { key: 'donation_received', label: 'Donation Received', description: 'Notify when a new donation is received', defaultOn: true },
    { key: 'project_status_change', label: 'Project Status Changes', description: 'Notifications for project approval, rejection, or suspension', defaultOn: true, mandatory: true },
    { key: 'fundraising_milestones', label: 'Fundraising Milestones', description: 'Celebrate when your project reaches 25%, 50%, 75%, 100% of its goal', defaultOn: true },
    { key: 'settlement_complete', label: 'Settlement Complete', description: 'Notification when funds are settled to your bank account', defaultOn: true },
    { key: 'stripe_alerts', label: 'Stripe Account Alerts', description: 'Notifications about your Stripe Connect account status', defaultOn: true, mandatory: true },
    { key: 'admin_messages', label: 'Admin Messages', description: 'Messages from the DearGiver platform admin team', defaultOn: true, mandatory: true },
    { key: 'document_expiry', label: 'Document Expiry', description: 'Reminders when your compliance documents are about to expire', defaultOn: true },
    { key: 'refund_alerts', label: 'Refund Notifications', description: 'Alerts when a donation refund is issued', defaultOn: true },
  ];

  const ADMIN_NOTIF_ITEMS: NotifItem[] = [
    { key: 'new_applications', label: 'New Charity Applications', description: 'New charity registration applications awaiting review', defaultOn: true, mandatory: true },
    { key: 'project_reviews', label: 'Project Reviews', description: 'New projects submitted for pre-approval review', defaultOn: true, mandatory: true },
    { key: 'large_donations', label: 'Large Donations', description: 'Alert when a donation above the threshold is received', defaultOn: true },
    { key: 'refund_requests', label: 'Refund Requests', description: 'Refund requests requiring admin attention', defaultOn: true },
    { key: 'stripe_issues', label: 'Stripe Issues', description: 'Stripe Connect account issues for any charity', defaultOn: true },
    { key: 'daily_summary', label: 'Daily Summary', description: 'Daily digest of platform activity, donations, and signups', defaultOn: false },
    { key: 'anomaly_detection', label: 'Anomaly Detection', description: 'Alerts for unusual activity patterns on the platform', defaultOn: true, mandatory: true },
    { key: 'system_events', label: 'System Events', description: 'Maintenance notices, system updates, and platform alerts', defaultOn: true },
  ];

  const notifItems = activeNotifRole === 'admin'
    ? ADMIN_NOTIF_ITEMS
    : activeNotifRole === 'charity'
      ? CHARITY_NOTIF_ITEMS
      : DONOR_NOTIF_ITEMS;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveNotifs = () => {
    // TODO: call updateNotificationPreferences(notifPrefs)
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="md">
          {/* Page header */}
          <Group gap={16} mb={32}>
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName || 'User'}
              size={64}
              radius="xl"
              color="sage"
            >
              {user?.displayName?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Title order={2} className={classes.heading}>
                Account Settings
              </Title>
              <Text size="sm" c="var(--bm-text-muted)">
                Manage your profile, notifications, and preferences.
              </Text>
            </Box>
          </Group>

          <Tabs defaultValue="profile" color="sage" radius="md">
            <Tabs.List className={classes.tabList}>
              <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>Profile</Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>Notifications</Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>Security</Tabs.Tab>
            </Tabs.List>

            {/* ── Profile Tab ── */}
            <Tabs.Panel value="profile">
              <Card padding="xl" radius="lg" withBorder mt={20}>
                <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>
                  Personal Information
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
                  <TextInput
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    size="md"
                    radius="md"
                  />
                  <TextInput
                    label="Email Address"
                    value={email}
                    size="md"
                    radius="md"
                    disabled
                    description="Contact support to change email"
                  />
                </SimpleGrid>

                <Divider my={24} />

                {/* Account info */}
                <Text fw={700} size="md" c="var(--bm-text-dark)" mb={16}>
                  Account Details
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12} mb={24}>
                  <Group gap={12}>
                    <ThemeIcon size={36} radius="md" color="sage" variant="light">
                      <IconShieldCheck size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Verified Account</Text>
                      <Text size="xs" c="var(--bm-text-muted)">Email verified via Firebase</Text>
                    </Box>
                  </Group>
                  <Group gap={12}>
                    <ThemeIcon size={36} radius="md" color="terracotta" variant="light">
                      <IconCreditCard size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Payment</Text>
                      <Text size="xs" c="var(--bm-text-muted)">Managed via Stripe</Text>
                    </Box>
                  </Group>
                </SimpleGrid>

                <Group justify="flex-end">
                  <Button
                    color="sage"
                    radius="xl"
                    leftSection={saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                    className={classes.saveBtn}
                  >
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </Group>
              </Card>
            </Tabs.Panel>

            {/* ── Notifications Tab ── */}
            <Tabs.Panel value="notifications">
              <Card padding="xl" radius="lg" withBorder mt={20}>
                <Group justify="space-between" mb={20}>
                  <Text fw={700} size="md" c="var(--bm-text-dark)">
                    Notification Preferences
                  </Text>
                  <Badge
                    color={activeNotifRole === 'admin' ? 'violet' : activeNotifRole === 'charity' ? 'blue' : 'terracotta'}
                    variant="light"
                    size="sm"
                  >
                    {activeNotifRole === 'admin' ? 'Admin' : activeNotifRole === 'charity' ? 'Charity' : 'Donor'}
                  </Badge>
                </Group>

                <Stack gap={0}>
                  {notifItems.map((item, idx) => (
                    <Box key={item.key}>
                      {idx > 0 && <Divider />}
                      <Group justify="space-between" py={14}>
                        <Box style={{ flex: 1 }}>
                          <Group gap={6}>
                            <Text size="sm" fw={600} c="var(--bm-text-dark)">{item.label}</Text>
                            {item.mandatory && (
                              <Badge color="gray" variant="outline" size="xs">
                                <Group gap={2}>
                                  <IconLock size={8} />
                                  Required
                                </Group>
                              </Badge>
                            )}
                          </Group>
                          <Text size="xs" c="var(--bm-text-muted)">
                            {item.description}
                          </Text>
                        </Box>
                        <Switch
                          checked={item.mandatory ? true : (notifPrefs[item.key] ?? item.defaultOn)}
                          onChange={(e) => {
                            if (item.mandatory) return;
                            setNotifPrefs(prev => ({ ...prev, [item.key]: e.currentTarget.checked }));
                          }}
                          disabled={item.mandatory}
                          color="sage"
                        />
                      </Group>
                    </Box>
                  ))}
                </Stack>

                <Group justify="flex-end" mt={24}>
                  <Button color="sage" radius="xl" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSaveNotifs}>
                    Save Preferences
                  </Button>
                </Group>
              </Card>
            </Tabs.Panel>

            {/* ── Security Tab ── */}
            <Tabs.Panel value="security">
              <Card padding="xl" radius="lg" withBorder mt={20}>
                <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>
                  Security Settings
                </Text>

                <Group gap={12} mb={24}>
                  <ThemeIcon size={40} radius="md" color="sage" variant="light">
                    <IconShieldCheck size={20} />
                  </ThemeIcon>
                  <Box flex={1}>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Authentication Method</Text>
                    <Text size="xs" c="var(--bm-text-muted)">
                      {user?.providerData?.[0]?.providerId === 'google.com'
                        ? 'Google Account'
                        : 'Email & Password'}
                    </Text>
                  </Box>
                  <Badge color="sage" variant="light" size="sm">
                    Active
                  </Badge>
                </Group>

                <Divider mb={24} />

                <Text fw={700} size="md" c="var(--bm-text-dark)" mb={16}>
                  Account Actions
                </Text>

                <Stack gap={12}>
                  <Button
                    variant="outline"
                    color="red"
                    radius="md"
                    leftSection={<IconLogout size={16} />}
                    onClick={logOut}
                    fullWidth
                  >
                    Log Out
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    radius="md"
                    leftSection={<IconTrash size={16} />}
                    fullWidth
                  >
                    Delete Account
                  </Button>
                  <Text size="xs" c="dimmed" ta="center">
                    Account deletion is permanent and cannot be undone.
                  </Text>
                </Stack>
              </Card>
            </Tabs.Panel>
          </Tabs>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
