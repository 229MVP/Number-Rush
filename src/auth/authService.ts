import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

import { trackEvent } from '../analytics/analyticsService';
import { accountDeletionEnabled } from '../config/featureFlags';
import { isProductionBuild } from '../config/environment';
import { isSupabaseConfigured } from '../config/supabaseEnvironment';
import { logger } from '../logging/logger';
import { getSupabaseClient } from '../backend/supabaseClient';
import type { AuthUser } from './authTypes';

const GUEST_FLAG_KEY = 'numberRush.auth.isGuest';

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}

function logAuthInfo(message: string, meta?: Record<string, unknown>): void {
  if (isProductionBuild()) {
    logger.info(message);
    return;
  }
  logger.info(message, meta);
}

export async function isGuestMode(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(GUEST_FLAG_KEY);
  return raw === 'true';
}

export async function setGuestMode(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(GUEST_FLAG_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
  }
}

export async function continueAsGuest(): Promise<void> {
  await setGuestMode(true);
  trackEvent('auth_guest_continued');
}

export function mapSessionUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    username: null,
  };
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    logger.warn('getSession failed', { message: error.message });
    return null;
  }
  return data.session;
}

export async function requestMagicLink(
  email: string,
  redirectTo?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'supabase_not_configured' };
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes('@')) {
    return { ok: false, error: 'invalid_email' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });

  if (error) {
    logger.warn('Magic link request failed', { message: error.message });
    return { ok: false, error: error.message };
  }

  logAuthInfo('Magic link requested');
  trackEvent('auth_magic_link_requested');
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.warn('signOut failed', { message: error.message });
    }
  }
  await setGuestMode(false);
  trackEvent('auth_signed_out');
}

export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'supabase_not_configured' };
  }
  if (!accountDeletionEnabled) {
    return { ok: false, error: 'feature_disabled' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'supabase_not_configured' };
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    logger.warn('delete-account invoke failed', { message: error.message });
    return { ok: false, error: error.message };
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload && payload.ok === false) {
    return { ok: false, error: payload.error ?? 'delete_failed' };
  }

  await signOut();
  trackEvent('auth_account_deleted');
  return { ok: true };
}
