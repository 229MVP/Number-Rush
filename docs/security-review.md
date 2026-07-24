# Number Rush — Security Review (Local-Only Beta)

**Scope:** Client app with AsyncStorage persistence. No accounts, backend, IAP, ads, or push.  
**Date:** 2026-07-24

## Summary

| Severity | Finding | Status |
|----------|---------|--------|
| **Blocker** | `android.package` missing in Expo config | Open — required for Play |
| **Blocker** | `ios.bundleIdentifier` missing in Expo config | Open — required for App Store / TestFlight |
| Low / Info | `__DEV__` helpers can mutate local progression / daily state | Acceptable — stripped from production UI paths |
| Positive | Economy duplicate transaction IDs rejected | Present (`DuplicateTransactionError`) |
| Positive | No API keys / secrets found in repo source | Pass |
| Info | `npm audit` moderate vulnerabilities | Informational — triage before store; not runtime secrets |
| Info | Analytics / error reporting default off or local no-op | Pass for privacy |

## Classification detail

### 1. Missing store identifiers — BLOCKERS

- `app.json` has no `expo.android.package`.
- `app.json` has no `expo.ios.bundleIdentifier`.
- **Do not invent final IDs in docs or config.** Product/owner must assign them before store binaries.

### 2. Dev helpers (`__DEV__`)

Locations include:

- `src/dev/progressionDevHelpers.ts`
- `src/dev/dailyDevHelpers.ts`
- Optional fixed tile sequences in `gameConstants` / `tileGenerator` for QA
- Dev-only logging paths in storage modules

**Risk:** Local cheating / reset only on development builds.  
**Mitigation:** Keep gated on `__DEV__`; never expose in production Settings UI. No remote privilege.

### 3. No secrets found

- No service account JSON, store API keys, or webhook secrets in tracked source.
- `.env.example` uses `EXPO_PUBLIC_*` names only (public by definition).
- `eas.json` must remain free of Apple IDs and credentials (operator-local EAS).

### 4. Economy integrity (local)

- `applyEconomyTransaction` rejects duplicate transaction IDs.
- Run rewards use stable `transactionId` / `rewardKey` guards (`applyRunRewards`).
- Soft-currency shop purchases go through the same path; real-money packs return “coming later”.

This prevents **local double-apply bugs**, not adversarial device owners (expected for offline games).

### 5. npm audit (moderate) — informational

Treat `npm audit` moderate findings as dependency hygiene for the next maintenance window. They are **not** evidence of a shipped secret leak. Re-run before production store submit and upgrade where Expo SDK 57 allows.

### 6. Data exposure

- All progress lives in AsyncStorage on device.
- Reset flows are user-initiated (Settings).
- No cloud sync → no account takeover surface.

## Recommendations before public beta

1. Assign and document real package / bundle IDs (still blockers until done).
2. Wire splash config; keep placeholder audio disclosure in store listing.
3. Confirm production builds do not ship `__DEV__` helper entry points.
4. Host finalized Privacy / Terms URLs (`EXPO_PUBLIC_*`) before production env validation passes.
5. Re-run `npm audit` and address high/critical if any appear.
