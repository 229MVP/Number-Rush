# Monetization Phase — Completion Report

**Branch:** `cursor/monetization-phase-dca3`  
**Status:** Architecture + client wiring + local SQL/Edge stubs complete. **Not production-ready.**

## Verdict

Monetization phase 1 is implemented behind feature flags with **Google test AdMob IDs**, sandbox/test purchase adapters, and **local-only** Supabase migrations/Edge Functions. Live ads, live IAP, remote schema apply, and paid EAS builds were **not** executed.

## Packages installed

| Package | Version |
|---------|---------|
| `react-native-google-mobile-ads` | ^16.4.0 |
| `react-native-purchases` | ^10.4.4 |
| `react-native-purchases-ui` | ^10.4.4 |
| `expo-tracking-transparency` | ~57.0.1 |

## Native / Expo config

- `app.config.ts` — AdMob plugin with **official Google test app IDs** as fallbacks, `delayAppMeasurementInit: true`, ATT usage string, `expo-tracking-transparency` plugin
- `eas.json` — existing `development` profile (dev client) retained; suitable for native ads/IAP testing
- Web uses platform-split loaders (`.web.ts`) so AdMob/RevenueCat/ATT are never bundled on web

## Environment variables added (names in `.env.example`)

Client-safe:

- `EXPO_PUBLIC_ADMOB_*` app + unit IDs
- `EXPO_PUBLIC_REVENUECAT_*` public SDK keys
- `EXPO_PUBLIC_ADS_ENABLED` / `PURCHASES_ENABLED` / `SUBSCRIPTIONS_ENABLED`

Server-only (never in Expo public vars):

- `SUPABASE_ADMOB_SSV_SECRET`
- `REVENUECAT_WEBHOOK_AUTH_SECRET`

## Feature flags (`src/config/featureFlags.ts`)

- `adsEnabled`, `rewardedAdsEnabled`, `interstitialAdsEnabled`
- `purchasesEnabled`, `subscriptionsEnabled` (**default false**)
- `rewardedAdSsvEnabled`, `personalizedAdsEnabled`
- `removeAdsProductEnabled`, `starterBundleEnabled`
- Production remains off unless IDs + policies are configured

## Ad formats / placements

| Format | Placement | Status |
|--------|-----------|--------|
| Rewarded | `classic_revive` | Wired (Classic only, once per run) |
| Rewarded | `double_classic_coins` | Wired (coins only, once per run) |
| Rewarded | `daily_free_powerup` | Wired (Shop/Power-Ups, once per UTC day) |
| Interstitial | `classic_run_complete` | Policy: skip first 2 runs; every 3rd; 8 min cooldown; 5/day; blocked by Remove Ads / Club / recent rewarded / consent |

## Consent / ATT

- `ConsentProvider` + UMP-style AdsConsent when native module present
- App continues if consent fails/unavailable
- ATT via `expo-tracking-transparency` on iOS only; denial does not block non-personalized ads
- Settings: Privacy and Ads section + Report an Ad

## AdMob test-mode status

**Using Google sample / test app IDs by default.** Production unit IDs only when `production` env + flags + valid configured IDs.

## SSV status

Edge Function `supabase/functions/admob-reward-callback/` + tables/RPCs in migrations `0016`–`0021` exist **locally**. ECDSA verification **not** exercised against AdMob’s testing tool in this environment → **not production-ready**.

## Purchase products (code)

Stable IDs:

- `numberrush.gems_80` / `_450` / `_1000` / `_2500`
- `numberrush.remove_ads`
- `numberrush.starter_bundle`
- `numberrush.club.monthly` / `.annual` (behind `subscriptionsEnabled`)

Server map also accepts short aliases (`gems_80`, `remove_ads`, …).

## RevenueCat / fulfillment

- Client: `PurchasesProvider`, offerings, restore, guest warn, test-mode mock offerings labeled **MONETIZATION TEST MODE**
- Server: `revenuecat-webhook` + `purchase_transactions` + entitlement RPCs (**local only**)
- Fulfillment is webhook-authoritative for authenticated users; client never trusts claimed gem amounts

## Remove Ads / Starter Bundle / Club

| Product | Status |
|---------|--------|
| Remove Ads | Implemented (blocks interstitials; rewarded remain) |
| Starter Bundle | Mapped (500 gems + inventory + remove_ads); one-time server claim |
| Number Rush Club | Architecture + docs only; **disabled** until launch checklist |

## Restore / refunds

- Restore Purchases in Shop + Settings
- Refund recording RPC + webhook paths documented; not live-tested

## Supabase (local only — do not remote-apply without confirmation)

Migrations: `0016`–`0021` (opportunities, ad transactions, purchases, entitlements, RPC, RLS)  
Functions: `admob-reward-callback`, `revenuecat-webhook`

## Validation results (this run)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS |
| `npm run test:ci` | **92 passed** / 23 suites |
| `npx expo-doctor` | **20/20** |
| `npx expo config --type public` | PASS (test AdMob IDs resolved) |
| `npx expo export --platform web` | PASS |
| AdMob SSV live verify | **NOT RUN** |
| RevenueCat sandbox purchase | **NOT RUN** |
| Remote Supabase migrate | **NOT RUN** (by design) |
| Paid EAS build | **NOT RUN** (by design) |

## Manual dashboard steps remaining

1. Dedicated Number Rush AdMob apps + rewarded/interstitial units + privacy messages + SSV URL + test devices  
2. RevenueCat project + store apps + products + entitlements (`remove_ads`, `number_rush_club`) + offerings + webhook secret  
3. App Store Connect / Play Console IAP products + license testers / sandbox  
4. Assign `android.package` / `ios.bundleIdentifier` (still **MISSING**)  
5. Host Privacy Policy / Terms URLs; finalize ATT copy  
6. Dev-client EAS build (approval required) for real ad/IAP QA  

## Privacy blockers

- Package / bundle identifiers missing  
- Policy drafts not hosted  
- ATT string needs legal review  
- Consent/UMP production messages not configured in AdMob  
- SSV signature path unproven  

## Exact next commands (after approval)

```bash
# Local validation (already green)
npm run types && npm run test:ci && npx expo-doctor && npx expo export --platform web

# Dev client only when approved (paid cloud build)
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform ios --profile development

# Number Rush Supabase project only — never sports/draft projects
# supabase db push   # only with explicit confirmation
# supabase functions deploy admob-reward-callback revenuecat-webhook
```

## Known limitations

See `docs/KNOWN_LIMITATIONS.md`. Real ads/purchases require a **development build**, not Expo Go. Competitive modes remain non-pay-to-win (no power-ups / paid revive in Daily or Ranked).
