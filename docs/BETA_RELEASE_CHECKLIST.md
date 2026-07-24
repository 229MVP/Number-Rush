# Number Rush — Beta Release Checklist

**Honest statuses only:** `PASS` · `FAIL` · `BLOCKED` · `NOT TESTED` · `NOT APPLICABLE`  
**Date:** 2026-07-24 · Expo SDK 57 · Local-only app

## Identity & store config

| Check | Status | Notes |
|-------|--------|-------|
| App name / slug set | PASS | Number Rush / `number-rush` |
| Version `1.0.0` | PASS | |
| `android.package` | BLOCKED | MISSING — do not invent |
| `ios.bundleIdentifier` | BLOCKED | MISSING — do not invent |
| Android `versionCode` | BLOCKED | MISSING |
| iOS `buildNumber` | BLOCKED | MISSING |
| Splash wired in Expo config | PASS | `splash-icon.png` in `app.json` |
| Icon / adaptive / favicon present | PASS | |
| Store screenshots present | FAIL | `assets/store-screenshots/` empty |
| `design_reference/` preserved | PASS | Do not delete |
| Error boundary + analytics wired in App | PASS | No-op analytics; BETA badge preview-only |
| `expo-updates` installed | BLOCKED | Config prepared in docs; package not installed until EAS project linked |

## Gameplay

| Check | Status | Notes |
|-------|--------|-------|
| Splash → Main Menu | PASS | In-app splash |
| Classic Rush start / play | PASS | |
| Pause / resume Classic | PASS | |
| Power-ups (Multi/Swap/Bomb/Freeze/Shield/Wild) | PASS | Soft currency / inventory |
| Daily Tournament official + practice | PASS | Local seeded |
| Daily results / local mock board | PASS | Not global online |
| Ranked matchmaking | NOT APPLICABLE | Coming Soon stub |
| Leaderboard global / friends | NOT APPLICABLE | Coming Soon stub |
| Missions claim (local) | PASS | |
| Shop soft-currency purchase | PASS | Duplicate txn protected |
| Real-money IAP | BLOCKED | RevenueCat wired; needs store products + sandbox + webhook |
| Ads | BLOCKED | AdMob wired with **test IDs** only; consent/SSV not production-proven |
| Accounts / cloud sync | PASS / BLOCKED | Code present; needs Number Rush Supabase project |
| Remove Ads / gem packs / starter bundle | BLOCKED | Client catalog ready; not live-billed |
| Number Rush Club subscription | NOT APPLICABLE | Flagged off until launch checklist |

## Client quality

| Check | Status | Notes |
|-------|--------|-------|
| Settings audio / haptics / a11y | PASS | |
| Local reset progress | PASS | |
| Placeholder audio present | PASS | Not production art |
| Analytics remote pipeline | NOT APPLICABLE | No-op / local debug |
| Error boundary present | PASS | Code present |
| Jest unit tests | PASS | Added for core modules |
| Maestro E2E on device | NOT TESTED | Flows stubbed; needs appId |
| OTA published | NOT TESTED | Prepare only — do not publish yet |
| `npm audit` clean | FAIL | Moderate vulns informational — see security review |
| Performance profiling (Instruments) | NOT TESTED | See performance-audit intended fixes |
| iOS privacy nutrition labels verified | NOT TESTED | Needs TestFlight binary |
| Privacy / Terms hosted URLs | FAIL | DRAFT docs + in-app DRAFT only |

## Docs & ops

| Check | Status | Notes |
|-------|--------|-------|
| Analytics schema doc | PASS | `docs/analytics-events.md` |
| Security review doc | PASS | |
| Privacy / Terms drafts | PASS | Labeled DRAFT |
| EAS profiles in repo | PASS | No secrets / Apple IDs |
| Beta feedback (share sheet) | PASS | No backend submit |
| Legal info screen | PASS | DRAFT sections |

## Go / No-Go

**NO-GO for store binary** until package + bundleIdentifier are assigned and screenshots exist.  
**OK for internal Expo Go / dev client exploration** of Classic + Daily with documented limitations.
