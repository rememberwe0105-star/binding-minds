'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * 보호 라우트 래퍼 컴포넌트
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 * 사용법: <ProtectedRoute><MyPage /></ProtectedRoute>
 */
export function ProtectedRoute({ children, fallbackUrl = '/auth' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl]);

  // 로딩 중
  if (loading) {
    return (
      <Center mih="60vh">
        <Loader color="sage" size="lg" />
      </Center>
    );
  }

  // 미인증 → 리다이렉트 중 (빈 화면)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
