import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { authApi } from '../services/api';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthGuardContextType {
  user: AdminUser;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export function useAdminUser() {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) throw new Error('useAdminUser must be used within AuthGuard');
  return ctx.user;
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    authApi.me()
      .then((data: any) => {
        if (!data.is_admin) {
          message.error('需要管理员权限');
          localStorage.removeItem('admin_token');
          navigate('/login', { replace: true });
          return;
        }
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        navigate('/login', { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Spin size="large" tip="验证身份中..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AuthGuardContext.Provider value={{ user }}>
      {children}
    </AuthGuardContext.Provider>
  );
}
