"use client";

import { authService } from '@/services/auth.service';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import type { Role } from '@/types/team';
import { clearSession, getToken, getUser, setToken, setUser } from '@/utils/auth';
import {
  canManageCustomers,
  canManageFinance,
  canManageFormTemplates,
  canManageShifts,
  canManageStaff,
  canManageWhatsAppTemplates,
  canSendWhatsApp,
  hasRequiredRole,
} from '@/utils/permissions';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Permissions {
  manageCustomers: boolean;
  manageStaff: boolean;
  manageShifts: boolean;
  manageFinance: boolean;
  manageWhatsAppTemplates: boolean;
  sendWhatsApp: boolean;
  manageFormTemplates: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
  can: Permissions;
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

      // Re-valida il profilo dal server se abbiamo un token
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

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      setIsLoading(false);

      // Nota: Il toast verrà mostrato dal componente Login page che ha accesso a useToast
    } catch (error: unknown) {
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

  const can: Permissions = {
    manageCustomers: canManageCustomers(user?.role),
    manageStaff: canManageStaff(user?.role),
    manageShifts: canManageShifts(user?.role),
    manageFinance: canManageFinance(user?.role),
    manageWhatsAppTemplates: canManageWhatsAppTemplates(user?.role),
    sendWhatsApp: canSendWhatsApp(user?.role),
    manageFormTemplates: canManageFormTemplates(user?.role),
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, hasRole, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
}
