# Number Rush — Setup & Build Documentation

## 1. Install Node.js

Install Node.js **18 LTS or newer** from [nodejs.org](https://nodejs.org) or
via a version manager (`nvm install --lts`). Verify with:

```bash
node -v
npm -v
```

## 2. Install dependencies

From the project root:

```bash
npm install
```

This installs Expo SDK 57, React Native 0.86, and all supporting packages.
No environment variables are required to run the Classic-only template.

## 3. Start Expo

```bash
npx expo start
```

This opens the Expo developer tools in your terminal. From there:

- Press `w` to open in a web browser
- Press `a` to open on a connected Android device/emulator
- Press `i` to open on a connected iOS device/simulator (macOS only)
- Scan the QR code with the **Expo Go** app for a quick device preview

## 4. Run on Web

```bash
npx expo start --web
```

or export a static build:

```bash
npx expo export --platform web
```

The exported site is written to `dist/`. Serve it with any static file
server, e.g. `npx serve dist`.

## 5. Run on Android

Requires Android Studio with an emulator configured, or a physical device
with USB debugging enabled and connected.

```bash
npx expo start --android
```

For a real native build (required to test any native module beyond Expo Go's
supported set):

```bash
npx eas-cli@latest build --platform android --profile development
```

## 6. Run on iOS

Requires Xcode (macOS only) with a configured simulator, or a physical device
enrolled in your Apple Developer account.

```bash
npx expo start --ios
```

For a real native build:

```bash
npx eas-cli@latest build --platform ios --profile development
```

## 7. Clear Expo cache

If you see stale bundling issues, missing assets, or a broken Metro cache:

```bash
npx expo start --clear
```

or for a deeper clean:

```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```

## 8. Build with EAS

This template ships with an `eas.json` containing `development`, `preview`,
and `production` profiles. Building requires an [Expo/EAS account](https://expo.dev)
and (for production) your own `android.package` / `ios.bundleIdentifier`
assigned in `app.json` (see `CUSTOMIZATION_GUIDE.md`).

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

Do not run a `production` profile build until you have configured your own
store identifiers, icons, and legal URLs.

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `Unable to resolve module …` | Run `npx expo start --clear`, then `npm install` again. |
| Blank/white screen on web | Check the browser console; run `npx expo export --platform web` to catch build-time errors. |
| Fonts render as fallback system font | Confirm `@expo-google-fonts/*` packages installed; the app falls back gracefully after an 8s timeout (`App.tsx`). |
| TypeScript errors after editing | Run `npx tsc --noEmit` to see the full list. |
| Tests fail after a change | Run `npm test -- --runInBand` for clearer sequential output. |
| `expo-doctor` reports version mismatches | Run `npx expo install --check` and align versions to the SDK 57 expectations. |
| App requests Supabase/ads/purchases config it doesn't have | It shouldn't — `TEMPLATE_FEATURES` in `src/config/templateFeatures.ts` disables all of that by default. If you changed a flag, revert it or fully configure the backend it depends on. |

## Validation commands (recommended before shipping a reskin)

```bash
npx tsc --noEmit
npm test -- --runInBand
npx expo-doctor
npx expo export --platform web
```
