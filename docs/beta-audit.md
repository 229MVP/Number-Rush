# Number Rush — Beta Audit (pre-change snapshot)

**Date:** 2026-07-24  
**Branch base:** `cursor/gameplay-polish-powerups-dca3`  
**Working tree:** preserved (no discard / force checkout)

## Versions

| Item | Value |
|------|--------|
| Expo SDK | ~57.0.8 |
| React Native | 0.86.0 |
| React | 19.2.3 |
| App version | 1.0.0 |
| Android package | **MISSING** |
| Android versionCode | **MISSING** |
| iOS bundleIdentifier | **MISSING** |
| iOS buildNumber | **MISSING** |

## Known working features

- Splash → Main Menu
- Classic Rush 21 (lanes, strikes, combo, Multi/Swap/Bomb/Freeze/Shield/Wild)
- Daily Tournament (official + practice, seeded tiles)
- Profile / XP / coins / gems / inventory
- Missions (daily/weekly local)
- Shop + themes (local)
- Settings (audio, haptics, reduced motion, resets)
- Audio + haptics providers
- Local AsyncStorage persistence
- Expo Web + mobile-oriented layouts

## Stubs / placeholders

- Ranked screen → Coming Soon (no ranked match engine / RP divisions)
- Leaderboard screen → Coming Soon (local mock board on Daily only)
- Placeholder synthesized audio assets
- No accounts / backend / IAP / ads / push / cloud sync

## Existing tooling gaps (before this phase)

- No Jest / testing-library
- No ESLint config
- No `eas.json`
- No `app.config.ts` (uses `app.json`)
- No error boundary / logger / analytics
- No splash entry in `app.json` (asset file exists)
- ~9 console usages (mostly storage warns + dev helpers)

## Files planned to change / add

- Test infra: `jest.config.js`, `babel.config.js`, `src/test/*`, `src/**/__tests__/*`
- Runtime: error boundary, logger, analytics (no-op), environment helpers
- Config: `eas.json`, `.env.example`, optional `app.config.ts` or app.json updates
- Docs: beta / security / privacy / store / EAS / checklists
- Maestro + EAS workflow stubs
- Stable `testID`s on key controls
- package.json scripts

## Preserve

- `design_reference/FigmaApp.tsx` (do not delete)
- Working Classic / Daily / progression / shop / settings behavior
