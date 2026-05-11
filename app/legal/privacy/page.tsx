import { Container, Title, Text, Box, Group, Divider } from '@mantine/core';
import { IconLeaf } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--bm-bg-warm)', padding: '60px 0' }}>
        <Container size="md">
          <Group gap={8} mb={12}>
            <IconLeaf size={22} color="var(--bm-terracotta)" />
            <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
              Legal
            </Text>
          </Group>
          <Title order={1} mb={8} style={{ fontSize: '2rem', color: 'var(--bm-text-dark)' }}>
            Privacy Policy
          </Title>
          <Text size="sm" c="var(--bm-text-muted)" mb={32}>Last updated: May 2026</Text>

          <Box style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid rgba(143,151,121,0.08)' }}>
            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>1. Information We Collect</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              We collect information you provide directly, such as your name, email address, and payment details when you create an account or make a donation. We also automatically collect certain information about your device and usage through cookies and similar technologies.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>2. How We Use Your Information</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              We use collected information to process donations, manage your account, generate tax receipts, communicate with you about your donations, and improve our platform. We never sell your personal data to third parties.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>3. Data Security</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              We implement industry-standard security measures including encryption, secure data storage, and regular security audits. Payment processing is handled by Stripe, which maintains PCI DSS Level 1 compliance.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>4. Your Rights</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8} mb={24}>
              Under the New Zealand Privacy Act 2020, you have the right to access, correct, and request deletion of your personal information. Contact us at privacy@bindingminds.co.nz to exercise these rights.
            </Text>

            <Title order={3} mb={12} style={{ color: 'var(--bm-text-dark)' }}>5. Contact</Title>
            <Text size="sm" c="var(--bm-text-muted)" lh={1.8}>
              For privacy-related enquiries, please contact our Privacy Officer at privacy@bindingminds.co.nz or visit our Support page.
            </Text>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
