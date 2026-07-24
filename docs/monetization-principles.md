# Number Rush — Monetization principles

Product rules implemented by the client monetization core (`src/monetization`, `src/ads`, `src/purchases`, `src/consent`).

## Ads

- **Never block app startup.** Ad SDK initialization runs after consent with a short timeout; fonts and navigation proceed independently.
- **Development and preview** always use Google **official test ad unit IDs** unless the app environment is `production` with ads enabled, valid env unit IDs, and feature flags on.
- **Rewarded placements:** `revive` (once per run), `double_coins` (grants base coins only), `daily_free_powerup` (once per UTC day).
- **Interstitials** show on classic run end only when policy allows: **2 free runs**, then every **3** completed classic runs, **8 minute** cooldown, **5 per UTC day** cap. Remove Ads entitlement skips interstitials.
- **No double-show:** concurrent rewarded or interstitial requests are ignored; ads reload after close.
- **Web / missing native module:** ads report `adsAvailable: false` via safe adapters.

## Consent & privacy

- UMP/consent and ATT are best-effort; failures degrade to stubs (`notRequired` in `__DEV__`, `unavailable` when modules missing).
- ATT is **not** requested on splash; optional `requestTrackingIfNeeded` after gameplay is active.
- `canRequestAds` stays **true** in test builds except explicit error; production personalized ads require obtained/notRequired consent.
- Never log API keys, SSV secrets, or webhook tokens in the client.

## Purchases

- RevenueCat identifies **Supabase user id** when authenticated; anonymous otherwise.
- **No hardcoded prices** in UI — merchandising copy only; store/RevenueCat supplies localized pricing.
- **Entitlements:** `removeAds`, `clubActive` (subscription).
- **MONETIZATION TEST MODE** (`__DEV__` without RevenueCat keys): mock offerings labeled explicitly; purchases queue safe pending records locally.
- Fulfillment of gems/coins/inventory remains **server-authoritative**; `productRewardMap` is display-only.

## Economy caps

- Inventory power-ups clamp at **9999** per type when applying rewards.
- Gem pack sizes: 50 / 120 / 300 / 750 for small → mega.
- Starter bundle: 100 gems, 5000 coins, multiplier×3, swap×3, bomb×1.

## Analytics

- Ad and purchase lifecycle events are typed in `analyticsTypes.ts` and must not include PII or secrets.
