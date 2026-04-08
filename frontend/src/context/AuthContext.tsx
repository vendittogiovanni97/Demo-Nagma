"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setToken as saveToken, getToken, logout as clearAuth } from '@/utils/auth';
import { authService } from '@/services/auth.service';
import type { LoginCredentials } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(!!getToken());
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const newToken = response.token;

      saveToken(newToken);
      setIsAuthenticated(true);

      toast.success('Accesso effettuato!');
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenziali non valide';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
