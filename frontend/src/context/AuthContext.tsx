"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getToken, getUser, setToken, setUser } from '@/utils/auth';
import { authService } from '@/services/auth.service';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import type { Role } from '@/types/team';
import { hasRequiredRole } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialToken = getToken();
  const [user, setCurrentUser] = useState<AuthUser | null>(() => getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!initialToken);
  const [isLoading, setIsLoading] = useState(() => !!initialToken);
  const router = useRouter();

  useEffect(() => {
    if (!initialToken) return;

    let isMounted = true;

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

    return () => {
      isMounted = false;
    };
  }, [initialToken]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      setCurrentUser(response.user);
      setIsAuthenticated(true);

      notifySuccess('Accesso effettuato!');
      router.push('/');
    } catch (error: unknown) {
      notifyError(error, 'Credenziali non valide');
      throw error;
    }
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push('/login');
  };

  const hasRole = (roles: Role | Role[]) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return hasRequiredRole(user?.role, allowedRoles);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
