# Number Rush — iOS Privacy Review Notes

**Status:** Verify in App Store Connect / TestFlight.  
**Do not invent** `NS*UsageDescription` strings or Privacy Nutrition Label answers until Xcode / Expo prebuild output is inspected with final identifiers.

## Blockers before TestFlight

| Item | Status |
|------|--------|
| `ios.bundleIdentifier` | **MISSING** — do not invent |
| `ios.buildNumber` | Not set yet |
| Apple Developer team / App Store Connect app record | Operator-local (not in repo) |
| Hosted Privacy Policy URL | Draft only in-app / docs |

## Likely areas to verify (not asserted as final)

These modules are dependencies and **may** require privacy questionnaire answers or Info.plist review after a real iOS binary is produced:

| Module | Why review |
|--------|------------|
| `expo-audio` | Audio playback for music / SFX; confirm whether any mic / background audio modes appear in the built Info.plist |
| `expo-haptics` | Haptic feedback; usually no special privacy key, confirm in binary |
| `react-native-google-mobile-ads` | Advertising; ATT / tracking / advertising data labels; UMP consent |
| `expo-tracking-transparency` | NSUserTrackingUsageDescription present when ATT used |
| `react-native-purchases` | Purchase history / identifiers via RevenueCat + Apple/Google; no PAN stored by app |
| AsyncStorage | Local cache — disclose accurately with cloud/auth present |

**Rule:** Open the generated `Info.plist` from an EAS/`npx expo prebuild` iOS artifact and record **actual** keys. Do not invent microphone / contacts / location reasons.

## App Privacy (Nutrition Labels) — draft posture with monetization architecture

When shipping a build that includes AdMob / RevenueCat / accounts:

- **Purchases** — declare as applicable (Apple/Google process payment)
- **Advertising Data** — declare when ads are enabled; distinguish personalized vs non-personalized based on consent/ATT
- **Identifiers** — device / purchase / user IDs as used for auth, SSV, and RevenueCat app user id (Supabase UUID — not email)
- **Product Interaction / Gameplay** — progress, scores
- **Diagnostics** — only if a crash/analytics SDK is actually linked

Until production ads/IAP are confirmed, review labels against the **exact binary** shipped (test ads still use AdMob SDK).

## TestFlight verification checklist

1. Install preview binary on a physical device.
2. Confirm audio plays with hardware silent switch behavior as designed.
3. Confirm haptics toggle in Settings stops vibration.
4. Confirm Ranked + Leaderboard show Coming Soon (no Game Center claims unless integrated later).
5. Capture screenshots of Privacy → App Privacy questionnaire as filled.
6. Attach finalized privacy policy URL before App Store review (not only in-app DRAFT).

## Related

- `docs/privacy-policy-draft.md`
- `docs/data-inventory.md`
- `docs/app-store-checklist.md`
