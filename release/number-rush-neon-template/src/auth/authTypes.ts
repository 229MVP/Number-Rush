export type AuthStatus =
  | 'initializing'
  | 'guest'
  | 'authenticated'
  | 'signed_out';

export type AuthUser = {
  id: string;
  email: string | null;
  /** Display username when synced from cloud profile. */
  username: string | null;
};
