'use client';

import { Container, SimpleGrid, Title, Text, ThemeIcon, Box } from '@mantine/core';
import { IconSearch, IconHeartHandshake, IconReceiptTax } from '@tabler/icons-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import classes from './Features.module.css';

const features = [
  {
    icon: IconSearch,
    title: 'Discover',
    description:
      'Find verified charities that align with your values. Filter by cause, region, and impact to make your giving more meaningful.',
    step: '01',
  },
  {
    icon: IconHeartHandshake,
    title: 'Donate',
    description:
      'Give securely in just 3 clicks. We partner with Stripe so your financial data never touches our servers.',
    step: '02',
  },
  {
    icon: IconReceiptTax,
    title: 'Tax Refund',
    description:
      'Automatically organise your receipts and claim your 33.33% tax credit. Download your claim-ready pack in one click.',
    step: '03',
  },
];

export function Features() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={classes.section} id="about" ref={ref}>
      <Container size="xl">
        <Box className={`${classes.header} ${isVisible ? classes.visible : ''}`}>
          <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" mb={8}>
            How It Works
          </Text>
          <Title order={2} className={classes.sectionTitle}>
            Giving Made Simple
          </Title>
          <Text size="lg" c="var(--bm-text-muted)" maw={550} mx="auto" mt={12}>
            Three easy steps to make a real difference in your community while getting rewarded at tax time.
          </Text>
        </Box>

        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          spacing={{ base: 24, sm: 40 }}
          mt={48}
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`${classes.card} ${isVisible ? classes.visible : ''}`}
              style={{ transitionDelay: `${0.2 + index * 0.15}s` }}
            >
              <Text className={classes.stepNumber}>{feature.step}</Text>
              <ThemeIcon
                size={60}
                radius="xl"
                variant="light"
                color="sage"
                className={classes.icon}
              >
                <feature.icon size={28} stroke={1.5} />
              </ThemeIcon>
              <Title order={3} className={classes.cardTitle} mt={20}>
                {feature.title}
              </Title>
              <Text size="sm" c="var(--bm-text-muted)" mt={10} lh={1.7}>
                {feature.description}
              </Text>
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
