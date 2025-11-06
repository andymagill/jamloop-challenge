'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Hardcoded user credentials for simulation
const VALID_USERS = {
  user_A: 'password_A',
  user_B: 'password_B',
} as const;

export type UserId = keyof typeof VALID_USERS;

interface AuthContextType {
  userId: UserId | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jamloop_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UserId | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUserId && (storedUserId === 'user_A' || storedUserId === 'user_B')) {
      return storedUserId as UserId;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Note: Resource ID initialization moved to dashboard page
  // This keeps login fast and initializes resources when actually needed

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if credentials match
      if (username in VALID_USERS && VALID_USERS[username as UserId] === password) {
        const user = username as UserId;
        
        // Just authenticate - resource ID will be initialized on dashboard
        setUserId(user);
        localStorage.setItem(AUTH_STORAGE_KEY, user);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Note: We intentionally keep the resource ID in localStorage
    // so it can be reused on next login if not expired
    // This reduces unnecessary API calls to CrudCrud
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        login,
        logout,
        isAuthenticated: userId !== null,
        isLoading,
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
