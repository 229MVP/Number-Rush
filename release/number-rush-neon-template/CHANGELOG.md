# Changelog

All notable changes to the **Number Rush — Neon Number Puzzle Game Template**
are documented in this file.

## [1.0.0] — Sellable Template Release — 2026-08-02

### Added
- Sellable-template feature flags (`src/config/templateFeatures.ts`) — a
  single source of truth for what ships in this SKU.
- New lightweight local **Stats** screen (Best Score, Games Played, Perfect
  Clears, Tiles Placed, Highest Combo) backed by `templateStatsStorage.ts`.
- New static **How To Play** screen with an in-game tutorial replay action.
- Buyer documentation: `README.md`, `DOCUMENTATION.md`,
  `CUSTOMIZATION_GUIDE.md`, `GAME_RULES.md`, `ASSET_LICENSES.md`,
  `KNOWN_LIMITATIONS.md`, `LICENSE_TEMPLATE.md`, and `marketplace/` listing copy.
- `docs/SELLABLE_TEMPLATE_AUDIT.md`, `docs/SECURITY_AND_PRIVACY_CHECK.md`,
  `docs/SCREENSHOT_PLAN.md`, `docs/DEMO_VIDEO_SCRIPT.md`.
- Real captured `screenshots/` from the exported web build.
- Unit tests for best-score persistence normalization, local stats
  accumulation, and `TEMPLATE_FEATURES` posture.
- `scripts/captureScreenshots.mjs` (dev-only tooling, not part of the shipped app).

### Changed
- Main Menu trimmed to PLAY / HOW TO PLAY / STATS / SETTINGS — removed Daily
  Tournament, Ranked, and Shop entry points for this SKU.
- Settings screen trimmed to Audio / Feedback / Gameplay / Data / About —
  removed Account, Cloud Sync, Ads, and Privacy-consent rows.
- Game Over screen: hid the coin/gem reward card and rewarded-ad "Double
  Coins" button (no shop economy ships in this SKU); renamed the "Perfect
  Tiles" stat label to "Perfect Clears" to match `GAME_RULES.md`.
- Power-up loading (`useNumberRushGame.ts`) now uses fixed per-run defaults
  (Multiplier ×2, Swap ×3, Bomb/Freeze/Shield/Wild ×0) instead of reading a
  persisted shop economy — no shop dependency required.
- Bomb/Freeze/Shield/Wild tray and Wild-value picker hidden from Gameplay for
  this SKU (`ADVANCED_POWER_UPS_ENABLED = false`).
- `featureFlags.ts` now forces ads/purchases/cloud-sync/live-leaderboard/
  ranked/connected-economy/account-deletion off whenever the corresponding
  `TEMPLATE_FEATURES` flag is disabled, regardless of environment variables.
- `validateEnvironment()` short-circuits to a clean, warning-free result when
  every backend-connected template flag is off.
- `app.config.ts` no longer registers the AdMob / App Tracking Transparency
  Expo config plugins for this SKU, removing the `AD_ID` Android permission
  and ATT usage string from the shipped app.
- Bumped `expo`, `expo-asset`, `react-native`, and `jest-expo` to the exact
  versions `expo-doctor` expects for Expo SDK 57 (20/20 checks now pass).

### Fixed
- Corrected the root `README.md`, which previously described an unrelated
  Godot 4 port instead of this Expo/React Native project.

### Known limitations
See `KNOWN_LIMITATIONS.md`.
