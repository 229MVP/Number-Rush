# Privacy Policy — Number Rush (DRAFT)

**Status:** DRAFT — not legal advice. Replace with counsel-reviewed text and a hosted URL before production store release.  
**Last updated:** 2026-07-24  
**Applies to:** Number Rush mobile / Expo client in the current local-only beta configuration.

## Plain summary

Number Rush currently runs as a **local game**. Progress, settings, and scores are stored **on your device**. We do **not** operate user accounts, cloud sync, advertising SDKs, or in-app purchase backends in this beta build.

## Who we are

[Publisher legal name — TODO]  
Contact: [privacy@example.com — TODO]

## Information we process

### Stored only on your device

- Gameplay progress (scores, XP, level, coins, gems, inventory, themes)
- Daily tournament attempt state for the local calendar day
- Missions progress
- Settings (audio, haptics, reduced motion, high contrast, confirmations)
- Tutorial completion flag
- Local transaction history used to prevent duplicate reward application

This data is written via platform local storage (AsyncStorage). Uninstalling the app or using in-app “Reset all local progress” deletes it from the device (subject to OS backups).

### Not collected by a Number Rush backend (current beta)

- No account registration or login
- No email / phone collection in-app
- No cloud leaderboards or ranked matchmaking (those screens are **Coming Soon** stubs)
- No advertising identifiers collected for ads (no ads SDK)
- No IAP receipt validation (real-money packs are disabled)

### Optional / future

If analytics or crash reporting is enabled in a future build, this policy will be updated to name the vendor, data categories, and retention. Today, analytics defaults to a **no-op / local debug log** and does not send data to a Number Rush server.

## Permissions & device features

Depending on platform configuration, the app may use:

- **Audio** playback for music / SFX (placeholder audio in beta)
- **Haptics** vibration for feedback (user-toggleable)

Exact iOS privacy nutrition labels must be verified in App Store Connect / TestFlight (see `docs/ios-privacy-review.md`). Do not invent API usage strings here.

## Children

The game is a general-audience puzzle skill game. This DRAFT does not target children under 13. If the product will be marketed to children, obtain legal review before release.

## Your choices

- Toggle music, SFX, and haptics in Settings
- Restore local defaults or reset all local progress in Settings
- Uninstall the app to remove local app data (OS-dependent)

## Changes

We will update this DRAFT when accounts, online services, ads, or analytics backends are introduced. The in-app Legal screen is labeled **DRAFT** until a hosted policy URL is configured (`EXPO_PUBLIC_PRIVACY_POLICY_URL`).

## Contact

[TODO — support / privacy contact]
