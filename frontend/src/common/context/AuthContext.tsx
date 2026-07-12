"use client";

import { authService } from '@/modules/auth/api/auth.api';
import type { AuthUser, LoginCredentials } from '@/modules/auth/model/auth.types';
import { clearSession, getToken, getUser, setToken, setUser } from '@/common/shared/utils/auth';
import { isAdmin, isSuperAdmin } from '@/common/config/roles';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const savedUser = getUser();
    let isMounted = true;

    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        setCurrentUser(savedUser);
      }

      const loadProfile = async () => {
        try {
          const profile = await authService.me();
          if (!isMounted) return;
          setUser(profile);
          setCurrentUser(profile);
          setIsAuthenticated(true);
        } catch {
          if (!isMounted) return;
          clearSession();
          setCurrentUser(null);
          setIsAuthenticated(false);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      void loadProfile();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error: unknown) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push('/login');
  }, [router]);

  // Memoize role computations to avoid unnecessary recalculations
  const isAdminMemo = useMemo(() => isAdmin(user?.role), [user?.role]);
  const isSuperAdminMemo = useMemo(() => isSuperAdmin(user?.role), [user?.role]);

  // Memoize context value to prevent full app re-renders on every render
  // This is critical for performance: without memoization, a new object is created each render,
  // triggering subscriber re-renders even if the values haven't changed
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      isAdmin: isAdminMemo,
      isSuperAdmin: isSuperAdminMemo,
    }),
    [isAuthenticated, isLoading, user, login, logout, isAdminMemo, isSuperAdminMemo]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
