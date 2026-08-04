import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { trackEvent } from '../analytics/analyticsService';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { getSupabaseClient } from '../backend/supabaseClient';
import { logger } from '../logging/logger';
import type { AuthStatus, AuthUser } from './authTypes';
import {
  continueAsGuest as persistGuest,
  deleteAccount as deleteAccountRequest,
  getSession,
  isGuestMode,
  mapSessionUser,
  requestMagicLink,
  setGuestMode,
  signOut as authSignOut,
} from './authService';

const INIT_TIMEOUT_MS = 3_000;

export type AuthContextValue = {
  session: Session | null;
  user: AuthUser | null;
  authStatus: AuthStatus;
  isGuest: boolean;
  isAuthenticated: boolean;
  initializing: boolean;
  signInWithMagicLink: (
    email: string,
    redirectTo?: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: true } | { ok: false; error: string }>;
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [isGuest, setIsGuest] = useState(false);
  const initDone = useRef(false);

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next) {
      await setGuestMode(false);
      setIsGuest(false);
      setAuthStatus('authenticated');
      trackEvent('auth_session_restored');
      return;
    }
    const guest = await isGuestMode();
    setIsGuest(guest);
    setAuthStatus(guest ? 'guest' : 'signed_out');
  }, []);

  const refreshSession = useCallback(async () => {
    const next = await getSession();
    await applySession(next);
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();

    const finishInit = async (next: Session | null) => {
      if (cancelled || initDone.current) return;
      initDone.current = true;
      await applySession(next);
    };

    const timeout = setTimeout(() => {
      if (initDone.current) return;
      if (!isSupabaseConfigured() || !supabase) {
        logger.warn('Auth init timeout — continuing as guest');
        void (async () => {
          await persistGuest();
          if (!cancelled) {
            initDone.current = true;
            setSession(null);
            setIsGuest(true);
            setAuthStatus('guest');
          }
        })();
      }
    }, INIT_TIMEOUT_MS);

    void (async () => {
      if (!supabase) {
        await persistGuest();
        if (!cancelled) {
          initDone.current = true;
          setIsGuest(true);
          setAuthStatus('guest');
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        clearTimeout(timeout);
        await finishInit(data.session);
      }
    })();

    if (!supabase) {
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void applySession(nextSession);
      },
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithMagicLink = useCallback(
    async (email: string, redirectTo?: string) => {
      const result = await requestMagicLink(email, redirectTo);
      if (result.ok) {
        trackEvent('auth_magic_link_sent');
      }
      return result;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setIsGuest(false);
    setAuthStatus('signed_out');
  }, []);

  const continueAsGuest = useCallback(async () => {
    await persistGuest();
    setSession(null);
    setIsGuest(true);
    setAuthStatus('guest');
  }, []);

  const deleteAccount = useCallback(async () => {
    const result = await deleteAccountRequest();
    if (result.ok) {
      setSession(null);
      setIsGuest(false);
      setAuthStatus('signed_out');
    }
    return result;
  }, []);

  const user = useMemo(() => mapSessionUser(session), [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      authStatus,
      isGuest,
      isAuthenticated: authStatus === 'authenticated' && session != null,
      initializing: authStatus === 'initializing',
      signInWithMagicLink,
      signOut,
      refreshSession,
      deleteAccount,
      continueAsGuest,
    }),
    [
      session,
      user,
      authStatus,
      isGuest,
      signInWithMagicLink,
      signOut,
      refreshSession,
      deleteAccount,
      continueAsGuest,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
