import { Container, Title, Text, Box, Group } from '@mantine/core';
import { IconLeaf } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--bm-bg-warm)', padding: '60px 0' }}>
        <Container size="md">
          <Group gap={8} mb={12}>
            <IconLeaf size={22} color="var(--bm-terracotta)" />
            <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>Legal</Text>
          </Group>
          <Title order={1} mb={8} style={{ fontSize: '2rem', color: 'var(--bm-text-dark)' }}>Terms of Service</Title>
          <Text size="sm" c="var(--bm-text-muted)" mb={32}>Last updated: May 2026</Text>

          <Box style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid rgba(143,151,121,0.08)' }}>
            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>1. Acceptance of Terms</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              By accessing or using Binding Minds, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>2. Platform Services</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              Binding Minds provides a platform connecting donors with verified charitable organisations in New Zealand. We facilitate payment processing through Stripe and generate tax documentation. We do not hold or manage donation funds directly.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>3. User Accounts</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>4. Donations & Refunds</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              All donations are final and non-refundable unless required by law. Donation receipts are generated automatically for tax purposes. It is your responsibility to verify your eligibility for tax credits.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>5. Limitation of Liability</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8}>
              Binding Minds is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount of fees paid to us in the twelve months preceding the claim.
            </Text>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
