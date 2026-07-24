# Number Rush — Monetization Test Plan

**Last updated:** 2026-07-24

| Area | Status |
|------|--------|
| SQL migrations `0016`–`0021` applied locally | **NOT PASSED** |
| Edge `admob-reward-callback` deployed & SSV test tool | **NOT PASSED** |
| Edge `revenuecat-webhook` sandbox purchase | **NOT PASSED** |
| Client IAP SDK wired | Out of scope (backend-only deliverable) |

## SQL (local `supabase db reset`)

1. Authenticated user calls `create_ad_reward_opportunity` → row with `expires_at` ≈ now + 15m.
2. `apply_verified_ad_reward` (service role) with valid opportunity → `verified`, gems/inventory updated, opportunity consumed.
3. Replay same `admob_transaction_id` → `duplicate`, no double grant.
4. Expired opportunity → `rejected`.
5. `apply_purchase_fulfillment` for each gem SKU → correct `gems_granted`.
6. `starter_bundle` twice → second call errors.
7. `number_rush_club` → errors (disabled).
8. `record_purchase_refund` → status `refunded`, partial clawback.
9. RLS: user A cannot `SELECT` user B monetization rows.

## Edge — AdMob

1. Google AdMob SSV test callback with valid signature → 200 `verified`.
2. Tampered signature with `ADMOB_SSV_STRICT=true` → 401.
3. Missing opportunity → 400 / `rejected` ledger row.

## Edge — RevenueCat

1. Missing `Authorization` → 401.
2. Sandbox `INITIAL_PURCHASE` gems_80 → fulfillment row.
3. Duplicate event id → idempotent 200.
4. Unknown `product_id` → 422, no grant.
5. `REFUND` event → `record_purchase_refund`.

## Regression

- `delete_my_account_data` removes monetization tables.
- `get_my_monetization_entitlements` returns defaults for new users.
