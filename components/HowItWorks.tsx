'use client';

import { useEffect, useRef } from 'react';
import { Container, Title, Text, Box, ThemeIcon, Group } from '@mantine/core';
import {
  IconSearch,
  IconHeartHandshake,
  IconReceipt,
  IconMoodHappy,
} from '@tabler/icons-react';
import classes from './HowItWorks.module.css';

const steps = [
  {
    icon: IconSearch,
    title: 'Discover',
    description: 'Browse verified campaigns across Aotearoa and find causes that speak to your heart.',
    color: 'sage',
  },
  {
    icon: IconHeartHandshake,
    title: 'Donate',
    description: 'Give securely with one click. Choose one-time or monthly — every dollar counts.',
    color: 'terracotta',
  },
  {
    icon: IconReceipt,
    title: 'Track',
    description: 'Monitor your impact with a personal dashboard. See where every dollar goes.',
    color: 'sage',
  },
  {
    icon: IconMoodHappy,
    title: 'Claim',
    description: 'Get 33.33% back on your taxes. We generate IRD-ready receipts automatically.',
    color: 'terracotta',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const el = sectionRef.current;
    if (el) {
      el.querySelectorAll('.reveal, .revealScale').forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className={classes.section} ref={sectionRef}>
      <Container size="lg">
        <Box ta="center" mb={48} className="reveal">
          <Text size="sm" fw={600} c="var(--bm-terracotta)" tt="uppercase" mb={8} style={{ letterSpacing: '2px' }}>
            Simple Process
          </Text>
          <Title order={2} className={classes.heading}>
            How It Works
          </Title>
          <Text size="md" c="var(--bm-text-muted)" maw={480} mx="auto" mt={8}>
            From discovery to tax refund — giving has never been this effortless.
          </Text>
        </Box>

        <div className={classes.grid}>
          {/* Connecting line (desktop) */}
          <div className={classes.connectingLine} />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`${classes.stepCard} revealScale revealDelay${i + 1}`}
            >
              <div className={classes.stepNumber}>{i + 1}</div>
              <ThemeIcon
                size={56}
                radius="xl"
                color={step.color}
                variant="light"
                className={classes.stepIcon}
              >
                <step.icon size={28} stroke={1.5} />
              </ThemeIcon>
              <Text fw={700} size="lg" c="var(--bm-text-dark)" mt={16} mb={8}>
                {step.title}
              </Text>
              <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                {step.description}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
