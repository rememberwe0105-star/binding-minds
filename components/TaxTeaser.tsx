'use client';

import { useState } from 'react';
import { Container, Title, Text, Box, Slider, Group, Badge } from '@mantine/core';
import { IconReceipt, IconCoin, IconInfoCircle } from '@tabler/icons-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import classes from './TaxTeaser.module.css';

// NZ Donation Tax Credit: 33.33% of eligible donations
function calculateCredit(donations: number): number {
  return Math.round(donations * 0.3333);
}

export function TaxTeaser() {
  const [donation, setDonation] = useState(600);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const estimatedCredit = calculateCredit(donation);

  return (
    <section className={classes.section} ref={ref}>
      <div className={classes.bgBlob} />
      <Container size="lg" className={classes.container}>
        <div className={`${classes.content} ${isVisible ? classes.visible : ''}`}>
          <Box className={classes.textBlock}>
            <Group gap={12} mb={16}>
              <IconReceipt size={28} color="rgba(255,255,255,0.9)" />
              <Text size="sm" fw={600} tt="uppercase" c="rgba(255,255,255,0.7)" style={{ letterSpacing: '1px' }}>
                Tax Credit Calculator
              </Text>
            </Group>

            <Title order={2} className={classes.title}>
              Giving back can<br />come back to you.
            </Title>

            <Text size="lg" className={classes.subtitle}>
              In Aotearoa, donations to approved charities can qualify for a
              tax credit of up to one-third. Slide the bar and see how your
              generosity could work both ways.
            </Text>

            {/* Disclaimer inline */}
            <Group gap={6} mt={20} className={classes.disclaimer}>
              <IconInfoCircle size={14} color="rgba(255,255,255,0.5)" />
              <Text size="xs" c="rgba(255,255,255,0.5)" lh={1.5}>
                This is a simplified illustration only. Your actual tax credit depends
                on IRD rules, your taxable income, and valid receipts from approved
                donee organisations.
              </Text>
            </Group>
          </Box>

          <Box className={classes.widgetBlock}>
            <div className={classes.widget}>
              {/* Estimate Badge */}
              <Badge
                size="xs"
                variant="light"
                color="orange"
                mb={16}
                leftSection={<IconInfoCircle size={10} />}
              >
                Illustrative estimate
              </Badge>

              <Text size="sm" fw={500} c="var(--bm-text-muted)" mb={4}>
                If you donated this much per year
              </Text>
              <Text size="xl" fw={800} c="var(--bm-text-dark)" mb={20}>
                NZ${donation.toLocaleString('en-NZ')}
              </Text>

              <Slider
                value={donation}
                onChange={setDonation}
                min={50}
                max={5000}
                step={50}
                color="sage"
                size="lg"
                marks={[
                  { value: 50, label: '$50' },
                  { value: 2500, label: '$2,500' },
                  { value: 5000, label: '$5,000' },
                ]}
                styles={{
                  markLabel: { color: 'var(--bm-text-muted)', fontSize: '0.75rem' },
                }}
              />

              <Text size="xs" c="dimmed" mt={16} mb={8}>
                Drag to adjust and watch the estimate update.
              </Text>

              <div className={classes.results}>
                <div className={classes.resultItem}>
                  <Text size="xs" c="dimmed" mb={4}>
                    You could claim back roughly
                  </Text>
                  <Group gap={8} align="baseline">
                    <IconCoin size={18} color="var(--bm-terracotta)" />
                    <Text size="xl" fw={800} c="var(--bm-terracotta)">
                      NZ${estimatedCredit.toLocaleString('en-NZ')}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>
                    Based on the maximum one-third credit rate.
                  </Text>
                </div>
              </div>

              {/* Bottom disclaimer */}
              <Box mt={20} pt={16} style={{ borderTop: '1px solid var(--bm-bg-cream)' }}>
                <Text size="xs" c="dimmed" lh={1.6} fs="italic">
                  This calculator is for illustration purposes only and does not
                  constitute tax advice. Please refer to the IRD website or consult
                  a tax professional for guidance on your specific situation.
                </Text>
              </Box>
            </div>
          </Box>
        </div>
      </Container>
    </section>
  );
}
