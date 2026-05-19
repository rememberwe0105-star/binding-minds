'use client';

import { useEffect, useRef } from 'react';
import { Container, Title, Text, Box, ThemeIcon, Group, Badge } from '@mantine/core';
import {
  IconSearch,
  IconHeartHandshake,
  IconFolderCheck,
  IconChartBar,
  IconCircleCheck,
  IconLock,
} from '@tabler/icons-react';
import classes from './HowItWorks.module.css';

const steps = [
  {
    icon: IconSearch,
    title: 'Explore',
    description:
      'Find verified charities and community projects across Aotearoa. Every charity is registered with NZ Charities Services.',
    color: 'sage',
    badge: null,
    trust: null,
  },
  {
    icon: IconHeartHandshake,
    title: 'Give with Heart',
    description:
      'Choose one-time or monthly. Your donation goes directly to the charity through Stripe — we never touch your money.',
    color: 'terracotta',
    badge: null,
    trust: 'Secured by Stripe',
  },
  {
    icon: IconFolderCheck,
    title: 'We Keep Track',
    description:
      'Every donation receipt is saved to your personal dashboard automatically. Nothing to print, nothing to lose.',
    color: 'sage',
    badge: null,
    trust: null,
  },
  {
    icon: IconChartBar,
    title: 'Review & Prepare',
    description:
      'See your full giving history, check your tax credit estimate, and download a year-end summary when you\'re ready.',
    color: 'terracotta',
    badge: 'Dashboard Tools',
    trust: null,
  },
  {
    icon: IconCircleCheck,
    title: 'Claim with Ease',
    description:
      'Use your organised records to file your Donation Tax Credit with IRD — it takes minutes, not hours.',
    color: 'sage',
    badge: null,
    trust: null,
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
          <Text size="sm" fw={600} c="var(--bm-sage-dark)" tt="uppercase" mb={8} style={{ letterSpacing: '2px' }}>
            How DearGiver Works
          </Text>
          <Title order={2} className={classes.heading}>
            From heartfelt giving to<br />hassle-free tax time.
          </Title>
          <Text size="md" c="var(--bm-text-muted)" maw={520} mx="auto" mt={12} lh={1.7}>
            We handle the paperwork so you can focus on what matters — making a difference across Aotearoa.
          </Text>
        </Box>

        <div className={classes.grid}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`${classes.stepCard} revealScale revealDelay${i + 1}`}
            >
              {/* 워터마크 번호 — 기존 사이트 패턴 유지 */}
              <Text className={classes.watermark}>{`0${i + 1}`}</Text>

              <ThemeIcon
                size={56}
                radius="xl"
                color={step.color}
                variant="light"
                className={classes.stepIcon}
              >
                <step.icon size={28} stroke={1.5} />
              </ThemeIcon>

              {/* 배지 (Step 4만) */}
              {step.badge && (
                <Badge
                  size="xs"
                  variant="light"
                  color="sage"
                  mt={10}
                  style={{ letterSpacing: '0.5px' }}
                >
                  {step.badge}
                </Badge>
              )}

              <Text fw={700} size="lg" c="var(--bm-text-dark)" mt={14} mb={8}>
                {step.title}
              </Text>
              <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>
                {step.description}
              </Text>

              {/* 신뢰 배지 (Step 2만) */}
              {step.trust && (
                <Group gap={4} justify="center" mt={12}>
                  <IconLock size={12} color="var(--bm-sage-dark)" />
                  <Text size="xs" fw={600} c="var(--bm-sage-dark)">
                    {step.trust}
                  </Text>
                </Group>
              )}
            </div>
          ))}
        </div>

        {/* 하단 부가 문구 */}
        <Text
          ta="center"
          size="xs"
          c="var(--bm-text-muted)"
          mt={40}
          fs="italic"
          className="reveal"
        >
          Donation Tax Credits may help make regular giving more sustainable. Check with IRD for your eligibility.
        </Text>
      </Container>
    </section>
  );
}
