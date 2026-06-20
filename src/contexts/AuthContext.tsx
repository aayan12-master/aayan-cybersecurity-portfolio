import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'aayan';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD_HASH || 'AayanAdmin@2026';
const AUTH_KEY = 'aayan_admin_auth';
const RATE_LIMIT_KEY = 'aayan_admin_rate_limit';
const SESSION_DURATION_MS = Number(import.meta.env.VITE_SESSION_DURATION_MS) || 86400000; // 24 hours
const MAX_LOGIN_ATTEMPTS = Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_DURATION_MS = Number(import.meta.env.VITE_LOCKOUT_DURATION_MS) || 900000; // 15 minutes

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isLockedOut: boolean;
  lockoutRemainingMs: number;
  remainingAttempts: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.expires && Date.now() < session.expires) {
          return true;
        }
        localStorage.removeItem(AUTH_KEY);
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

  const login = (username: string, password: string): { success: boolean; message: string } => {
    // Check if currently locked out
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

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        authenticated: true,
        expires: Date.now() + SESSION_DURATION_MS,
      }));
      localStorage.removeItem(RATE_LIMIT_KEY);
      setIsAuthenticated(true);
      setIsLockedOut(false);
      setLockoutRemainingMs(0);
      setRemainingAttempts(MAX_LOGIN_ATTEMPTS);

      // Authenticate with Supabase Auth in the background to acquire RLS session token
      const email = 'aayansayyad168@gmail.com';
      supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
        if (error) {
          console.warn('Supabase Auth sign-in failed. Attempting auto-registration...', error.message);
          if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
            supabase.auth.signUp({ email, password }).then(({ error: signUpError }) => {
              if (signUpError) {
                console.error('Supabase Auth auto-signup failed (likely user exists with a different password):', signUpError.message);
              } else {
                console.log('Supabase Auth admin user signed up. Authenticating...');
                supabase.auth.signInWithPassword({ email, password }).then(({ error: signInAgainError }) => {
                  if (signInAgainError) {
                    console.error('Supabase Auth sign-in after signup failed:', signInAgainError.message);
                  } else {
                    console.log('Successfully authenticated with Supabase Auth after signup.');
                  }
                });
              }
            });
          }
        } else {
          console.log('Successfully authenticated with Supabase Auth. Session established:', !!data.session);
        }
      });

      return { success: true, message: '' };
    }

    // Failed attempt — increment counter
    const attempts = (() => {
      try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        if (stored) {
          const limit = JSON.parse(stored);
          const newCount = (limit.count || 0) + 1;
          if (newCount >= MAX_LOGIN_ATTEMPTS) {
            const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: newCount, lockedUntil }));
            setIsLockedOut(true);
            setLockoutRemainingMs(LOCKOUT_DURATION_MS);
            setRemainingAttempts(0);
            return -1; // sentinel: lockout triggered
          }
          localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: newCount }));
          return newCount;
        }
      } catch { /* ignore */ }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1 }));
      return 1;
    })();

    if (attempts === -1) {
      return { success: false, message: `Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.` };
    }

    setRemainingAttempts(MAX_LOGIN_ATTEMPTS - attempts);
    return { success: false, message: 'Invalid credentials. Access denied.' };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(RATE_LIMIT_KEY);
    setIsAuthenticated(false);
    setIsLockedOut(false);
    setLockoutRemainingMs(0);
    setRemainingAttempts(MAX_LOGIN_ATTEMPTS);
    supabase.auth.signOut(); // Clear Supabase Auth session token
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