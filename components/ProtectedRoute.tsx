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
 * Firebase 미설정 시에는 데모 모드로 컨텐츠를 표시
 * 사용법: <ProtectedRoute><MyPage /></ProtectedRoute>
 */
export function ProtectedRoute({ children, fallbackUrl = '/auth' }: ProtectedRouteProps) {
  const { user, loading, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Firebase가 설정된 경우에만 리다이렉트
    if (!loading && !user && isFirebaseConfigured) {
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl, isFirebaseConfigured]);

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
