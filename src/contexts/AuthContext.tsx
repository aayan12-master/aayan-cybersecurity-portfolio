import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLockedOut: boolean;
  lockoutRemainingMs: number;
  remainingAttempts: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const keys = Object.keys(localStorage);
      const supabaseKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (supabaseKey) {
        const stored = localStorage.getItem(supabaseKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.currentSession) {
            return true;
          }
        }
      }
    } catch { /* ignore */ }
    return false;
  });

  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutRemainingMs, setLockoutRemainingMs] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5);

  // Sync auth state with Supabase session shifts dynamically
  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Normalize email: map the legacy/convenient username 'aayan' to 'aayansayyad168@gmail.com'
    const email = username.includes('@') ? username.trim() : 'aayansayyad168@gmail.com';

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setIsLockedOut(true);
          setLockoutRemainingMs(15 * 60 * 1000); // UI fallback, server remains authoritative
          setRemainingAttempts(0);
          return { success: false, message: 'Too many login attempts. Please try again later.' };
        }
        
        if (response.status === 401) {
          return { success: false, message: 'Invalid username or password.' };
        }
        
        return { success: false, message: data.error || 'Authentication failed.' };
      }

      // Success
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        setIsAuthenticated(true);
        setIsLockedOut(false);
        setLockoutRemainingMs(0);
        setRemainingAttempts(5);
        return { success: true, message: '' };
      }

      return { success: false, message: 'Failed to establish session. Please try again.' };
    } catch (err: any) {
      return { success: false, message: 'Unable to reach authentication service.' };
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setIsLockedOut(false);
    setLockoutRemainingMs(0);
    setRemainingAttempts(5);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLockedOut, lockoutRemainingMs, remainingAttempts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};