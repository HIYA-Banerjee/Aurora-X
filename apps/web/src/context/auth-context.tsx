'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToastStore } from '../store/toast-store';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetchProfile = async () => {
    try {
      const userProfile = (await api.get('/api/v1/auth/me')) as any;
      setUser(userProfile);
    } catch {
      // Clean up session if profile call fails
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = (await api.post('/api/v1/auth/login', { email, password })) as any;
      localStorage.setItem('accessToken', res.accessToken);
      await fetchProfile();
      addToast({
        title: 'Welcome Back!',
        description: 'Successfully authenticated.',
        type: 'success',
      });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Invalid email or password';
      addToast({
        title: 'Authentication Failed',
        description: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      await api.post('/api/v1/auth/register', { email, password, displayName });
      // Auto login after registration
      const loginRes = (await api.post('/api/v1/auth/login', { email, password })) as any;
      localStorage.setItem('accessToken', loginRes.accessToken);
      await fetchProfile();
      addToast({
        title: 'Registration Successful',
        description: 'Your account was created successfully.',
        type: 'success',
      });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Could not create account';
      addToast({
        title: 'Registration Failed',
        description: msg,
        type: 'error',
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Ignore API logout error and clear local storage session anyway
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      addToast({
        title: 'Logged Out',
        description: 'Your session has ended.',
        type: 'info',
      });
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export const useUser = () => useAuth().user;
