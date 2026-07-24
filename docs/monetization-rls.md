# Number Rush — Monetization RLS & RPC Surface

**Status:** Local migrations `0016`–`0021` (not applied remotely in this workspace phase).  
**SQL integration:** NOT PASSED until `supabase db reset` / migration apply is run locally.

## Tables

| Table | Client SELECT | Client writes |
|-------|---------------|---------------|
| `ad_reward_opportunities` | Own rows (`user_id = auth.uid()`) | None — use `create_ad_reward_opportunity()` |
| `ad_reward_transactions` | Own rows | None — AdMob Edge + `apply_verified_ad_reward` |
| `purchase_transactions` | Own rows | None — RevenueCat Edge + `apply_purchase_fulfillment` |
| `monetization_entitlements` | Own row | None — fulfillment RPCs only |

`REVOKE ALL` + `GRANT SELECT` mirrors `economy_transactions`: defense in depth with RLS.

## RPC grants

| Function | Role | Notes |
|----------|------|-------|
| `create_ad_reward_opportunity(placement, reward_payload)` | `authenticated` | 15-minute TTL; embed `id` in AdMob `custom_data` |
| `get_my_monetization_entitlements()` | `authenticated` | Upserts default entitlement row |
| `apply_verified_ad_reward(...)` | `service_role` only | Validates opportunity + idempotent AdMob `transaction_id` |
| `apply_purchase_fulfillment(...)` | `service_role` only | Product map in `0020_monetization_rpc.sql` |
| `record_purchase_refund(...)` | `service_role` only | Claws back granted gems/inventory where possible |

Edge Functions use the **service role** Supabase client; never ship that key in the Expo app.

## Opportunity flow

1. Client calls `create_ad_reward_opportunity` with `reward_payload` e.g. `{"reward_item":"gems","reward_amount":15}`.
2. Client passes `opportunity_id` (UUID) to AdMob as `custom_data` (JSON string recommended).
3. AdMob SSV hits `admob-reward-callback`; Edge verifies ECDSA signature and calls `apply_verified_ad_reward`.
4. RPC marks opportunity `consumed_at`, appends `ad_reward_transactions`, and posts an `economy_transactions` ledger row.

## Account deletion

`delete_my_account_data()` (updated in `0020`) deletes monetization rows before profile teardown.
