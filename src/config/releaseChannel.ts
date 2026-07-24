import { getAppEnvironment } from '../config/environment';

export type ReleaseChannel =
  | 'development'
  | 'preview'
  | 'closed-beta'
  | 'production';

/** Map EAS / env to a display release channel. */
export function getReleaseChannel(): ReleaseChannel {
  const explicit = process.env.EXPO_PUBLIC_RELEASE_CHANNEL?.trim().toLowerCase();
  if (
    explicit === 'development' ||
    explicit === 'preview' ||
    explicit === 'closed-beta' ||
    explicit === 'production'
  ) {
    return explicit;
  }
  const env = getAppEnvironment();
  if (env === 'production') return 'production';
  if (env === 'preview') return 'preview';
  return 'development';
}

export function shouldShowNonProductionBadge(channel: ReleaseChannel = getReleaseChannel()): boolean {
  return channel !== 'production';
}

export function getAppVersionLabel(): string {
  return process.env.EXPO_PUBLIC_APP_VERSION?.trim() || '1.0.0';
}
