/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, authToken, storeApi } from '@/lib/api';
import type { Profile } from '@/types/database';

interface StoreUser { id: string; email: string; }
interface StoreSession { access_token: string; user: StoreUser; }

interface AuthContextValue {
  session: StoreSession | null;
  user: StoreUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (displayName: string, phone: string) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoreSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((token: string, nextProfile: Profile) => {
    setProfile(nextProfile);
    setSession({ access_token: token, user: { id: nextProfile.id, email: nextProfile.email } });
  }, []);

  const clearAuth = useCallback(() => {
    authToken.clear();
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = authToken.get();
    if (!token) return;
    const nextProfile = await storeApi.auth.profile();
    applyAuth(authToken.get() ?? token, nextProfile);
  }, [applyAuth]);

  useEffect(() => {
    let active = true;
    const token = authToken.get();
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }
    storeApi.auth.profile()
      .then((nextProfile) => { if (active) applyAuth(authToken.get() ?? token, nextProfile); })
      .catch(() => { if (active) clearAuth(); })
      .finally(() => { if (active) setLoading(false); });
    const unauthorized = () => { if (active) clearAuth(); };
    window.addEventListener('bookstore:unauthorized', unauthorized);
    return () => {
      active = false;
      window.removeEventListener('bookstore:unauthorized', unauthorized);
    };
  }, [applyAuth, clearAuth]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      const result = await storeApi.auth.register(email, password, displayName);
      applyAuth(result.token, result.profile);
      return { error: null };
    } catch (error) {
      return { error: translateAuthError(error) };
    }
  }, [applyAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await storeApi.auth.login(email, password);
      applyAuth(result.token, result.profile);
      return { error: null };
    } catch (error) {
      return { error: translateAuthError(error) };
    }
  }, [applyAuth]);

  const signOut = useCallback(async () => {
    try { await storeApi.auth.logout(); }
    finally { clearAuth(); }
  }, [clearAuth]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await storeApi.auth.forgotPassword(email);
      return { error: null };
    } catch (error) {
      return { error: translateAuthError(error) };
    }
  }, []);

  const updateProfile = useCallback(async (displayName: string, phone: string) => {
    const nextProfile = await storeApi.auth.updateProfile(displayName, phone);
    const token = authToken.get();
    if (token) applyAuth(token, nextProfile);
    return nextProfile;
  }, [applyAuth]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
    updateProfile,
  }), [session, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function translateAuthError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'تعذّر الاتصال بالخادم';
  const map: Record<string, string> = {
    'Invalid email or password.': 'بيانات الدخول غير صحيحة',
    'This email address is already registered.': 'هذا البريد الإلكتروني مسجل بالفعل',
  };
  return map[error.message] || error.message;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
