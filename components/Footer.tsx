'use client';

import { Container, Group, Text, Stack, Anchor, Divider, Box } from '@mantine/core';
import { IconLeaf, IconBrandInstagram, IconBrandFacebook, IconBrandLinkedin } from '@tabler/icons-react';
import classes from './Footer.module.css';

const footerLinks = {
  platform: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/about#how-it-works' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Help Centre', href: '/support' },
    { label: 'Contact Us', href: '/support#contact' },
    { label: 'FAQs', href: '/support#faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Cookie Policy', href: '/legal/cookies' },
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
              <IconLeaf size={24} color="var(--bm-terracotta)" />
              <Text fw={700} size="lg" c="white">
                Binding Minds
              </Text>
            </Group>
            <Text size="sm" c="rgba(255,255,255,0.6)" lh={1.7} maw={280}>
              Connecting hearts, empowering communities, and making giving effortless across New Zealand.
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
              Support
            </Text>
            <Stack gap={10}>
              {footerLinks.support.map((link) => (
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
            © {new Date().getFullYear()} Binding Minds. All rights reserved.
          </Text>
          <Text size="xs" c="rgba(255,255,255,0.4)">
            Made with ❤️ in Aotearoa, New Zealand
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
