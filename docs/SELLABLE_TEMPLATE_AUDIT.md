# Number Rush — Sellable Template Audit

**Date:** 2026-08-02
**Branch:** `cursor/sellable-template-dca3`
**Purpose:** Determine the real, working state of every feature before packaging
Number Rush as **"Number Rush — Neon Number Puzzle Game Template."**

Statuses used: `WORKING` · `PARTIALLY WORKING` · `BROKEN` · `PLACEHOLDER` · `NOT IMPLEMENTED` · `REMOVE FROM TEMPLATE`

## Feature-by-feature status

| Feature | Status | Notes |
|---|---|---|
| Splash | WORKING | Animated logo, tap-to-start, no timers to leak. |
| Main Menu | WORKING (rewritten) | Removed Daily/Ranked/Shop/BottomNavigation entry points; now PLAY, HOW TO PLAY, STATS, SETTINGS only. |
| Classic Gameplay | WORKING | Rush 21 loop verified against unit tests: exact-21 Perfect, over-21 Bust, 3-strike Game Over, combo table (streak 0–1→×1, 2–3→×2, 4–5→×3, 6+→×4), tile queue advance, input lock during resolution. |
| Tutorial | WORKING | Measured-rect spotlight (`measureTutorialTarget.ts`), not hardcoded percentages; Skip/Next/Got It all functional; completion + reset persist via `gameStorage`. |
| Pause / Resume | WORKING | `PauseModal` — resume, restart, settings, quit all wired. |
| Game Over | WORKING (trimmed) | Shows Final Score, Best Score, Perfect Clears, Highest Combo, Tiles Placed, PLAY AGAIN / MAIN MENU. Coin/gem reward card and ad "DOUBLE COINS" button hidden for the template (no shop economy shipped). `navigation.replace` — no stacked duplicate screens. |
| Settings | WORKING (trimmed) | Audio, Feedback (Haptics/Reduced Motion/High Contrast), Gameplay (reset tutorial), Data (restore defaults / reset best score / reset all), About. Removed Account, Cloud Sync, Ads, Privacy-consent, Restore Purchases rows (no backend/monetization shipped). |
| Stats (new) | WORKING | New lightweight local-only screen: Best Score, Games Played, Perfect Clears, Tiles Placed, Highest Combo — AsyncStorage only, no accounts. |
| How To Play (new) | WORKING | Static rules screen + "replay in-game tutorial" action. |
| Power-Ups — Multiplier | WORKING | Doubles next tile; cancelable; consumes only on successful placement; fixed quantity 2/run, no shop dependency. |
| Power-Ups — Swap | WORKING | Swaps two lane totals; no score/combo/tile-queue change; cancelable; fixed quantity 3/run. |
| Power-Ups — Bomb/Freeze/Shield/Wild | REMOVE FROM TEMPLATE | Functional in source but **disabled** for this SKU (`ADVANCED_POWER_UPS_ENABLED = TEMPLATE_FEATURES.shop = false`) — quantities are always 0 and the "+4" tray/Wild picker are hidden. Re-enable by flipping `TEMPLATE_FEATURES.shop`. |
| Daily Tournament | REMOVE FROM TEMPLATE | Real UI exists (`TournamentScreen`) but depends on the disabled connected-economy/leaderboard stack; not linked from Main Menu in this SKU. |
| Ranked | REMOVE FROM TEMPLATE | Same — `RankedScreen`/season code remains as reference, unlinked. |
| Missions | REMOVE FROM TEMPLATE | Requires the shop/economy loop; unlinked. |
| Shop | REMOVE FROM TEMPLATE | Coin/gem/premium tabs depend on the economy + monetization stack; unlinked. |
| Leaderboards | REMOVE FROM TEMPLATE | Local/mock preview only in source; requires Supabase to be "live." Unlinked. |
| Accounts / Auth | REMOVE FROM TEMPLATE | `AuthProvider` mounted but inert without `EXPO_PUBLIC_SUPABASE_*`; no UI entry point in the template. |
| Supabase / Cloud Sync | REMOVE FROM TEMPLATE | `isSupabaseConfigured()` returns false with no env vars — no network calls attempt to fire; validated by `validateEnvironment()` short-circuiting to a clean "offline template" result. |
| Monetization (AdMob/RevenueCat) | REMOVE FROM TEMPLATE | `TEMPLATE_FEATURES.monetization=false` forces `adsEnabled`/`purchasesEnabled` false everywhere; AdMob/ATT Expo plugins are **not registered** in `app.config.ts`, so the `AD_ID` Android permission and ATT usage string are absent from the shipped app. |
| Audio | WORKING | Music + SFX toggle/volume via `AudioProvider`; verified in Settings. |
| Haptics | WORKING | Toggle via `HapticsProvider`; used on button taps and gameplay events. |
| Local storage | WORKING | `gameStorage.ts` (best score, tutorial flag) and new `templateStatsStorage.ts` — both normalize malformed/negative values safely (unit tested). |
| Error boundary | WORKING | Generic fallback with TRY AGAIN / MAIN MENU; dev stack trace gated behind `__DEV__`. |

## Dependency-removal decision (Section 15)

`react-native-google-mobile-ads`, `react-native-purchases`, `react-native-purchases-ui`,
`expo-tracking-transparency`, and `@supabase/supabase-js` remain **installed** because
the reference provider code (`src/ads/`, `src/purchases/`, `src/auth/`, `src/sync/`,
`src/consent/`) still statically `require()`s them behind try/catch guards. Metro
resolves `require()` calls at bundle time for native builds even inside try/catch, so
removing the packages without first deleting that reference code would break
`eas build` for Android/iOS. All of it is already inert at runtime (flags forced off),
verified by `validateEnvironment()` and the featureFlags unit tests. See
`CUSTOMIZATION_GUIDE.md → "Removing backend scaffolding"` for the buyer-facing path
to a leaner dependency tree.

Genuinely applied dependency changes in this pass:
- Bumped `expo`, `expo-asset`, `react-native`, `jest-expo` to the versions `expo-doctor`
  expects for SDK 57 (`20/20` checks now pass).
- Removed the AdMob / App Tracking Transparency **Expo config plugins** from
  `app.config.ts` (not just a runtime flag) — this removes the `AD_ID` Android
  permission and the ATT usage string from the actual shipped binary.

## Conclusion

The Classic Rush 21 loop, tutorial, Multiplier/Swap power-ups, Settings, and local
persistence are genuinely complete and stable. Everything backend/economy/
monetization-shaped is disabled (not deleted) behind `src/config/templateFeatures.ts`
and documented as reference-only in `KNOWN_LIMITATIONS.md`.
