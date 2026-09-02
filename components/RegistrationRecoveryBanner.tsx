'use client';

import { useState, useEffect } from 'react';
import { Notification, Button, Group, Text, Box } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * FE-002 — 서비스 DB 등록 실패 복구 배너.
 *
 * Firebase 로그인은 됐지만 서비스 DB 등록에 실패한 상태(isRegistered === false)에서만 노출된다.
 * 이 상태의 사용자는 기부/영수증 등 백엔드 기능을 쓸 수 없으므로, 조용히 실패시키지 않고
 * 재시도 버튼을 제공해 프로필 등록을 완료하도록 유도한다.
 */
export function RegistrationRecoveryBanner() {
  const { user, isRegistered, retryRegistration, isDemoModeEnabled, demoRole } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);
  // FE 5번: /me/* 호출이 412(failed-precondition)를 반환하면 배너를 강제 노출한다.
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const onNeedsProfile = () => { setForced(true); setDismissed(false); };
    window.addEventListener('dg:needs-profile-completion', onNeedsProfile);
    return () => window.removeEventListener('dg:needs-profile-completion', onNeedsProfile);
  }, []);

  // 데모 세션이거나, 로그인 안 했거나, 닫았으면 숨김.
  // 표시 조건: 서비스 DB 미등록(isRegistered===false) 또는 412 신호(forced)
  if (demoRole && isDemoModeEnabled) return null;
  if (!user || dismissed) return null;
  if (isRegistered !== false && !forced) return null;

  const handleRetry = async () => {
    setRetrying(true);
    setFailed(false);
    const ok = await retryRegistration();
    setRetrying(false);
    if (!ok) setFailed(true);
    else setForced(false);
    // 성공하면 isRegistered가 true로 바뀌고 forced도 해제되어 배너가 사라진다.
  };

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 2000,
        maxWidth: 380,
      }}
    >
      <Notification
        icon={<IconAlertTriangle size={20} />}
        color="orange"
        title="Finish setting up your account"
        onClose={() => setDismissed(true)}
        withBorder
      >
        <Text size="sm" c="dimmed" mb={10}>
          {failed
            ? 'We still couldn’t complete your registration. Please check your connection and try again.'
            : 'Your sign-in worked, but your Dear Giver profile isn’t fully set up yet. Donations and receipts need this step.'}
        </Text>
        <Group gap={8}>
          <Button size="xs" color="orange" onClick={handleRetry} loading={retrying}>
            {failed ? 'Try again' : 'Complete setup'}
          </Button>
          <Button size="xs" variant="subtle" color="gray" onClick={() => setDismissed(true)}>
            Later
          </Button>
        </Group>
      </Notification>
    </Box>
  );
}
