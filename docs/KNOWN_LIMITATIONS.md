# Number Rush — Known Limitations (Connected Backend Phase)

## Product

- **No social friends**, chat, or live head-to-head multiplayer.
- **No ads**, real-money IAP, subscriptions, or cash prizes.
- **No push notifications.**
- Practice Daily scores remain **local**.
- Ranked season reset is **not automated**.
- Anti-cheat is **basic server replay**, not enterprise fraud detection.
- Advanced moderation dashboard is not built.

## Backend / accounts

- Cloud features require a **dedicated Number Rush Supabase project** (not applied remotely in this PR).
- Until URL + anon key are configured, the app stays in **local/guest** mode.
- Account recovery depends on **email access** (magic link).
- SQL/RLS integration tests and Edge Function deploys are **not yet executed** against a live Number Rush project.
- Ranked match results still finish through local reward paths; **server validate-run** must be deployed for trusted RP.

## Store / ops

- `android.package` and `ios.bundleIdentifier` remain **MISSING**.
- Placeholder audio / splash art quality.
- Maestro E2E not run on device.
- Privacy / Terms remain **DRAFT** until hosted URLs exist.
