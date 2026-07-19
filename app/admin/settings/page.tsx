'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Box, Group, Button, Badge,
  Card, SimpleGrid, ThemeIcon, Alert, Stack,
  TextInput, NumberInput, Switch, Divider, Loader,
} from '@mantine/core';
import {
  IconShieldCheck, IconAlertCircle, IconArrowLeft,
  IconSettings, IconPercentage, IconTags,
  IconMapPin, IconDeviceFloppy, IconX, IconPlus,
  IconClipboardCheck, IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAdminSettings,
  updateAdminSettings,
  type PlatformSettings,
} from '@/lib/api';
import classes from './page.module.css';

const DEFAULT_SETTINGS: PlatformSettings = {
  platform_fee_rate: 0.025,
  min_donation_minor: 500,
  max_donation_minor: 5000000,
  categories: ['Environment', 'Education', 'Health & Wellbeing', 'Community', 'Animal Welfare', 'Arts & Culture', 'Emergency Relief', 'Children & Youth', 'Food & Housing', 'Disability', 'Māori, Pasifika & Ethnic Communities'],
  regions: ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty', 'Otago', 'Northland', 'Taranaki', 'Southland', 'Nationwide'],
  auto_approve_projects: false,
  require_stripe_onboarding: true,
};

export default function AdminSettingsPage() {
  const { displayEmail } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDefaultData, setIsDefaultData] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newRegion, setNewRegion] = useState('');

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch(() => { setIsDefaultData(true); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await updateAdminSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally { setSaving(false); }
  };

  const addCategory = () => {
    if (newCategory.trim() && !settings.categories.includes(newCategory.trim())) {
      setSettings(prev => ({ ...prev, categories: [...prev.categories, newCategory.trim()] }));
      setNewCategory('');
    }
  };
  const removeCategory = (cat: string) => {
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };
  const addRegion = () => {
    if (newRegion.trim() && !settings.regions.includes(newRegion.trim())) {
      setSettings(prev => ({ ...prev, regions: [...prev.regions, newRegion.trim()] }));
      setNewRegion('');
    }
  };
  const removeRegion = (region: string) => {
    setSettings(prev => ({ ...prev, regions: prev.regions.filter(r => r !== region) }));
  };

  return (
    <ProtectedRoute allowedDemoRoles={['admin']}>
      <Header />
      <main className={classes.page}>
        <Container size="xl" py={40}>
          <Button component={Link} href="/admin" variant="subtle" color="gray" size="compact-sm" leftSection={<IconArrowLeft size={14} />} mb={12}>
            Back to Overview
          </Button>
          <Group justify="space-between" mb={24}>
            <Box>
              <Group gap={8} mb={4}>
                <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
                <Text size="sm" fw={600} tt="uppercase" c="var(--bm-sage-dark)" style={{ letterSpacing: '1.5px' }}>Admin Panel</Text>
              </Group>
              <Title order={1} className={classes.pageTitle}>Platform Settings</Title>
            </Box>
            <Button color="sage" radius="xl" leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} loading={saving} size="md">Save Settings</Button>
          </Group>

          {error && (<Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="md" mb={16} withCloseButton onClose={() => setError(null)}><Text size="sm">{error}</Text></Alert>)}
          {success && (<Alert color="green" variant="light" radius="md" mb={16}><Text size="sm" fw={600}>Settings saved successfully!</Text></Alert>)}
          {isDefaultData && (<Alert icon={<IconAlertCircle size={14} />} color="blue" variant="light" radius="md" mb={16}><Text size="sm">Backend not connected. Showing default values.</Text></Alert>)}

          {loading ? (
            <Box ta="center" py={80}><Loader size="lg" color="sage" /><Text c="var(--bm-text-muted)" mt={12}>Loading settings...</Text></Box>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
              <Stack gap={24}>
                {/* Fee Settings */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="grape" variant="light"><IconPercentage size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Fee Settings</Text></Group>
                  <Stack gap={16}>
                    <NumberInput label="Platform Fee Rate (%)" description="Percentage charged on each donation" value={settings.platform_fee_rate * 100} onChange={(val) => setSettings(prev => ({ ...prev, platform_fee_rate: (Number(val) || 0) / 100 }))} min={0} max={100} step={0.1} decimalScale={1} suffix="%" radius="md" />
                    <NumberInput label="Minimum Donation ($)" description="Smallest allowed donation amount" value={settings.min_donation_minor / 100} onChange={(val) => setSettings(prev => ({ ...prev, min_donation_minor: Math.round((Number(val) || 0) * 100) }))} min={1} prefix="$" decimalScale={2} radius="md" />
                    <NumberInput label="Maximum Donation ($)" description="Largest allowed single donation" value={settings.max_donation_minor / 100} onChange={(val) => setSettings(prev => ({ ...prev, max_donation_minor: Math.round((Number(val) || 0) * 100) }))} min={100} prefix="$" decimalScale={0} radius="md" />
                  </Stack>
                </Card>
                {/* Categories */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="blue" variant="light"><IconTags size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Categories</Text></Group>
                  <Group gap={8} mb={12} wrap="wrap">
                    {settings.categories.map(cat => (<Badge key={cat} color="sage" variant="light" size="lg" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => removeCategory(cat)} />}>{cat}</Badge>))}
                  </Group>
                  <Group gap={8}>
                    <TextInput placeholder="New category..." value={newCategory} onChange={(e) => setNewCategory(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && addCategory()} radius="md" style={{ flex: 1 }} />
                    <Button variant="light" color="sage" radius="md" leftSection={<IconPlus size={14} />} onClick={addCategory}>Add</Button>
                  </Group>
                </Card>
                {/* Regions */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="green" variant="light"><IconMapPin size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Regions</Text></Group>
                  <Group gap={8} mb={12} wrap="wrap">
                    {settings.regions.map(region => (<Badge key={region} color="green" variant="light" size="lg" rightSection={<IconX size={12} style={{ cursor: 'pointer' }} onClick={() => removeRegion(region)} />}>{region}</Badge>))}
                  </Group>
                  <Group gap={8}>
                    <TextInput placeholder="New region..." value={newRegion} onChange={(e) => setNewRegion(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && addRegion()} radius="md" style={{ flex: 1 }} />
                    <Button variant="light" color="green" radius="md" leftSection={<IconPlus size={14} />} onClick={addRegion}>Add</Button>
                  </Group>
                </Card>
              </Stack>

              <Stack gap={24}>
                {/* Project Review Policy */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="violet" variant="light"><IconClipboardCheck size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Project Review Policy</Text></Group>
                  <Stack gap={20}>
                    <Switch label="Require admin approval for new projects" description="Projects start as pending_review and must be approved before going live." checked={!settings.auto_approve_projects} onChange={(e) => setSettings(prev => ({ ...prev, auto_approve_projects: !e.currentTarget.checked }))} color="sage" size="md" />
                    <Divider />
                    <Switch label="Require Stripe onboarding" description="Charities must complete Stripe Connect setup before creating projects." checked={settings.require_stripe_onboarding} onChange={(e) => setSettings(prev => ({ ...prev, require_stripe_onboarding: e.currentTarget.checked }))} color="sage" size="md" />
                  </Stack>
                </Card>
                {/* Admin Account */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="orange" variant="light"><IconUser size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Admin Account</Text></Group>
                  <Box p={16} style={{ background: 'var(--bm-sage-bg, #f5f7f0)', borderRadius: 8 }}>
                    <Text size="sm" c="var(--bm-text-muted)" mb={4}>Current Admin</Text>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">{displayEmail || 'admin@deargiver.co.nz'}</Text>
                  </Box>
                  <Divider my={16} />
                  <Box p={16} style={{ background: '#f8f9fa', borderRadius: 8 }}>
                    <Group gap={8} mb={4}><IconSettings size={14} color="var(--bm-text-muted)" /><Text size="sm" fw={600} c="var(--bm-text-muted)">Multi-Admin Management</Text></Group>
                    <Text size="xs" c="var(--bm-text-muted)">Role-based admin management (super_admin, content_moderator, finance_viewer) will be available in a future update.</Text>
                  </Box>
                </Card>
                {/* Platform Info */}
                <Card padding="xl" radius="lg" withBorder>
                  <Group gap={8} mb={16}><ThemeIcon size={32} radius="md" color="gray" variant="light"><IconShieldCheck size={16} /></ThemeIcon><Text fw={700} size="md" c="var(--bm-text-dark)">Platform Info</Text></Group>
                  <Stack gap={8}>
                    {[{ label: 'Platform', value: 'DearGiver NZ' }, { label: 'Version', value: '1.0.0-beta' }, { label: 'Region', value: 'New Zealand' }, { label: 'Currency', value: 'NZD' }, { label: 'Payment Provider', value: 'Stripe Connect' }].map(({ label, value }) => (
                      <Group key={label} justify="space-between"><Text size="sm" c="var(--bm-text-muted)">{label}</Text><Text size="sm" fw={600} c="var(--bm-text-dark)">{value}</Text></Group>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </SimpleGrid>
          )}
        </Container>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
