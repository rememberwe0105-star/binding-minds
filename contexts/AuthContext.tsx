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

// ---------------------------------------------------------------------------
// Demo Role System — 환경변수로 제어되는 순수 프론트엔드 역할 시뮬레이션
// ---------------------------------------------------------------------------

/** 데모 역할 타입 — charity는 무료 플랜, charity_paid는 프리미엄 플랜 시연용 */
export type DemoRole = 'donor' | 'charity' | 'charity_paid' | 'admin' | null;

/** 단체 요금제 (데모 시연용 구분) */
export type CharityPlan = 'free' | 'paid';

/** 사용자 역할 (API 기반) */
export type UserRole = 'donor' | 'charity_admin' | 'platform_admin' | null;

/** 데모 모드가 활성화되어 있는지 (환경변수로 제어) */
export const DEMO_MODE_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  process.env.NODE_ENV === 'development';

/** 역할별 데모 프로필 (Firebase Auth 미사용 — 순수 프론트엔드 목업) */
const DEMO_PROFILES: Record<Exclude<DemoRole, null>, { name: string; email: string }> = {
  donor: {
    name: 'Aroha Demo (Donor)',
    email: 'aroha@demo.deargiver.co.nz',
  },
  charity: {
    name: 'Sarah Thompson (Charity — Community)',
    email: 'sarah@acmission.org.nz',
  },
  charity_paid: {
    name: 'Sarah Thompson (Charity — Growth)',
    email: 'sarah@acmission.org.nz',
  },
  admin: {
    name: 'Platform Admin',
    email: 'admin@deargiver.co.nz',
  },
};

/** 데모 역할 → API 역할 매핑 */
const DEMO_ROLE_MAP: Record<Exclude<DemoRole, null>, UserRole> = {
  donor: 'donor',
  charity: 'charity_admin',
  charity_paid: 'charity_admin',
  admin: 'platform_admin',
};

/**
 * 데모 역할 기준 단체 요금제.
 * 데모가 아니거나 단체 역할이 아니면 null — 실제 유저의 플랜은 백엔드 연동 후 serviceUser에서 결정.
 */
export function demoCharityPlan(demoRole: DemoRole): CharityPlan | null {
  if (demoRole === 'charity') return 'free';
  if (demoRole === 'charity_paid') return 'paid';
  return null;
}

// --- 인터페이스 ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  /** 서비스 DB에 등록된 사용자 정보 (null = 아직 미등록 또는 로그아웃 상태) */
  serviceUser: ServiceUser | null;
  /** 서비스 DB 등록 여부 (로딩 중에는 undefined) */
  isRegistered: boolean | undefined;
  /** 사용자 역할 (데모 역할 우선, 실제 역할 fallback) */
  userRole: UserRole;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  /** FE-002: 서비스 DB 등록 실패 복구 — 다시 등록을 시도한다. 성공 시 true. */
  retryRegistration: () => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  /** 현재 활성화된 데모 역할 (null = 데모 아님) */
  demoRole: DemoRole;
  /** 데모 역할 전환 (null로 설정하면 데모 세션 종료) */
  setDemoRole: (role: DemoRole) => void;
  /** 현재 표시할 사용자 이름 (데모 모드이면 데모 프로필, 아니면 실제 유저) */
  displayName: string;
  /** 현재 표시할 이메일 */
  displayEmail: string;
  /** 데모 모드가 활성화 가능한 환경인지 */
  isDemoModeEnabled: boolean;
}

// --- Context 생성 ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!isConfigured && !!auth);
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | undefined>(undefined);
  const [demoRole, setDemoRoleState] = useState<DemoRole>(null);

  // 데모 역할 전환
  const setDemoRole = (role: DemoRole) => {
    if (!DEMO_MODE_ENABLED && role !== null) {
      console.warn('[AuthContext] Demo mode is disabled in this environment.');
      return;
    }
    setDemoRoleState(role);
  };

  // 인증 상태 실시간 감지 + 서비스 DB 자동 등록
  useEffect(() => {
    if (!isConfigured || !auth) {
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
            // 미등록 → Firebase 프로필로 자동 등록 (FE-001: 실제 표시이름 우선, 이메일 앞부분 폴백은 최후)
            const email = firebaseUser.email ?? regResult.suggestedEmail ?? '';
            const name = firebaseUser.displayName ?? regResult.suggestedName ?? email.split('@')[0];

            try {
              // FE-010: 이메일은 토큰에서 백엔드가 확정 — name만 전달
              const registerResult = await postRegistration({ name });
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
    // FE-001: onAuthStateChanged 자동 등록은 updateProfile 이전에 실행되어 displayName이
    // 아직 비어 있는 레이스가 존재한다(→ 이메일 앞부분이 이름으로 저장됨). 실제 입력 이름으로
    // 여기서 즉시 등록해 정본을 확정한다. 이미 등록됐다면 백엔드가 멱등 처리/무시한다.
    try {
      const registerResult = await postRegistration({ name: displayName });
      setServiceUser(registerResult.user);
      setIsRegistered(true);
    } catch (registerErr) {
      // 실패해도 onAuthStateChanged 경로에서 재시도된다.
      console.error('[AuthContext] 회원가입 직후 등록 실패:', registerErr);
    }
  };

  // FE-002: 서비스 DB 등록 실패 복구 — 로그인 상태에서 등록을 재시도한다.
  const retryRegistration = async (): Promise<boolean> => {
    if (!auth?.currentUser) return false;
    try {
      // 이미 등록됐을 수도 있으므로 먼저 조회
      const regResult = await getRegistration();
      if (regResult.registered) {
        setServiceUser(regResult.user);
        setIsRegistered(true);
        return true;
      }
      const email = auth.currentUser.email ?? regResult.suggestedEmail ?? '';
      const name = auth.currentUser.displayName ?? regResult.suggestedName ?? email.split('@')[0];
      const registerResult = await postRegistration({ name });
      setServiceUser(registerResult.user);
      setIsRegistered(true);
      return true;
    } catch (err) {
      console.error('[AuthContext] 등록 재시도 실패:', err);
      setIsRegistered(false);
      return false;
    }
  };

  // 이메일/비밀번호 로그인
  const logIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 로그아웃
  const logOut = async () => {
    // 데모 모드이면 데모만 종료
    if (demoRole) {
      setDemoRoleState(null);
      return;
    }
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

  // 사용자 역할 결정 (데모 역할 > 실제 역할)
  const userRole: UserRole = demoRole
    ? DEMO_ROLE_MAP[demoRole]
    : (serviceUser?.role ?? null);

  // 표시할 이름/이메일 결정 (데모 역할 우선)
  const demoProfile = demoRole ? DEMO_PROFILES[demoRole] : null;
  const displayName = demoProfile?.name
    ?? user?.displayName
    ?? serviceUser?.name
    ?? 'User';
  const displayEmail = demoProfile?.email
    ?? user?.email
    ?? serviceUser?.email
    ?? '';

  const value: AuthContextType = {
    user,
    loading,
    isFirebaseConfigured: isConfigured,
    serviceUser,
    isRegistered,
    userRole,
    signUp,
    retryRegistration,
    logIn,
    logOut,
    signInWithGoogle,
    demoRole,
    setDemoRole,
    displayName,
    displayEmail,
    isDemoModeEnabled: DEMO_MODE_ENABLED,
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
