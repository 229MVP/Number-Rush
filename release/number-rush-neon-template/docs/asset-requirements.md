# Number Rush — Asset Requirements

**Date:** 2026-07-24  
**Expo SDK:** 57

## Present (usable for beta builds)

| Asset | Path | Notes |
|-------|------|-------|
| App icon | `assets/icon.png` | Wired in `app.json` → `expo.icon` |
| Adaptive icon FG | `assets/android-icon-foreground.png` | Wired |
| Adaptive icon BG | `assets/android-icon-background.png` | Wired |
| Adaptive monochrome | `assets/android-icon-monochrome.png` | Wired |
| Favicon | `assets/favicon.png` | Wired for web |
| Splash image file | `assets/splash-icon.png` | **File exists; not wired in `app.json`** |
| Fonts | `assets/fonts/*` + Expo Google Fonts | Orbitron / Rajdhani / Inter |
| UI icons | `assets/icons/*` | PNG + SVG; runtime also uses `lucide-react-native` |
| Placeholder audio | `assets/audio/sfx/*`, `assets/audio/music/*` | Synthesized WAVs via `scripts/generateAudioAssets.mjs` — not production art |

## Missing / incomplete (beta blockers or polish)

| Item | Status | Impact |
|------|--------|--------|
| `expo.splash` / splash plugin config in `app.json` | **Missing** | Native splash not configured; in-app `SplashScreen` still runs after JS load |
| Store screenshots | **Empty** — `assets/store-screenshots/` has no images | Cannot complete Play / App Store listings |
| Final marketing feature graphic / promo video | Missing | Optional for beta; required for polished store page |
| Production music / SFX | Placeholder only | Ship-as-beta OK if disclosed; replace before marketing push |
| Ranked / Leaderboard visuals | N/A — Coming Soon stubs | Do not invent competitive screenshots as live features |
| `android.package` / `ios.bundleIdentifier` | **MISSING** | Store binary blockers (not inventable here) |

## Splash wiring checklist

1. Keep `assets/splash-icon.png` (or replace with final art).
2. Add splash config to Expo config, e.g. `expo.splash.image`, `backgroundColor` (`#050617`), and resize mode.
3. Optionally use `expo-splash-screen` to hold native splash until fonts load (`App.tsx` already gates on fonts).
4. Re-validate with `node scripts/validateAssets.mjs`.

## Store screenshot folder

- Planned frames: see `docs/store-screenshot-plan.md`.
- Directory reserved: `assets/store-screenshots/`.
- Validator **warns** (does not fail) when this folder is empty.

## Preserve

- Do **not** delete `design_reference/` (`App.tsx`, `FigmaApp.tsx`).
