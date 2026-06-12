import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (email: string, name: string, passwordHash: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on load
    const session = api.auth.getCurrentUser();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, passwordHash: string) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, passwordHash);
      setUser(response.user);
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, passwordHash: string) => {
    setLoading(true);
    try {
      await api.auth.register(email, name, passwordHash);
      // Automatically log in after registration
      const response = await api.auth.login(email, passwordHash);
      setUser(response.user);
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!token;
  const isAdmin = !!user?.isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
