'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { useAuth, type DemoRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
  /** 이 페이지에 접근 가능한 데모 역할 (지정하지 않으면 모든 역할 허용) */
  allowedDemoRoles?: DemoRole[];
}

/**
 * 보호 라우트 래퍼 컴포넌트
 * - 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 * - Firebase 미설정 시에는 데모 모드로 컨텐츠를 표시
 * - 데모 역할이 활성화된 경우 인증 없이 컨텐츠 표시
 */
export function ProtectedRoute({ children, fallbackUrl = '/auth', allowedDemoRoles }: ProtectedRouteProps) {
  const { user, loading, isFirebaseConfigured, demoRole } = useAuth();
  const router = useRouter();

  // 데모 역할이 활성화되어 있으면 인증 없이 통과
  const isDemoAccess = demoRole !== null && (
    !allowedDemoRoles || allowedDemoRoles.includes(demoRole)
  );

  useEffect(() => {
    // 데모 역할이면 리다이렉트 안 함
    if (isDemoAccess) return;

    // Firebase가 설정된 경우에만 리다이렉트
    if (!loading && !user && isFirebaseConfigured) {
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl, isFirebaseConfigured, isDemoAccess]);

  // 데모 역할 → 바로 표시
  if (isDemoAccess) {
    return <>{children}</>;
  }

  // 로딩 중
  if (loading) {
    return (
      <Center mih="60vh">
        <Loader color="sage" size="lg" />
      </Center>
    );
  }

  // Firebase 미설정 → 데모 모드 (컨텐츠 그대로 표시)
  if (!isFirebaseConfigured) {
    return <>{children}</>;
  }

  // 미인증 → 리다이렉트 중 (빈 화면)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
