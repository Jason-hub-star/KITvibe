/**
 * @file components/layout/RoleProvider.tsx
 * @description 역할 Context Provider — localStorage 기반 세션 유지
 * @domain shared
 * @access client
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserRole } from '@/types/common.types';

interface RoleContextValue {
  role: UserRole | null;
  userId: string | null;
  userName: string | null;
  isLoaded: boolean;
  setUser: (role: UserRole, userId: string, userName: string) => void;
  clearUser: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = 'pulda-user';

interface StoredUser {
  role: UserRole;
  userId: string;
  userName: string;
}

/** localStorage를 useSyncExternalStore로 안전하게 구독 (hydration mismatch 방지) */
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [hydrated, setHydrated] = useState(false);

  // 첫 클라이언트 렌더 이후 hydrated 표시
  if (!hydrated && typeof window !== 'undefined') {
    setHydrated(true);
  }

  const user: StoredUser | null = raw ? (() => {
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  })() : null;

  const setUser = useCallback((role: UserRole, userId: string, userName: string) => {
    const data: StoredUser = { role, userId, userName };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notifyListeners();
    } catch {
      // localStorage 접근 실패 — 무시
    }
  }, []);

  const clearUser = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyListeners();
    } catch {
      // localStorage 접근 실패 — 무시
    }
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role: user?.role ?? null,
        userId: user?.userId ?? null,
        userName: user?.userName ?? null,
        isLoaded: hydrated,
        setUser,
        clearUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return ctx;
}
