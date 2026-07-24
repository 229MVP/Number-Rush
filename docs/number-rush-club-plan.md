# Number Rush Club — Subscription Plan

**STATUS: DISABLED UNTIL LAUNCH**

Do not enable `number_rush_club` in RevenueCat offerings or `apply_purchase_fulfillment` until this document is marked ACTIVE and product QA is complete.

## Intended benefits (draft)

- Monthly gem stipend (amount TBD in `economy-balance-v1.md`)
- Exclusive theme(s)
- Ad-free experience (stackable with `remove_ads` entitlement logic)
- Optional ranked season cosmetic badge

## Backend hooks (already reserved)

- `monetization_entitlements.club_active`
- `monetization_entitlements.club_expiration_date`
- Product id `number_rush_club` returns `enabled = false` in `private.monetization_product_fulfillment`

## Launch checklist (when enabling)

1. Set `enabled` for `number_rush_club` in SQL product map.
2. Add product to RevenueCat webhook allowlist in `revenuecat-webhook/index.ts`.
3. Configure subscription groups in App Store Connect / Play Console.
4. Run `monetization-test-plan.md` subscription cases.
5. Update Privacy Policy and Terms with subscription terms.
