# Number Rush — Economy Balance v1 (Monetization SKUs)

**Status:** Design baseline for IAP + rewarded ads. Tune with live metrics.

## Gem packs (consumable)

| Product ID | Gems | Notes |
|------------|------|-------|
| `numberrush.gems_80` | 80 | Entry pack |
| `numberrush.gems_450` | 450 | Mid |
| `numberrush.gems_1000` | 1000 | Better value |
| `numberrush.gems_2500` | 2500 | Best gem-pack value |

Short aliases (`gems_80`, …) are accepted by server fulfillment. Store prices come from App Store Connect / Play Console / RevenueCat — not hardcoded in the client.

## Non-consumables

| Product ID | Grant |
|------------|-------|
| `numberrush.remove_ads` | `remove_ads` entitlement (blocks forced interstitials; rewarded remain) |
| `numberrush.starter_bundle` | 500 gems; +5 mult, +5 swap, +3 bomb, +3 freeze, +2 shield; Solar Starter frame; remove_ads; **once per account** |

## Subscriptions (disabled until Club launch)

| Product ID | Entitlement |
|------------|-------------|
| `numberrush.club.monthly` | `number_rush_club` |
| `numberrush.club.annual` | `number_rush_club` |

## Sources of coins

- Classic / Daily / Ranked run rewards (mode rules apply)
- Missions
- Soft-currency shop sinks consume coins

## Sources of gems

- Progression / missions (existing)
- IAP gem packs (server fulfillment)
- Starter Bundle / Club monthly grant when enabled
- Rewarded ads only when placement + SSV (authenticated) allow

## Sinks

- Soft shop: power-ups, themes (coins/gems as cataloged)
- No competitive score purchases

## Rewarded ads

| Placement | Reward |
|-----------|--------|
| `classic_revive` | Restore 1 strike (Classic only, once/run) |
| `double_classic_coins` | Bonus coins = base run coins (not XP/gems/missions) |
| `daily_free_powerup` | Player-chosen ×1 power-up (no Wild), once per UTC day |

## Interstitial policy

- Classic `classic_run_complete` only
- Skip first 2 completed Classic runs
- Eligible every 3rd completed Classic run
- 8-minute cooldown, max 5 / UTC day
- Blocked by Remove Ads, Club, recent rewarded, consent, non-Classic modes

## Competitive restrictions

Daily and Ranked disable inventory power-ups. No paid revive, score multipliers, extra Daily attempts, or Ranked Point boosts. See `docs/competitive-monetization-policy.md`.

## Areas requiring beta data

- Rewarded opt-in / completion rates
- Interstitial abandonment
- Gem pack ARPU and Remove Ads conversion
- Whether Starter Bundle price points need retune
