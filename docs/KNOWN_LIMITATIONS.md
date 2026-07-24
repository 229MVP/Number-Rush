# Number Rush — Known Limitations (Connected Backend + Monetization Phase)

## Product

- **No social friends**, chat, or live head-to-head multiplayer.
- **Ads / IAP client architecture is present** (AdMob + RevenueCat) but uses **test AdMob IDs**, feature flags, and **MONETIZATION TEST MODE** until production keys, store products, consent messages, and SSV/webhook verification are confirmed. See `docs/monetization-completion-report.md`.
- **Number Rush Club subscription is disabled** (`subscriptionsEnabled` default false).
- Local Supabase monetization migrations (`0016`–`0021`) and Edge Functions are **not applied remotely** without explicit confirmation on a Number Rush project.
- **No cash prizes / gambling / pay-to-win competitive advantages.**
- **No push notifications.**
- Practice Daily scores remain **local**.
- Ranked season reset is **not automated**.
- Anti-cheat is **basic server replay**, not enterprise fraud detection.
- Advanced moderation dashboard is not built.
- Real ads and store purchases **cannot be fully tested in Expo Go** — require an EAS development client.

## Backend / accounts

- Cloud features require a **dedicated Number Rush Supabase project** (not applied remotely in this PR).
- Until URL + anon key are configured, the app stays in **local/guest** mode.
- Account recovery depends on **email access** (magic link).
- SQL/RLS integration tests and Edge Function deploys are **not yet executed** against a live Number Rush project (including monetization SQL/Edge — see `docs/monetization-test-plan.md`).
- Ranked match results still finish through local reward paths; **server validate-run** must be deployed for trusted RP.

## Store / ops

- `android.package` and `ios.bundleIdentifier` remain **MISSING**.
- Placeholder audio / splash art quality.
- Maestro E2E not run on device.
- Privacy / Terms remain **DRAFT** until hosted URLs exist.
- AdMob SSV ECDSA verification and RevenueCat sandbox fulfillment **not proven** in this environment.
