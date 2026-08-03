# Number Rush — Known Limitations (Sellable Template)

This template ships as a **Classic-only, local-first** puzzle game. The
following are intentional, documented exclusions — not bugs.

## Not included in this template

- **No backend.** No live server, no database calls at runtime.
- **No online accounts.** No sign-up, sign-in, or user profiles.
- **No cloud saves.** Best score and stats are stored with AsyncStorage on
  the device only; uninstalling the app or clearing app data erases progress.
- **No live multiplayer** and no real-time head-to-head play.
- **No live/online leaderboard.** Only a local Best Score is tracked.
- **No purchases.** No in-app purchases, no virtual currency shop.
- **No advertisements.** No ad SDK is initialized; the `AD_ID` Android
  permission and App Tracking Transparency usage string are not present in
  the shipped app config.
- **No gambling, loot boxes, or randomized paid rewards** — this template
  contains none of that by design.

## Present in source but disabled for this SKU

The following features exist as **reference architecture** in the codebase
(not deleted) but are switched off via `src/config/templateFeatures.ts` and
are **not reachable** from the shipped Main Menu:

- Daily Tournament (`src/screens/TournamentScreen.tsx`)
- Ranked mode / seasons (`src/screens/RankedScreen.tsx`, `src/ranked/`)
- Missions (`src/screens/MissionsScreen.tsx`, `src/missions/`)
- Shop / soft-currency economy (`src/screens/ShopScreen.tsx`, `src/shop/`, `src/progression/`)
- Leaderboards (`src/screens/LeaderboardScreen.tsx`, `src/backend/*LeaderboardService.ts`)
- Accounts / auth / cloud sync (`src/auth/`, `src/sync/`, `supabase/`)
- AdMob + RevenueCat monetization architecture (`src/ads/`, `src/purchases/`, `src/consent/`, `src/monetization/`)
- Bomb / Freeze / Shield / Wild power-ups (present in `src/game/gameEngine.ts`,
  hidden from the Gameplay UI; only Multiplier and Swap ship active)

Flip the corresponding `TEMPLATE_FEATURES` flag and follow
`CUSTOMIZATION_GUIDE.md` to re-enable any of the above — each depends on
infrastructure (a Supabase project, ad network keys, store billing) you must
configure yourself and which this template's support policy does not cover.

## Repository note

This repository also contains an **unrelated Godot 4 port** of an earlier
version of this game concept (`project.godot`, `ui/`, `autoload/`, `tools/*.gd`,
and Godot-only asset files under `assets/fonts/` and `assets/icons/`). That
Godot project is a separate deliverable from a different task and is **not**
part of, and is excluded from, this Expo/React Native template's sellable
release folder (see `release/FILE_MANIFEST.md`).

## Store / identifiers

- `android.package` and `ios.bundleIdentifier` are **not set** in `app.json`
  — you must assign your own before any store submission build (see
  `CUSTOMIZATION_GUIDE.md`).
- App icon, splash, and audio are original placeholder assets — see
  `ASSET_LICENSES.md` for what's safe to keep vs. what you should replace.

## Testing scope

- Automated tests cover the Classic Rush 21 engine (Perfect/Bust/combo/strike
  rules, tile queue advancement, Multiplier/Swap behavior) and local-storage
  normalization. There is no end-to-end device test suite included.
- Manual verification was performed via `npx expo export --platform web` plus
  scripted browser automation (see `docs/SCREENSHOT_PLAN.md`); native
  iOS/Android builds were not produced or manually tested in this pass.
