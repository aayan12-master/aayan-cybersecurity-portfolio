import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

const RATE_LIMIT_KEY = 'aayan_admin_rate_limit';
const MAX_LOGIN_ATTEMPTS = Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_DURATION_MS = Number(import.meta.env.VITE_LOCKOUT_DURATION_MS) || 900000; // 15 minutes

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

  const [isLockedOut, setIsLockedOut] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const limit = JSON.parse(stored);
        if (limit.lockedUntil && Date.now() < limit.lockedUntil) {
          return true;
        }
        localStorage.removeItem(RATE_LIMIT_KEY);
      }
    } catch { /* ignore */ }
    return false;
  });

  const [lockoutRemainingMs, setLockoutRemainingMs] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(MAX_LOGIN_ATTEMPTS);

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

  const incrementFailedAttempts = (): number => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      let count = 1;
      if (stored) {
        const limit = JSON.parse(stored);
        count = (limit.count || 0) + 1;
      }
      
      if (count >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count, lockedUntil }));
        setIsLockedOut(true);
        setLockoutRemainingMs(LOCKOUT_DURATION_MS);
        setRemainingAttempts(0);
        return -1; // Lockout triggered
      }

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count }));
      return count;
    } catch {
      return 1;
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Check rate limit lockout first
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const limit = JSON.parse(stored);
        if (limit.lockedUntil && Date.now() < limit.lockedUntil) {
          const remaining = limit.lockedUntil - Date.now();
          setLockoutRemainingMs(remaining);
          return { success: false, message: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60000)} minutes.` };
        }
        if (limit.lockedUntil && Date.now() >= limit.lockedUntil) {
          localStorage.removeItem(RATE_LIMIT_KEY);
        }
      }
    } catch { /* ignore */ }

    // Normalize email: map the legacy/convenient username 'aayan' to 'aayansayyad168@gmail.com'
    const email = username.includes('@') ? username.trim() : 'aayansayyad168@gmail.com';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const attempts = incrementFailedAttempts();
        if (attempts === -1) {
          return { success: false, message: `Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.` };
        }
        setRemainingAttempts(MAX_LOGIN_ATTEMPTS - attempts);
        return { success: false, message: error.message || 'Invalid credentials. Access denied.' };
      }

      if (data.session) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        setIsAuthenticated(true);
        setIsLockedOut(false);
        setLockoutRemainingMs(0);
        setRemainingAttempts(MAX_LOGIN_ATTEMPTS);
        return { success: true, message: '' };
      }

      return { success: false, message: 'Failed to establish session. Please try again.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'An unexpected authentication error occurred.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(RATE_LIMIT_KEY);
    setIsAuthenticated(false);
    setIsLockedOut(false);
    setLockoutRemainingMs(0);
    setRemainingAttempts(MAX_LOGIN_ATTEMPTS);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLockedOut, lockoutRemainingMs, remainingAttempts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};