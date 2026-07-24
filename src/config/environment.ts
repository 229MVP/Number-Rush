export type AppEnvironment = 'development' | 'preview' | 'production';

function readEnv(): string {
  return (
    process.env.EXPO_PUBLIC_APP_ENV ??
    process.env.APP_ENV ??
    (__DEV__ ? 'development' : 'production')
  ).toLowerCase();
}

export function getAppEnvironment(): AppEnvironment {
  const raw = readEnv();
  if (raw === 'preview' || raw === 'staging') return 'preview';
  if (raw === 'production' || raw === 'prod') return 'production';
  return 'development';
}

export function isPreviewBuild(): boolean {
  return getAppEnvironment() === 'preview';
}

export function isProductionBuild(): boolean {
  return getAppEnvironment() === 'production';
}

export function isAnalyticsEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true') return true;
  return !isProductionBuild() && __DEV__;
}

export function isErrorReportingEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ERROR_REPORTING_ENABLED === 'true';
}

export function getPrivacyPolicyUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  return url && url.startsWith('http') ? url : null;
}

export function getTermsUrl(): string | null {
  const url = process.env.EXPO_PUBLIC_TERMS_URL;
  return url && url.startsWith('http') ? url : null;
}

export function getAppVersion(): string {
  return process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0';
}
