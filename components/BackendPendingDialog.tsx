'use client';

import { Modal, Text, Group, ThemeIcon, Badge, Box, Button, Stack, Divider } from '@mantine/core';
import { IconPlugX } from '@tabler/icons-react';
import type { BackendPendingError } from '@/lib/api';

// ============================================================
// 백엔드 연동 대기 안내 다이얼로그
//
// 게이트가 걸린 기능(gatedFetch)이 BackendPendingError를 던지면
// 이 다이얼로그로 "무슨 엔드포인트가 열리면 되는지"를 그대로 보여준다.
// 백엔드 팀이 사이트를 클릭해 보는 것만으로 남은 작업을 파악할 수 있고,
// 엔드포인트가 응답하는 순간 같은 버튼이 자동으로 실연동으로 동작한다.
// ============================================================

interface BackendPendingDialogProps {
  error: BackendPendingError | null;
  onClose: () => void;
  /** 다이얼로그를 닫은 뒤 데모 동작이 이어지는 경우 true (안내 문구 변경) */
  continuesWithDemo?: boolean;
}

export function BackendPendingDialog({ error, onClose, continuesWithDemo = false }: BackendPendingDialogProps) {
  return (
    <Modal
      opened={!!error}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      zIndex={400}
      overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
      title={
        <Group gap={8}>
          <ThemeIcon size={28} radius="xl" color="orange" variant="light">
            <IconPlugX size={16} />
          </ThemeIcon>
          <Text fw={700} c="var(--bm-text-dark)">Backend integration pending</Text>
        </Group>
      }
    >
      {error && (
        <Stack gap={12}>
          <Text size="sm" lh={1.7} c="var(--bm-text-dark)">
            <strong>백엔드 작업이 필요한 부분입니다.</strong> 프론트엔드 배선은 완료되어
            있으며, 아래 엔드포인트가 응답하기 시작하면 <strong>프론트 수정 없이 이
            버튼이 자동으로 실연동으로 전환</strong>됩니다.
          </Text>
          <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>
            This flow is fully wired on the frontend — it activates automatically as soon
            as the endpoint below starts responding.
          </Text>

          <Box p={12} style={{ background: '#22302b', borderRadius: 8 }}>
            <Text size="sm" ff="monospace" c="#e8efe9">{error.endpoint}</Text>
          </Box>

          <Group justify="space-between">
            <Badge variant="light" color="sage">{error.doc}</Badge>
            <Text size="xs" c="dimmed">{error.feature}</Text>
          </Group>

          <Divider />
          <Text size="xs" c="dimmed">
            {continuesWithDemo
              ? '지금은 샘플 데이터 기반 데모 동작으로 이어집니다.'
              : '엔드포인트가 준비되면 다시 시도해 주세요.'}
          </Text>
          <Button color="sage" radius="xl" onClick={onClose} fullWidth>
            OK
          </Button>
        </Stack>
      )}
    </Modal>
  );
}
