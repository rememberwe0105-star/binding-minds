'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { auth, isConfigured } from '@/lib/firebase';

// --- 인터페이스 ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

// --- Context 생성 ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 실시간 감지
  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    // 동적 import로 Firebase Auth 함수 로드
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    });
  }, []);

  // 이메일/비밀번호 회원가입
  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Firebase not configured');
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
  };

  // 이메일/비밀번호 로그인
  const logIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 로그아웃
  const logOut = async () => {
    if (!auth) throw new Error('Firebase not configured');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  // Google 소셜 로그인
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const value: AuthContextType = {
    user,
    loading,
    isFirebaseConfigured: isConfigured,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- 커스텀 훅 ---
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
