'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface RedirectContext {
  url: string;
  context: 'generic' | 'checkout' | 'cart' | 'account' | 'protected-page';
  timestamp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
  setRedirectUrl: (url: string, context?: 'generic' | 'checkout' | 'cart' | 'account' | 'protected-page') => void;
  getRedirectUrl: () => string | null;
  getRedirectContext: () => RedirectContext | null;
  clearRedirectUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isAuthenticated');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        if (authStatus === 'true' && userEmail && userName) {
          setIsAuthenticated(true);
          setUser({ email: userEmail, name: userName });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (email: string, password: string): boolean => {
    // Simple authentication logic (in real app, this would be API call)
    if (email === 'user@joantees.com' && password === 'password123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'John Doe');
      }
      
      setIsAuthenticated(true);
      setUser({ email, name: 'John Doe' });
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('redirectUrl');
      localStorage.removeItem('redirectContext');
    }
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const setRedirectUrl = (url: string, context: 'generic' | 'checkout' | 'cart' | 'account' | 'protected-page' = 'generic') => {
    if (typeof window !== 'undefined') {
      const redirectContext: RedirectContext = {
        url,
        context,
        timestamp: Date.now()
      };
      localStorage.setItem('redirectUrl', url);
      localStorage.setItem('redirectContext', JSON.stringify(redirectContext));
    }
  };

  const getRedirectUrl = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redirectUrl');
    }
    return null;
  };

  const getRedirectContext = (): RedirectContext | null => {
    if (typeof window !== 'undefined') {
      const contextStr = localStorage.getItem('redirectContext');
      if (contextStr) {
        try {
          return JSON.parse(contextStr);
        } catch (error) {
          console.error('Error parsing redirect context:', error);
          return null;
        }
      }
    }
    return null;
  };

  const clearRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redirectUrl');
      localStorage.removeItem('redirectContext');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading, 
      setRedirectUrl, 
      getRedirectUrl, 
      getRedirectContext,
      clearRedirectUrl 
    }}>
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
