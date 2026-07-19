'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Popover,
  Text,
  Group,
  Stack,
  TextInput,
  ActionIcon,
  Box,
  Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconShare2, IconCopy, IconCheck, IconQrcode } from '@tabler/icons-react';
import QRCode from 'qrcode';

interface ShareButtonProps {
  /** 공유할 URL. 생략 시 현재 페이지 URL 사용 */
  url?: string;
  /** 버튼에 표시할 라벨 */
  label?: string;
  size?: string;
  radius?: string;
  variant?: string;
  color?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * 기관/캠페인 페이지 공유 버튼 — 링크 복사 + QR 코드.
 * QR은 클라이언트에서 생성하므로 외부 서비스 의존이 없다.
 */
export function ShareButton({
  url,
  label = 'Share',
  size = 'lg',
  radius = 'xl',
  variant = 'outline',
  color = 'sage',
  fullWidth = false,
  className,
}: ShareButtonProps) {
  const [opened, setOpened] = useState(false);
  const [shareUrl, setShareUrl] = useState(url ?? '');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const clipboard = useClipboard({ timeout: 1500 });

  // 현재 페이지 URL은 클라이언트에서만 알 수 있다
  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [url]);

  // 팝오버가 열릴 때 QR 코드 생성
  useEffect(() => {
    if (opened && shareUrl && !qrDataUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 220,
        margin: 1,
        color: { dark: '#2d2a26', light: '#ffffff' },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }
  }, [opened, shareUrl, qrDataUrl]);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      shadow="lg"
      radius="lg"
      width={280}
      withArrow
    >
      <Popover.Target>
        <Button
          size={size}
          radius={radius}
          variant={variant}
          color={color}
          fullWidth={fullWidth}
          className={className}
          leftSection={<IconShare2 size={18} />}
          onClick={() => setOpened((o) => !o)}
        >
          {label}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={12}>
          <Group gap={6}>
            <IconQrcode size={16} color="var(--bm-sage-dark)" />
            <Text size="sm" fw={700} c="var(--bm-text-dark)">Share this page</Text>
          </Group>

          <Group gap={6} wrap="nowrap">
            <TextInput
              value={shareUrl}
              readOnly
              size="xs"
              radius="md"
              style={{ flex: 1 }}
              onFocus={(e) => e.currentTarget.select()}
            />
            <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy link'} withArrow>
              <ActionIcon
                size="lg"
                radius="md"
                color={clipboard.copied ? 'teal' : 'sage'}
                variant="light"
                onClick={() => clipboard.copy(shareUrl)}
              >
                {clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          {qrDataUrl && (
            <Box ta="center">
              {/* data URL 기반 QR — next/image 최적화 대상이 아님 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR code for this page"
                width={180}
                height={180}
                style={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }}
              />
              <Text size="xs" c="var(--bm-text-muted)" mt={4}>
                Scan to open on another device
              </Text>
            </Box>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
