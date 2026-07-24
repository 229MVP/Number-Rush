# Privacy Policy — Number Rush (DRAFT)

**Status:** DRAFT — not legal advice. Replace with counsel-reviewed text and a hosted URL before production store release.  
**Last updated:** 2026-07-24  
**Applies to:** Number Rush mobile / Expo client with optional Supabase-connected features.

## Plain summary

Number Rush can run fully offline as a **guest** with progress stored on your device. If you create an account with email magic link, selected progress and competitive scores may sync to **Supabase** cloud storage so you can use cloud backup and live leaderboards.

## Who we are

[Publisher legal name — TODO]  
Contact: [privacy@example.com — TODO]

## Information we process

### Stored on your device (always)

- Gameplay progress (scores, XP, level, coins, gems, inventory, themes)
- Local Daily practice / cached attempt state
- Missions, settings, tutorial flags
- Local transaction IDs (duplicate reward protection)
- Random **install device ID** (not an advertising ID; resets if app storage is cleared)
- Pending competitive submissions awaiting network confirmation

### If you sign in (optional connected mode)

- Email address (for magic-link authentication; **not** shown on public leaderboards)
- Public **username**
- Cloud profile, inventory, statistics
- Official Daily scores and Ranked match summaries (server-validated)
- Sync metadata (device install ID, revisions, timestamps)
- Account deletion requests

### Public competitive surfaces

Live leaderboards may show: username, score / Ranked Points, limited run stats, relative rank.  
They do **not** show email, currency balances, inventory, device IDs, or raw run event logs.

### Optional monetization (not enabled by default)

When the publisher enables connected monetization:

- **Rewarded ads (AdMob)** — ad network callbacks may include ad unit id, reward type/amount, and a server-issued opportunity id tied to your account.
- **In-app purchases (RevenueCat)** — store transaction identifiers and product ids; payment cards are processed by Apple/Google, not stored in Number Rush backends.
- **Entitlements** — e.g. ad removal or bundle claims stored in `monetization_entitlements`.

Until store and SDK configuration is complete, the app runs without ads or real-money purchases.

### Not collected in this phase
- Contacts, precise location, microphone, camera
- Social chat / friends graph

### Technical processing

Expo, Supabase Auth, and (when enabled) Supabase Edge Functions may process technical logs (IP, user-agent, timestamps) under their policies. Analytics defaults to local/no-op unless explicitly enabled.

## Legal bases / retention (TODO for counsel)

Account data retained while the account exists. Deletion: in-app DELETE ACCOUNT (typed confirmation) invokes server-side deletion of owned rows and auth user when Edge Function is deployed. Local cache may remain unless you also reset local progress.

## Your choices

- Continue as Guest (local only)
- Sign in / create account
- Sign out (local cache preserved; sync pauses)
- Delete account
- Export a local account/progress summary (no tokens)

## Contact

[privacy@example.com — TODO]
