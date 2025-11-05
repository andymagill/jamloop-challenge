'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Hardcoded user credentials for simulation
const VALID_USERS = {
  user_A: 'password_A',
  user_B: 'password_B',
} as const;

export type UserId = keyof typeof VALID_USERS;

interface AuthContextType {
  userId: UserId | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jamloop_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UserId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUserId && (storedUserId === 'user_A' || storedUserId === 'user_B')) {
      setUserId(storedUserId as UserId);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    // Check if credentials match
    if (username in VALID_USERS && VALID_USERS[username as UserId] === password) {
      const user = username as UserId;
      setUserId(user);
      localStorage.setItem(AUTH_STORAGE_KEY, user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        login,
        logout,
        isAuthenticated: userId !== null,
      }}
    >
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

// Helper function to get the active user ID (for use in data operations)
export function getActiveUserId(): UserId | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedUserId === 'user_A' || storedUserId === 'user_B') {
    return storedUserId as UserId;
  }
  return null;
}
