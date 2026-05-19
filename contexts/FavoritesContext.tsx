'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// --- 타입 ---
export type FavoriteType = 'project' | 'organization';

interface FavoritesState {
  projects: string[];
  organizations: string[];
}

interface FavoritesContextType {
  favorites: FavoritesState;
  toggleFavorite: (type: FavoriteType, id: string) => void;
  isFavorite: (type: FavoriteType, id: string) => boolean;
  getFavoriteCount: () => number;
  getFavoritesByType: (type: FavoriteType) => string[];
  clearAll: () => void;
}

const STORAGE_KEY = 'bm-favorites';

const defaultState: FavoritesState = {
  projects: [],
  organizations: [],
};

// --- Context ---
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// --- localStorage 헬퍼 ---
// NOTE: 나중에 Firestore로 마이그레이션할 때 이 두 함수만 교체하면 됩니다
function loadFromStorage(): FavoritesState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      organizations: Array.isArray(parsed.organizations) ? parsed.organizations : [],
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: FavoritesState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage 용량 초과 등 에러 무시
  }
}

// --- Provider ---
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritesState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트 hydration 시 localStorage에서 로드
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(loadFromStorage());
    setHydrated(true);
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    if (hydrated) {
      saveToStorage(favorites);
    }
  }, [favorites, hydrated]);

  const toggleFavorite = useCallback((type: FavoriteType, id: string) => {
    setFavorites((prev) => {
      const key = type === 'project' ? 'projects' : 'organizations';
      const list = prev[key];
      const isCurrentlyFav = list.includes(id);

      return {
        ...prev,
        [key]: isCurrentlyFav
          ? list.filter((item) => item !== id)
          : [...list, id],
      };
    });
  }, []);

  const isFavorite = useCallback(
    (type: FavoriteType, id: string): boolean => {
      const key = type === 'project' ? 'projects' : 'organizations';
      return favorites[key].includes(id);
    },
    [favorites]
  );

  const getFavoriteCount = useCallback((): number => {
    return favorites.projects.length + favorites.organizations.length;
  }, [favorites]);

  const getFavoritesByType = useCallback(
    (type: FavoriteType): string[] => {
      return type === 'project' ? favorites.projects : favorites.organizations;
    },
    [favorites]
  );

  const clearAll = useCallback(() => {
    setFavorites(defaultState);
  }, []);

  const value: FavoritesContextType = {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    getFavoritesByType,
    clearAll,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// --- 커스텀 훅 ---
export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
