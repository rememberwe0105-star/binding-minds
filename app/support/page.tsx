'use client';

import {
  Container,
  Title,
  Text,
  Accordion,
  TextInput,
  Textarea,
  Button,
  Box,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
} from '@mantine/core';
import {
  IconLeaf,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

const faqs = [
  {
    q: 'How does DearGiver work?',
    a: 'DearGiver connects you with verified charities across New Zealand. Browse campaigns, donate securely via Stripe, and we automatically generate your tax receipts for the 33.33% donation tax credit.',
  },
  {
    q: 'Is my donation tax deductible?',
    a: 'Yes! Donations to approved organisations in New Zealand qualify for a 33.33% tax credit. DearGiver automatically consolidates your receipts to make claiming easy.',
  },
  {
    q: 'How do I know the charities are legitimate?',
    a: 'All organisations on our platform are verified and registered with New Zealand\'s Charities Services (charities.govt.nz). We perform ongoing checks to ensure compliance.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Visa, Mastercard, and American Express through our secure payment partner Stripe. Bank transfer (direct debit) support is coming soon.',
  },
  {
    q: 'Can I set up recurring donations?',
    a: 'Recurring donation support is on our roadmap and will be available in an upcoming release. For now, you can donate as often as you like with one-time payments.',
  },
  {
    q: 'How do I get my tax refund receipt?',
    a: 'Log in to your dashboard at the end of the financial year. We consolidate all your donation receipts into a single downloadable summary that you can submit with your tax return.',
  },
];

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* Hero */}
        <section className={classes.heroSection}>
          <Container size="lg">
            <Group gap={8} mb={12}>
              <IconLeaf size={22} color="var(--bm-terracotta)" />
              <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" style={{ letterSpacing: '1.5px' }}>
                Support
              </Text>
            </Group>
            <Title order={1} className={classes.heroTitle}>
              How Can We Help?
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={500} mt={12}>
              Find answers to common questions or get in touch with our team.
            </Text>
          </Container>
        </section>

        {/* FAQ */}
        <section className={classes.section} id="faq">
          <Container size="md">
            <Title order={2} className={classes.sectionTitle} mb={24}>
              Frequently Asked Questions
            </Title>

            <Accordion
              variant="separated"
              radius="md"
              defaultValue="item-0"
              classNames={{ item: classes.accordionItem }}
            >
              {faqs.map((faq, i) => (
                <Accordion.Item key={i} value={`item-${i}`}>
                  <Accordion.Control>
                    <Text fw={600} size="sm">{faq.q}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text size="sm" c="var(--bm-text-muted)" lh={1.7}>{faq.a}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </section>

        {/* Contact */}
        <section className={classes.section} id="contact" style={{ background: 'white' }}>
          <Container size="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={48}>
              {/* 연락처 */}
              <Box>
                <Title order={2} className={classes.sectionTitle} mb={24}>
                  Get In Touch
                </Title>
                <Text size="md" c="var(--bm-text-muted)" lh={1.7} mb={32}>
                  Can&apos;t find what you&apos;re looking for? Our team is here to help.
                </Text>

                <Box mb={20}>
                  <Group gap={12} mb={8}>
                    <ThemeIcon size={32} radius="md" color="sage" variant="light">
                      <IconMail size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Email</Text>
                  </Group>
                  <Text size="sm" c="var(--bm-text-muted)" ml={44}>hello@deargiver.co.nz</Text>
                </Box>

                <Box mb={20}>
                  <Group gap={12} mb={8}>
                    <ThemeIcon size={32} radius="md" color="sage" variant="light">
                      <IconPhone size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Phone</Text>
                  </Group>
                  <Text size="sm" c="var(--bm-text-muted)" ml={44}>+64 9 123 4567</Text>
                </Box>

                <Box>
                  <Group gap={12} mb={8}>
                    <ThemeIcon size={32} radius="md" color="sage" variant="light">
                      <IconMapPin size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="var(--bm-text-dark)">Address</Text>
                  </Group>
                  <Text size="sm" c="var(--bm-text-muted)" ml={44}>Auckland, New Zealand</Text>
                </Box>
              </Box>

              {/* 폼 */}
              <Card padding="xl" radius="lg" withBorder className={classes.contactCard}>
                <Text fw={700} size="lg" c="var(--bm-text-dark)" mb={20}>
                  Send Us a Message
                </Text>
                <form>
                  <TextInput label="Name" placeholder="Your name" radius="md" mb={12} required />
                  <TextInput label="Email" placeholder="you@example.com" type="email" radius="md" mb={12} required />
                  <Textarea label="Message" placeholder="How can we help?" radius="md" mb={20} minRows={4} required />
                  <Button type="submit" color="terracotta" radius="xl" fullWidth>
                    Send Message
                  </Button>
                </form>
              </Card>
            </SimpleGrid>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
