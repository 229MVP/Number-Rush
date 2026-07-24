# Number Rush — Competitive Integrity & Monetization

## Goal

Monetization must not undermine **server-validated** Daily and Ranked competition.

## Rules

1. **No pay-to-win in ranked** — Gem packs and rewarded ads may grant power-ups and cosmetics, but ranked run validation (`validate-run`) does not accept client-side power-up claims that bypass server rules.
2. **Rewarded ads** — Bonuses flow only after AdMob SSV + valid `ad_reward_opportunity`. No client-side “grant gems” without server confirmation.
3. **IAP** — Fulfillment is webhook-driven; duplicate `store_transaction_id` / RevenueCat event IDs are ignored.
4. **Remove ads** — Cosmetic/UX only; does not alter leaderboard eligibility or scoring.
5. **Starter bundle** — One per account (`starter_bundle_claimed`); competitive modes still use server replay.

## Monitoring

Track verification_status rates on `ad_reward_transactions` and rejected/unknown IAP products (see `monetization-metrics.md`).
