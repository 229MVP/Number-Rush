import { getAppEnvironment, getPrivacyPolicyUrl, getTermsUrl } from './environment';
import { logger } from '../logging/logger';

export type EnvironmentValidation = {
  ok: boolean;
  warnings: string[];
  errors: string[];
};

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

  if (env === 'development') {
    warnings.forEach((w) => logger.warn(w));
    errors.forEach((e) => logger.warn(e));
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
  };
}
