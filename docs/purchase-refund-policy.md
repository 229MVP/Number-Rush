# Number Rush — Purchase Refund Policy (Draft)

**Status:** Engineering draft — align with store policies and counsel before launch.  
**Backend:** `record_purchase_refund` RPC + RevenueCat `REFUND` / `CANCELLATION` webhook handling.

## Principles

1. **Idempotency** — Replayed refund webhooks must not double-claw balances.
2. **Best-effort clawback** — Gems and consumable inventory are reduced down to zero, never negative.
3. **Entitlements** — `remove_ads` and `starter_bundle_claimed` may be revoked when the refunded SKU granted them.
4. **No real-money settlement in-game** — Refunds are processed by Apple/Google; the game adjusts virtual goods only.

## Per product

| Product | On refund |
|---------|-----------|
| `gems_*` | Claw back up to `gems_granted` (capped by current balance) |
| `starter_bundle` | Claw back bundle gems/inventory; clear `starter_bundle_claimed` and `remove_ads` if bundle was the source |
| `remove_ads` | Set `remove_ads = false` when that SKU was the entitlement source |

## Unsupported / edge cases

- Partial refunds from stores are treated as full virtual clawback for the mapped grant.
- Spent currency cannot be recovered; support may apply manual economy adjustments outside this RPC.
- `number_rush_club` subscription refunds clear `club_active` when enabled post-launch.

## Player communication (TODO)

- In-app help copy linking to platform refund instructions.
- Clear statement that virtual items have no cash value.
