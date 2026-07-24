/**
 * Semantic version compare (major.minor.patch[+prerelease ignored for policy]).
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function parseSemver(input: string): [number, number, number] {
  const cleaned = input.trim().split(/[+-]/)[0] ?? '0.0.0';
  const parts = cleaned.split('.').map((p) => {
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export type VersionPolicyDecision =
  | { status: 'ok' }
  | { status: 'recommend_update' }
  | { status: 'force_update' };

export function evaluateVersionPolicy(input: {
  currentVersion: string;
  minimumSupportedVersion: string;
  recommendedVersion: string;
  forceUpdateEnabled: boolean;
}): VersionPolicyDecision {
  if (compareSemver(input.currentVersion, input.minimumSupportedVersion) < 0) {
    return { status: 'force_update' };
  }
  if (
    input.forceUpdateEnabled &&
    compareSemver(input.currentVersion, input.recommendedVersion) < 0
  ) {
    return { status: 'force_update' };
  }
  if (compareSemver(input.currentVersion, input.recommendedVersion) < 0) {
    return { status: 'recommend_update' };
  }
  return { status: 'ok' };
}
