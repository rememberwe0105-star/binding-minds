'use client';

import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Box,
  Group,
} from '@mantine/core';
import { IconLeaf, IconMail } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        <div className={classes.blobLeft} />
        <div className={classes.blobRight} />

        <Container size="sm" className={classes.container}>
          <Box className={classes.card}>
            <Group justify="center" mb={16}>
              <IconLeaf size={40} color="var(--bm-terracotta)" stroke={1.5} />
            </Group>
            <Title order={2} ta="center" className={classes.title}>
              Blog Coming Soon
            </Title>
            <Text ta="center" c="var(--bm-text-muted)" size="md" lh={1.7} mb={32} maw={400} mx="auto">
              We&apos;re crafting stories about the impact our community is making across Aotearoa.
              Subscribe to be the first to read them.
            </Text>

            <Group gap="sm" justify="center">
              <TextInput
                placeholder="your@email.com"
                size="md"
                radius="xl"
                leftSection={<IconMail size={18} />}
                className={classes.emailInput}
              />
              <Button color="terracotta" size="md" radius="xl">
                Notify Me
              </Button>
            </Group>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
