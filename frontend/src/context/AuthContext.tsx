"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setToken as saveToken, getToken, logout as clearAuth } from '@/utils/auth';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: any) => {
    try {
      const response: any = await authService.login(credentials);
      const newToken = response.token;
      
      saveToken(newToken);
      setToken(newToken);
      
      toast.success('Accesso effettuato!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Credenziali non valide');
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};
