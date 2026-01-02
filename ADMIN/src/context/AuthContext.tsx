import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, API_URL } from '../services/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAdmin();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAdmin = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.role === 'admin') {
          setAdmin(data.user);
        } else {
          setError('Akses ditolak. Hanya admin yang diperbolehkan.');
          logout();
        }
      } else if (response.status === 401) {
        logout();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Gagal memuat data admin');
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch admin:', err);
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    if (data.user.role !== 'admin') {
      throw new Error('Akses ditolak. Hanya admin yang diperbolehkan.');
    }

    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setAdmin(data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
