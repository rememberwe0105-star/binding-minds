'use client';

import { Container, Title, Text, Button, Box, ThemeIcon } from '@mantine/core';
import { IconX, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DonationCancelPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', background: 'var(--bm-bg-cream)' }}>
        <Container size="sm">
          <Box ta="center" py={80}>
            <ThemeIcon
              size={100}
              radius="xl"
              color="orange"
              variant="light"
              mx="auto"
              mb={24}
            >
              <IconX size={52} stroke={1.5} />
            </ThemeIcon>

            <Title order={1} style={{ fontSize: '2rem', color: 'var(--bm-text-dark)', marginBottom: 12 }}>
              Payment Cancelled
            </Title>

            <Text size="lg" c="var(--bm-text-muted)" mb={8} maw={440} mx="auto">
              No worries — your payment was not charged.
              You can try again any time.
            </Text>

            <Text size="sm" c="var(--bm-text-muted)" mb={40} maw={400} mx="auto">
              If you experienced an issue, please contact our support team.
            </Text>

            <Box style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/projects"
                color="terracotta"
                size="md"
                radius="xl"
                leftSection={<IconArrowLeft size={18} />}
              >
                Back to Projects
              </Button>
              <Button
                component={Link}
                href="/support"
                variant="outline"
                color="dark"
                size="md"
                radius="xl"
              >
                Contact Support
              </Button>
            </Box>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
