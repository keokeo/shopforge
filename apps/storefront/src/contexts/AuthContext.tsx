'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'shopforge-token';
const REFRESH_KEY = 'shopforge-refresh-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 恢复会话
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      authApi.me(savedToken)
        .then((userData: any) => setUser(userData))
        .catch(async () => {
          // access_token 可能过期，尝试 refresh
          const refreshToken = localStorage.getItem(REFRESH_KEY);
          if (refreshToken) {
            try {
              const res: any = await authApi.refresh(refreshToken);
              localStorage.setItem(TOKEN_KEY, res.access_token);
              localStorage.setItem(REFRESH_KEY, res.refresh_token);
              setToken(res.access_token);
              const userData = await authApi.me(res.access_token);
              setUser(userData as any);
            } catch {
              // refresh 也失败，清除登录态
              clearAuth();
            }
          } else {
            clearAuth();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setUser(null);
  };

  const login = useCallback(async (username: string, password: string) => {
    const res: any = await authApi.login(username, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(REFRESH_KEY, res.refresh_token);
    setToken(res.access_token);
    const userData: any = await authApi.me(res.access_token);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: { email: string; username: string; password: string }) => {
    await authApi.register(data);
    // 注册成功后自动登录
    await login(data.username, data.password);
  }, [login]);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
