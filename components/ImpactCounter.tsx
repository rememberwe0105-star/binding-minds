'use client';

import { useEffect, useRef, useState } from 'react';
import { Container, Title, Text, Box, SimpleGrid } from '@mantine/core';
import { IconUsers, IconHeart, IconTree, IconBuildingBank } from '@tabler/icons-react';
import classes from './ImpactCounter.module.css';

interface CounterItem {
  icon: typeof IconUsers;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  color: string;
}

const counters: CounterItem[] = [
  { icon: IconHeart, value: 2847, prefix: '', suffix: '', label: 'Donations Made', color: 'var(--bm-terracotta)' },
  { icon: IconUsers, value: 1250, prefix: '', suffix: '+', label: 'Active Donors', color: 'var(--bm-sage-dark)' },
  { icon: IconBuildingBank, value: 174850, prefix: '$', suffix: '', label: 'Total Raised (NZD)', color: 'var(--bm-terracotta)' },
  { icon: IconTree, value: 48, prefix: '', suffix: '', label: 'Verified Charities', color: 'var(--bm-sage-dark)' },
];

function AnimatedCounter({ target, prefix, suffix, isVisible }: { target: number; prefix: string; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const startTime = performance.now();

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(easedProgress * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target]);

  // Format number with commas
  const formatted = count.toLocaleString('en-NZ');

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function ImpactCounter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Also trigger reveal classes
            entry.target.querySelectorAll('.reveal, .revealScale').forEach((child) => {
              child.classList.add('visible');
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className={classes.section} ref={sectionRef}>
      {/* Background decorations */}
      <div className={classes.bgBlob1} />
      <div className={classes.bgBlob2} />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Box ta="center" mb={48} className="reveal">
          <Text size="sm" fw={600} c="rgba(255,255,255,0.6)" tt="uppercase" mb={8} style={{ letterSpacing: '2px' }}>
            Our Impact
          </Text>
          <Title order={2} className={classes.heading}>
            Together, We&apos;re Making a Difference
          </Title>
          <Text size="md" c="rgba(255,255,255,0.6)" maw={480} mx="auto" mt={8}>
            Real numbers, real change. See how your generosity transforms communities across Aotearoa.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={24}>
          {counters.map((item, i) => (
            <div
              key={item.label}
              className={`${classes.counterCard} revealScale revealDelay${i + 1}`}
            >
              <div className={classes.iconWrapper} style={{ background: `${item.color}20` }}>
                <item.icon size={28} color={item.color} stroke={1.5} />
              </div>
              <Text className={classes.counterValue}>
                <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} isVisible={isVisible} />
              </Text>
              <Text size="sm" c="rgba(255,255,255,0.6)" fw={500}>
                {item.label}
              </Text>
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
