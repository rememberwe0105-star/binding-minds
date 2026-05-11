'use client';

import { useState } from 'react';
import { Container, Title, Text, Box, Slider, Group } from '@mantine/core';
import { IconCalculator, IconCoin } from '@tabler/icons-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import classes from './TaxTeaser.module.css';

// 뉴질랜드 기부 세액 공제: 기부금의 33.33% 환급 (과세소득 한도 내)
function calculateRefund(income: number, totalDonations: number): number {
  const eligibleDonations = Math.min(totalDonations, income);
  return Math.round(eligibleDonations * 0.3333);
}

export function TaxTeaser() {
  const [income, setIncome] = useState(65000);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  // 예시로 연간 기부 총액을 소득의 5%로 가정
  const estimatedDonations = Math.round(income * 0.05);
  const estimatedRefund = calculateRefund(income, estimatedDonations);

  return (
    <section className={classes.section} ref={ref}>
      <div className={classes.bgBlob} />
      <Container size="lg" className={classes.container}>
        <div className={`${classes.content} ${isVisible ? classes.visible : ''}`}>
          <Box className={classes.textBlock}>
            <Group gap={12} mb={16}>
              <IconCalculator size={28} color="rgba(255,255,255,0.9)" />
              <Text size="sm" fw={600} tt="uppercase" c="rgba(255,255,255,0.7)" style={{ letterSpacing: '1px' }}>
                Tax Refund Estimator
              </Text>
            </Group>

            <Title order={2} className={classes.title}>
              How much could you get back?
            </Title>

            <Text size="lg" className={classes.subtitle}>
              New Zealand offers a 33.33% tax credit on donations to approved organisations.
              Slide to estimate your annual refund.
            </Text>
          </Box>

          <Box className={classes.widgetBlock}>
            <div className={classes.widget}>
              <Text size="sm" fw={500} c="var(--bm-text-muted)" mb={8}>
                Your Estimated Annual Income
              </Text>
              <Text size="xl" fw={800} c="var(--bm-text-dark)" mb={20}>
                ${income.toLocaleString('en-NZ')}
              </Text>

              <Slider
                value={income}
                onChange={setIncome}
                min={20000}
                max={200000}
                step={5000}
                color="sage"
                size="lg"
                marks={[
                  { value: 20000, label: '$20k' },
                  { value: 100000, label: '$100k' },
                  { value: 200000, label: '$200k' },
                ]}
                styles={{
                  markLabel: { color: 'var(--bm-text-muted)', fontSize: '0.75rem' },
                }}
              />

              <div className={classes.results}>
                <div className={classes.resultItem}>
                  <Text size="xs" c="dimmed" mb={4}>
                    Est. Annual Donations (5%)
                  </Text>
                  <Text size="lg" fw={700} c="var(--bm-sage-dark)">
                    ${estimatedDonations.toLocaleString('en-NZ')}
                  </Text>
                </div>
                <div className={classes.resultDivider} />
                <div className={classes.resultItem}>
                  <Group gap={6} mb={4}>
                    <IconCoin size={16} color="var(--bm-terracotta)" />
                    <Text size="xs" c="dimmed">
                      Your Tax Refund
                    </Text>
                  </Group>
                  <Text size="xl" fw={800} c="var(--bm-terracotta)">
                    ${estimatedRefund.toLocaleString('en-NZ')}
                  </Text>
                </div>
              </div>
            </div>
          </Box>
        </div>
      </Container>
    </section>
  );
}
