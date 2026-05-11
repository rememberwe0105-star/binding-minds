'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Box,
  Divider,
  Group,
  Anchor,
  Alert,
} from '@mantine/core';
import { IconLeaf, IconBrandGoogle, IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import classes from './page.module.css';

type AuthMode = 'login' | 'signup';

// Firebase 에러 코드 → 사용자 친화적 메시지
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { logIn, signUp, signInWithGoogle, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);
      } else {
        await logIn(email, password);
      }
      router.push('/');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getErrorMessage(firebaseError.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getErrorMessage(firebaseError.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        {/* 배경 블롭 장식 */}
        <div className={classes.blobLeft} />
        <div className={classes.blobRight} />

        <Container size="xs" className={classes.container}>
          <Box className={classes.card}>
            {/* 로고 + 타이틀 */}
            <Group justify="center" mb={8}>
              <IconLeaf size={32} color="var(--bm-terracotta)" stroke={2} />
            </Group>
            <Title order={2} ta="center" className={classes.title}>
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </Title>
            <Text ta="center" c="var(--bm-text-muted)" size="sm" mb={28}>
              {mode === 'login'
                ? 'Sign in to manage your donations and track your impact.'
                : 'Join Binding Minds and start making a difference today.'}
            </Text>

            {/* Google 로그인 */}
            <Button
              fullWidth
              variant="outline"
              color="dark"
              size="md"
              radius="xl"
              leftSection={<IconBrandGoogle size={20} />}
              onClick={handleGoogleSignIn}
              loading={loading}
              className={classes.googleBtn}
            >
              Continue with Google
            </Button>

            <Divider
              label="or continue with email"
              labelPosition="center"
              my={24}
              color="rgba(143, 151, 121, 0.2)"
            />

            {/* Firebase 미설정 안내 */}
            {!isFirebaseConfigured && (
              <Alert
                color="yellow"
                variant="light"
                radius="md"
                mb={16}
              >
                <Text size="xs" fw={500}>🔧 Firebase not configured</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Copy <code>.env.local.example</code> to <code>.env.local</code> and add your Firebase credentials to enable authentication.
                </Text>
              </Alert>
            )}

            {/* 에러 메시지 */}
            {error && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                variant="light"
                radius="md"
                mb={16}
                withCloseButton
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* 폼 */}
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <TextInput
                  label="Full Name"
                  placeholder="e.g. Aroha Smith"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.currentTarget.value)}
                  size="md"
                  radius="md"
                  mb={12}
                  required
                />
              )}

              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                size="md"
                radius="md"
                mb={12}
                required
              />

              <PasswordInput
                label="Password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                size="md"
                radius="md"
                mb={mode === 'login' ? 8 : 20}
                required
              />

              {mode === 'login' && (
                <Text ta="right" size="xs" mb={20}>
                  <Anchor c="var(--bm-terracotta)" size="xs">
                    Forgot password?
                  </Anchor>
                </Text>
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                radius="xl"
                color="terracotta"
                loading={loading}
                className={classes.submitBtn}
              >
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </Button>
            </form>

            {/* 모드 전환 */}
            <Text ta="center" size="sm" mt={24} c="var(--bm-text-muted)">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Anchor
                component="button"
                type="button"
                fw={600}
                c="var(--bm-terracotta)"
                onClick={toggleMode}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Anchor>
            </Text>
          </Box>
        </Container>
      </main>
      <Footer />
    </>
  );
}
