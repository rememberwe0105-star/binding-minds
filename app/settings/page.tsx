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
  const { user, logOut } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(false);
  const [taxReminders, setTaxReminders] = useState(true);

  const handleSave = () => {
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
                <Text fw={700} size="md" c="var(--bm-text-dark)" mb={20}>
                  Email Notifications
                </Text>
                <Stack gap={20}>
                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Donation Receipts</Text>
                      <Text size="xs" c="var(--bm-text-muted)">
                        Receive a receipt email after every donation
                      </Text>
                    </Box>
                    <Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.currentTarget.checked)} color="sage" />
                  </Group>

                  <Divider />

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Monthly Impact Report</Text>
                      <Text size="xs" c="var(--bm-text-muted)">
                        Summary of your giving activity and impact
                      </Text>
                    </Box>
                    <Switch checked={monthlyReport} onChange={(e) => setMonthlyReport(e.currentTarget.checked)} color="sage" />
                  </Group>

                  <Divider />

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Campaign Updates</Text>
                      <Text size="xs" c="var(--bm-text-muted)">
                        Updates from campaigns you&apos;ve supported
                      </Text>
                    </Box>
                    <Switch checked={campaignUpdates} onChange={(e) => setCampaignUpdates(e.currentTarget.checked)} color="sage" />
                  </Group>

                  <Divider />

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">Tax Season Reminders</Text>
                      <Text size="xs" c="var(--bm-text-muted)">
                        Reminder to claim your donation tax credit before March 31
                      </Text>
                    </Box>
                    <Switch checked={taxReminders} onChange={(e) => setTaxReminders(e.currentTarget.checked)} color="sage" />
                  </Group>
                </Stack>

                <Group justify="flex-end" mt={24}>
                  <Button color="sage" radius="xl" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave}>
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
