'use client';

import { Container, Group, Text, Stack, Anchor, Divider, Box } from '@mantine/core';
import { IconBrandInstagram, IconBrandFacebook, IconBrandLinkedin } from '@tabler/icons-react';
import NextImage from 'next/image';
import classes from './Footer.module.css';

const footerLinks = {
  platform: [
    { label: 'About Us', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Charities', href: '/charities' },
  ],
  getInvolved: [
    { label: 'List Your Charity', href: '/charity/apply' },
    { label: 'Help Centre', href: '/support' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
  ],
};

export function Footer() {
  return (
    <footer className={classes.footer}>
      <Container size="xl">
        <div className={classes.grid}>
          {/* 브랜드 영역 */}
          <div className={classes.brand}>
            <Group gap={8} mb={16}>
              <NextImage
                src="/images/dg-logo-v2.png"
                alt="DearGiver"
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
              <Text fw={700} size="lg" c="white">
                DearGiver
              </Text>
            </Group>
            <Text size="sm" c="rgba(255,255,255,0.6)" lh={1.7} maw={280}>
              Every giver matters. Making generosity effortless across New Zealand.
            </Text>
            <Group gap={16} mt={20}>
              <Box className={classes.socialIcon}>
                <IconBrandInstagram size={20} />
              </Box>
              <Box className={classes.socialIcon}>
                <IconBrandFacebook size={20} />
              </Box>
              <Box className={classes.socialIcon}>
                <IconBrandLinkedin size={20} />
              </Box>
            </Group>
          </div>

          {/* 링크 그룹들 */}
          <div className={classes.linkGroup}>
            <Text fw={600} size="sm" c="white" mb={16} tt="uppercase" style={{ letterSpacing: '1px' }}>
              Platform
            </Text>
            <Stack gap={10}>
              {footerLinks.platform.map((link) => (
                <Anchor key={link.label} href={link.href} className={classes.link} underline="never">
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </div>

          <div className={classes.linkGroup}>
            <Text fw={600} size="sm" c="white" mb={16} tt="uppercase" style={{ letterSpacing: '1px' }}>
              Get Involved
            </Text>
            <Stack gap={10}>
              {footerLinks.getInvolved.map((link) => (
                <Anchor key={link.label} href={link.href} className={classes.link} underline="never">
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </div>

          <div className={classes.linkGroup}>
            <Text fw={600} size="sm" c="white" mb={16} tt="uppercase" style={{ letterSpacing: '1px' }}>
              Legal
            </Text>
            <Stack gap={10}>
              {footerLinks.legal.map((link) => (
                <Anchor key={link.label} href={link.href} className={classes.link} underline="never">
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </div>
        </div>

        <Divider color="rgba(255,255,255,0.1)" mt={48} mb={24} />

        <Group justify="space-between">
          <Text size="xs" c="rgba(255,255,255,0.4)">
            © {new Date().getFullYear()} DearGiver. All rights reserved.
          </Text>
          <Text size="xs" c="rgba(255,255,255,0.4)">
            Made with ❤️ in Aotearoa, New Zealand
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
