/** Content schema markers for live-ops payloads. */
export const LIVEOPS_CONTENT_SCHEMA_VERSION = 1;

export const APPROVED_EXTERNAL_HOST_SUFFIXES = [
  'numberrush.app',
  'play.google.com',
  'apps.apple.com',
  'supabase.co',
] as const;

export function isApprovedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return APPROVED_EXTERNAL_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

const INTERNAL_ROUTES = new Set([
  'MainMenu',
  'Shop',
  'Missions',
  'Tournament',
  'Ranked',
  'Events',
  'News',
  'Settings',
  'Profile',
  'LegalInfo',
  'BetaFeedback',
  'Account',
]);

export function isApprovedInternalRoute(route: string): boolean {
  return INTERNAL_ROUTES.has(route);
}
