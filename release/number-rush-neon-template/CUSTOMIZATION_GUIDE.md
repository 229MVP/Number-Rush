# Number Rush — Customization Guide

This guide covers the changes buyers most commonly want to make. All paths
are relative to the project root.

## Change app name

Edit `app.json`:

```json
{
  "expo": {
    "name": "Your Game Name",
    "slug": "your-game-slug"
  }
}
```

`slug` should be lowercase, hyphenated, and unique to your EAS project.

## Change bundle identifier / Android package

**Do this before your first production build.** Edit `app.json`:

```json
{
  "expo": {
    "ios": { "bundleIdentifier": "com.yourcompany.yourgame" },
    "android": { "package": "com.yourcompany.yourgame" }
  }
}
```

Use your own reverse-domain identifier — never reuse the values shown in any
sample/documentation screenshot.

## Change version

```json
{ "expo": { "version": "1.0.1" } }
```

Also bump `android.versionCode` and `ios.buildNumber` for native store
submissions (see `eas.json` build profiles).

## Change logo / icons / splash

1. Replace `assets/icon.png` (1024×1024), `assets/android-icon-foreground.png`,
   `assets/android-icon-background.png`, `assets/android-icon-monochrome.png`,
   `assets/favicon.png`, and `assets/splash-icon.png` with your own art at the
   same dimensions.
2. Keep the same filenames, or update the paths in `app.json` /
   `app.config.ts` to match new filenames.
3. `NumberRushLogo` (`src/components/NumberRushLogo.tsx`) renders the in-app
   wordmark with SVG/text — edit it directly for a text-based logo change, or
   swap it for an `<Image>` if you have logo artwork.

## Change colors / theme

Edit `src/theme/colors.ts` (palette) and `src/theme/index.ts` (barrel
exports). Every screen consumes `colors.*` and helpers like `withAlpha()` and
`neonGlow()` from `src/theme` — changing the palette here reskins the whole
app consistently.

## Change fonts

Fonts are loaded in `App.tsx` via `@expo-google-fonts/*` packages
(Orbitron, Rajdhani, Inter). To swap fonts:

1. `npx expo install @expo-google-fonts/your-font`
2. Import the desired weights in `App.tsx` and pass them to `useFonts({...})`.
3. Update `fontFamilies` in `src/theme/typography.ts` to point at the new
   family names.

## Change target value (default 21)

Edit `TARGET_VALUE` in `src/game/gameConstants.ts`. The engine (`gameEngine.ts`)
and every screen that displays "TARGET 21" read from this constant — no other
changes are required for Classic mode.

## Change maximum strikes (default 3)

Edit `MAX_STRIKES` in `src/game/gameConstants.ts`.

## Change tile value range (default 1–10)

Edit `MIN_TILE_VALUE` / `MAX_TILE_VALUE` in `src/game/gameConstants.ts`. The
tile generator (`src/game/tileGenerator.ts`) reads these bounds for both
random and seeded sequences.

## Change number of lanes (default 4)

Edit `LANE_COUNT` in `src/game/gameConstants.ts`. `createEmptyLanes()` in
`src/game/gameEngine.ts` builds the lane array from this constant, and
`GameplayScreen.tsx` lays lanes out responsively based on board width — no
hardcoded "4" appears in the layout math.

## Change scoring

- Base Perfect reward: `PERFECT_BASE_SCORE` in `src/game/gameConstants.ts`.
- Combo multiplier table: `comboMultiplierFromStreak()` in `src/game/scoring.ts`.

## Change power-up quantities

- Multiplier: `MULTIPLIER_STARTING_QUANTITY` in `src/game/gameConstants.ts`.
- Swap: `SWAP_STARTING_QUANTITY` in `src/game/gameConstants.ts`.
- Multiplier factor (default ×2): `MULTIPLIER_FACTOR` in the same file.

## Replace audio

Audio files live in `assets/audio/sfx/*.wav` and `assets/audio/music/*.wav`.
They are original, programmatically generated placeholder tones (see
`scripts/generateAudioAssets.mjs` and `ASSET_LICENSES.md`). Replace any file
with your own properly licensed `.wav`/`.mp3` of the same filename, or update
the references in `src/audio/AudioProvider.tsx`.

## Replace icons

In-app UI icons come from `lucide-react-native` (imported per-screen, e.g.
`import { Play } from 'lucide-react-native'`). Swap the import for a
different icon from the same library, or replace with your own SVG/Image
component — there is no local icon-asset dependency to update for these.

## Add a new screen

1. Create `src/screens/YourScreen.tsx` following the pattern of
   `src/screens/StatsScreen.tsx` (simple, self-contained, local storage only).
2. Add the route name + params to `RootStackParamList` in
   `src/navigation/navigationTypes.ts`.
3. Register `<Stack.Screen name="YourScreen" component={YourScreen} />` in
   `src/navigation/AppNavigator.tsx`.
4. Link to it from `MainMenuScreen.tsx` or wherever makes sense.

## Create a reskinned version

1. Fork/copy the repository.
2. Update `app.json` (name, slug, identifiers) per above.
3. Replace icons/splash/audio.
4. Update `src/theme/colors.ts` and, if desired, fonts.
5. Update `src/components/NumberRushLogo.tsx` and all "NUMBER RUSH" strings
   in screens (`grep -ri "number rush" src/` to find every occurrence).
6. Update `README.md`, `GAME_RULES.md`, and store metadata (`docs/store-listing.md`)
   to reflect your product name.
7. Re-run validation: `npx tsc --noEmit && npm test -- --runInBand && npx expo-doctor`.

## Removing backend scaffolding (optional, advanced)

This template ships with `src/config/templateFeatures.ts` set to disable all
backend/economy/monetization features. The underlying reference code
(`src/auth/`, `src/sync/`, `src/ads/`, `src/purchases/`, `src/consent/`,
`src/monetization/`, `supabase/`) stays installed-but-inert so native builds
keep working. If you want a leaner dependency tree instead of just disabled
flags:

1. Delete the folders listed above.
2. Remove their provider wiring from `App.tsx`
   (`AuthProvider`, `ConsentProvider`, `AdsProvider`, `PurchasesProvider`,
   `CloudSyncProvider`, `SubmissionProvider`).
3. Remove any remaining imports of `useAds`, `usePurchases`, `useConsent`,
   `useAuth`, `useCloudSync` from `GameplayScreen.tsx` / `GameOverScreen.tsx`.
4. Uninstall the now-unused packages: `npm uninstall @supabase/supabase-js
   react-native-google-mobile-ads react-native-purchases
   react-native-purchases-ui expo-tracking-transparency`.
5. Re-run `npx tsc --noEmit`, `npm test -- --runInBand`, and
   `npx expo export --platform web` to confirm nothing broke.

Re-enabling any of these features for real (a live backend, real ads, real
purchases) requires your own accounts/keys/store setup and is outside the
scope of this template's support policy — see `marketplace/SUPPORT_POLICY.md`.
