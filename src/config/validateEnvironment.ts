import {
  getAppEnvironment,
  getPrivacyPolicyUrl,
  getTermsUrl,
  isProductionBuild,
} from './environment';
import { isSupabaseConfigured } from './supabaseEnvironment';
import {
  accountDeletionEnabled,
  cloudSyncEnabled,
  connectedEconomyEnabled,
  liveDailyLeaderboardEnabled,
  liveRankedEnabled,
} from './featureFlags';
import { logger } from '../logging/logger';

export type EnvironmentValidation = {
  ok: boolean;
  warnings: string[];
  errors: string[];
};

function connectedFeatureBlockers(): string[] {
  const blockers: string[] = [];
  if (!isSupabaseConfigured()) {
    blockers.push(
      'Supabase is not configured (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)',
    );
    return blockers;
  }
  if (!cloudSyncEnabled) {
    blockers.push('Cloud sync feature flag is disabled');
  }
  if (!liveDailyLeaderboardEnabled) {
    blockers.push('Live daily leaderboard feature flag is disabled');
  }
  if (!liveRankedEnabled) {
    blockers.push('Live ranked feature flag is disabled');
  }
  if (!connectedEconomyEnabled) {
    blockers.push('Connected economy feature flag is disabled');
  }
  if (!accountDeletionEnabled) {
    blockers.push('Account deletion feature flag is disabled');
  }
  return blockers;
}

/**
 * Development warns; production build config should fail for required missing values.
 * Local runtime always remains usable with safe defaults.
 */
export function validateEnvironment(): EnvironmentValidation {
  const env = getAppEnvironment();
  const warnings: string[] = [];
  const errors: string[] = [];

  if (env === 'production') {
    if (!getPrivacyPolicyUrl()) {
      errors.push('EXPO_PUBLIC_PRIVACY_POLICY_URL is required for production');
    }
    if (!getTermsUrl()) {
      errors.push('EXPO_PUBLIC_TERMS_URL is required for production');
    }
  } else {
    if (!getPrivacyPolicyUrl()) {
      warnings.push('Privacy policy URL not set (draft in-app content only)');
    }
    if (!getTermsUrl()) {
      warnings.push('Terms URL not set (draft in-app content only)');
    }
  }

  if (!isSupabaseConfigured()) {
    const supabaseWarning =
      'Supabase env vars missing — connected features run in local/guest mode';
    if (env === 'development') {
      warnings.push(supabaseWarning);
    } else {
      warnings.push(
        `${supabaseWarning} (connected-feature blocker; app still runs offline)`,
      );
      connectedFeatureBlockers().forEach((b) => {
        if (!warnings.includes(b)) warnings.push(b);
      });
    }
  } else if (env !== 'development') {
    connectedFeatureBlockers()
      .filter((b) => !b.startsWith('Supabase'))
      .forEach((b) => warnings.push(`${b} (connected-feature blocker)`));
  }

  if (env === 'development') {
    warnings.forEach((w) => logger.warn(w));
    errors.forEach((e) => logger.warn(e));
  } else if (!isProductionBuild()) {
    warnings.forEach((w) => logger.warn(w));
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
  };
}
