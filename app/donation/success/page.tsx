'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Box, ThemeIcon } from '@mantine/core';
import { IconConfetti, IconHeart, IconChartBar } from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DonationSuccessPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: 'var(--bm-bg-cream)' }}>
        <Container size="sm">
          <Box ta="center" py={80}>
            <ThemeIcon
              size={100}
              radius="xl"
              color="sage"
              variant="light"
              mx="auto"
              mb={24}
              style={{
                animation: mounted ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <IconConfetti size={52} stroke={1.5} />
            </ThemeIcon>

            <Title order={1} style={{ fontSize: '2.2rem', color: 'var(--bm-text-dark)', marginBottom: 12 }}>
              Thank You! 🎉
            </Title>

            <Text size="lg" c="var(--bm-text-muted)" mb={8} maw={480} mx="auto">
              Your donation has been successfully processed.
              You&apos;re making a real difference in New Zealand!
            </Text>

            <Text size="sm" c="var(--bm-text-muted)" mb={40} maw={420} mx="auto">
              A receipt will be sent to your email. Your donation is eligible for a
              <strong> 33.33% NZ tax credit</strong> — claim it via myIR any time.
            </Text>

            <Box style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/dashboard"
                color="sage"
                size="md"
                radius="xl"
                leftSection={<IconChartBar size={18} />}
                style={{ background: 'var(--bm-sage-dark)' }}
              >
                View My Dashboard
              </Button>
              <Button
                component={Link}
                href="/projects"
                variant="outline"
                color="dark"
                size="md"
                radius="xl"
                leftSection={<IconHeart size={18} />}
              >
                Donate Again
              </Button>
            </Box>
          </Box>
        </Container>
      </main>
      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </>
  );
}
