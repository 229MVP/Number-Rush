# Number Rush — Monetization Metrics

## Core KPIs

| Metric | Source |
|--------|--------|
| IAP revenue (gross) | RevenueCat dashboard |
| Conversion rate | Store analytics + RC cohorts |
| ARPDAU / ARPPU | RC + internal DAU |
| Refund rate | `purchase_transactions.status = 'refunded'` |
| Ad fill / eCPM | AdMob mediation |
| SSV success rate | `ad_reward_transactions.verification_status = 'verified'` |
| SSV reject/duplicate | `rejected`, `duplicate`, `error` counts |

## SQL snippets (run after migrations applied)

```sql
-- IAP volume by product (last 7 days)
SELECT product_id, count(*), sum(gems_granted)
FROM purchase_transactions
WHERE created_at > now() - interval '7 days'
  AND status = 'completed'
GROUP BY 1;

-- Ad reward health
SELECT verification_status, count(*)
FROM ad_reward_transactions
WHERE created_at > now() - interval '7 days'
GROUP BY 1;
```

## Alerts (suggested)

- Spike in `duplicate` AdMob transactions (fraud or misconfigured placement).
- Unknown `product_id` webhook 422 rate > 0 in production.
- Refund rate above platform baseline.
