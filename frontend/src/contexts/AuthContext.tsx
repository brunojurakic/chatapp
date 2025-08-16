import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  picture?: string;
  authenticated: boolean;
  username?: string | null;
  displayName?: string | null;
  themePreference?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem('jwt_token');
  
  const setToken = (token: string) => {
    localStorage.setItem('jwt_token', token);
    checkAuth();
  };

  const removeToken = () => {
    localStorage.removeItem('jwt_token');
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          name: userData.displayName || userData.name,
          email: userData.email,
          picture: userData.picture,
          authenticated: true,
          username: userData.username || null,
          displayName: userData.displayName || userData.name,
          themePreference: userData.themePreference || 'system',
        });
      } else {
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/google`;
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      removeToken();
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  setToken,
  refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
