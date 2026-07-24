import { compareSemver, evaluateVersionPolicy } from '../versionPolicy';

describe('versionPolicy', () => {
  it('compares semver numerically (not lexicographically)', () => {
    expect(compareSemver('1.9.9', '1.10.0')).toBeLessThan(0);
    expect(compareSemver('1.10.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareSemver('2.0.0', '1.10.0')).toBeGreaterThan(0);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
  });

  it('forces update below minimum', () => {
    expect(
      evaluateVersionPolicy({
        currentVersion: '0.9.0',
        minimumSupportedVersion: '1.0.0',
        recommendedVersion: '1.1.0',
        forceUpdateEnabled: false,
      }).status,
    ).toBe('force_update');
  });

  it('recommends update between minimum and recommended', () => {
    expect(
      evaluateVersionPolicy({
        currentVersion: '1.0.0',
        minimumSupportedVersion: '1.0.0',
        recommendedVersion: '1.1.0',
        forceUpdateEnabled: false,
      }).status,
    ).toBe('recommend_update');
  });

  it('forceUpdateEnabled promotes recommended to force', () => {
    expect(
      evaluateVersionPolicy({
        currentVersion: '1.0.0',
        minimumSupportedVersion: '1.0.0',
        recommendedVersion: '1.1.0',
        forceUpdateEnabled: true,
      }).status,
    ).toBe('force_update');
  });
});
