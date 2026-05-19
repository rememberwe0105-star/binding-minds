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
import {
  getRegistration,
  postRegistration,
  type ServiceUser,
} from '@/lib/api';

// --- 인터페이스 ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  /** 서비스 DB에 등록된 사용자 정보 (null = 아직 미등록 또는 로그아웃 상태) */
  serviceUser: ServiceUser | null;
  /** 서비스 DB 등록 여부 (로딩 중에는 undefined) */
  isRegistered: boolean | undefined;
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
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | undefined>(undefined);

  // 인증 상태 실시간 감지 + 서비스 DB 자동 등록
  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          // 로그아웃 시 초기화
          setServiceUser(null);
          setIsRegistered(undefined);
          setLoading(false);
          return;
        }

        // 로그인 감지 → 서비스 DB 등록 여부 확인
        try {
          const regResult = await getRegistration();

          if (regResult.registered) {
            setServiceUser(regResult.user);
            setIsRegistered(true);
          } else {
            // 미등록 → Firebase 프로필로 자동 등록
            const email = firebaseUser.email ?? regResult.suggestedEmail ?? '';
            const name = firebaseUser.displayName ?? regResult.suggestedName ?? email.split('@')[0];

            try {
              const registerResult = await postRegistration({ email, name });
              setServiceUser(registerResult.user);
              setIsRegistered(true);
            } catch (registerErr) {
              console.error('[AuthContext] 서비스 DB 등록 실패:', registerErr);
              // 등록 실패해도 Firebase 로그인은 유지 (기부 외 기능은 사용 가능)
              setIsRegistered(false);
              setServiceUser(null);
            }
          }
        } catch (err) {
          console.error('[AuthContext] 등록 여부 조회 실패:', err);
          setIsRegistered(false);
          setServiceUser(null);
        } finally {
          setLoading(false);
        }
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
    serviceUser,
    isRegistered,
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
