import { Container, Title, Text, Box, Group } from '@mantine/core';
import { IconLeaf } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--bm-bg-warm)', padding: '60px 0' }}>
        <Container size="md">
          <Group gap={8} mb={12}>
            <IconLeaf size={22} color="var(--bm-terracotta)" />
            <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>Legal</Text>
          </Group>
          <Title order={1} mb={8} style={{ fontSize: '2rem', color: 'var(--bm-text-dark)' }}>Cookie Policy</Title>
          <Text size="sm" c="var(--bm-text-muted)" mb={32}>Last updated: May 2026</Text>

          <Box style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid rgba(143,151,121,0.08)' }}>
            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>What Are Cookies?</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use our platform.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>Essential Cookies</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              These cookies are necessary for the platform to function properly. They enable core features like authentication, security, and session management. You cannot opt out of essential cookies.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>Analytics Cookies</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              We use analytics cookies to understand how visitors interact with our platform. This data helps us improve our services. All analytics data is anonymised and aggregated.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>Managing Cookies</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8}>
              You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. For more information, contact us at privacy@bindingminds.co.nz.
            </Text>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
