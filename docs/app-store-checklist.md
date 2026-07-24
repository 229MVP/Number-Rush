# Apple App Store / TestFlight — Beta Checklist

## Blockers

| Item | Status |
|------|--------|
| `ios.bundleIdentifier` | **BLOCKED — MISSING** (do not invent) |
| `ios.buildNumber` | **MISSING** |
| Apple Developer / ASC app record | Operator-local (not in repo) |
| Privacy Policy URL | DRAFT — required for App Store; TestFlight may proceed with ASC placeholders per Apple rules at time of upload |
| Screenshots for required device sizes | **MISSING** |
| Export compliance / encryption answers | Not recorded — determine at submit time |

## Build config

| Item | Status / action |
|------|-----------------|
| Expo SDK 57 | Present |
| `supportsTablet` | `true` in `app.json` — verify UI on iPad before claiming optimization |
| Icon | Present |
| Splash | Asset exists — **not wired** in Expo config |
| `eas.json` | Profiles present — **no Apple IDs / secrets in repo** |
| Capabilities | No Push, Sign in with Apple, Game Center wired |

## Privacy

| Item | Action |
|------|--------|
| Nutrition labels | Verify after binary — see `ios-privacy-review.md` |
| `expo-audio` / `expo-haptics` | Inspect generated Info.plist; do not invent usage strings |
| Tracking | No ATT expected (no ads / tracking SDK) |
| In-app Legal DRAFT | `LegalInfoScreen` — replace with hosted Terms/Privacy |

## Review notes (draft)

Number Rush is a local single-player puzzle game. Ranked and Leaderboard screens display Coming Soon. There are no accounts, no chat, no IAP, and no ads in this beta.

## QA on TestFlight

| Item | Expectation |
|------|-------------|
| Cold start → Splash → Menu | Works |
| Classic + Daily | Works |
| Audio silent switch / mute toggles | Verify on device |
| Haptics toggle | Verify on device |
| Ranked / Leaderboard | Coming Soon only |
| Background / resume during pause | No crash / stuck BGM |

## Submit path (when unblocked)

1. Assign real `bundleIdentifier` + buildNumber.
2. `eas build --profile preview --platform ios`
3. Distribute TestFlight internal.
4. Complete App Privacy from actual binary behavior.
5. Attach hosted Privacy / Terms before App Review.
