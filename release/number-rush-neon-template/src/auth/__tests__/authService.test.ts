import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSignInWithOtp = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockInvoke = jest.fn();

jest.mock('../../backend/supabaseClient', () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
      getSession: mockGetSession,
    },
    functions: { invoke: mockInvoke },
  }),
}));

jest.mock('../../config/supabaseEnvironment', () => ({
  isSupabaseConfigured: () => true,
}));

jest.mock('../../config/featureFlags', () => ({
  accountDeletionEnabled: true,
}));

jest.mock('../../analytics/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

describe('authService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockSignOut.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('masks email for display', () => {
    const { maskEmail } = require('../authService') as typeof import('../authService');
    expect(maskEmail('player@example.com')).toBe('p***@example.com');
  });

  it('rejects invalid email for magic link', async () => {
    const { requestMagicLink } = require('../authService') as typeof import('../authService');
    const result = await requestMagicLink('not-an-email');
    expect(result).toEqual({ ok: false, error: 'invalid_email' });
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it('requests magic link with normalized email', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    const { requestMagicLink } = require('../authService') as typeof import('../authService');
    const result = await requestMagicLink(
      '  Player@Example.COM  ',
      'numberrush://auth/callback',
    );
    expect(result).toEqual({ ok: true });
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'player@example.com',
      options: { emailRedirectTo: 'numberrush://auth/callback' },
    });
  });

  it('tracks guest mode in storage', async () => {
    const {
      continueAsGuest,
      isGuestMode,
      setGuestMode,
    } = require('../authService') as typeof import('../authService');
    expect(await isGuestMode()).toBe(false);
    await continueAsGuest();
    expect(await isGuestMode()).toBe(true);
    await setGuestMode(false);
    expect(await isGuestMode()).toBe(false);
  });

  it('signOut clears guest flag', async () => {
    const {
      continueAsGuest,
      signOut,
      isGuestMode,
    } = require('../authService') as typeof import('../authService');
    await continueAsGuest();
    await signOut();
    expect(await isGuestMode()).toBe(false);
    expect(mockSignOut).toHaveBeenCalled();
  });
});
