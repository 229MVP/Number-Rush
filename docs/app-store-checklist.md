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
| Tracking | ATT string present via AdMob/ATT plugins — request only when personalized ads require it; legal review required |
| Advertising / IAP | AdMob + RevenueCat integrated in **test/sandbox posture**; declare ads & purchases accurately at submit time |
| In-app Legal DRAFT | `LegalInfoScreen` — replace with hosted Terms/Privacy |

## Review notes (draft)

Number Rush is a neon number puzzle with Classic, Daily Tournament, and Ranked modes. Soft-currency progression and an optional Shop remain available without payment. When monetization is enabled for a build: rewarded ads are optional; interstitial ads follow a limited Classic-only policy; Remove Ads and gem packs are one-time / consumable store products. Number Rush Club is not launched. No cash prizes. Competitive modes do not sell score advantages.

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
