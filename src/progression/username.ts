/** Local username validation (no uniqueness / accounts). */

const USERNAME_PATTERN = /^[A-Za-z0-9 _]+$/;

export function validateUsername(raw: string): {
  ok: boolean;
  value: string;
  error?: string;
} {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (trimmed.length === 0) {
    return { ok: false, value: trimmed, error: 'Username cannot be empty' };
  }
  if (trimmed.length < 3) {
    return { ok: false, value: trimmed, error: 'At least 3 characters' };
  }
  if (trimmed.length > 16) {
    return { ok: false, value: trimmed, error: 'Maximum 16 characters' };
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return {
      ok: false,
      value: trimmed,
      error: 'Letters, numbers, spaces, underscores only',
    };
  }
  return { ok: true, value: trimmed };
}
