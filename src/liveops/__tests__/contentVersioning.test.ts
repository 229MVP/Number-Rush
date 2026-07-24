import { isApprovedExternalUrl, isApprovedInternalRoute } from '../contentVersioning';

describe('contentVersioning', () => {
  it('allows https approved hosts only', () => {
    expect(isApprovedExternalUrl('https://play.google.com/store')).toBe(true);
    expect(isApprovedExternalUrl('http://play.google.com/store')).toBe(false);
    expect(isApprovedExternalUrl('https://evil.example/phish')).toBe(false);
  });

  it('allowlists internal routes', () => {
    expect(isApprovedInternalRoute('Events')).toBe(true);
    expect(isApprovedInternalRoute('javascript:alert(1)')).toBe(false);
  });
});
