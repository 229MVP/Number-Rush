# Number Rush — Analytics Event Schema

**Status:** Local / no-op adapter in production by default. Dev may log via `devLoggerAdapter` when `EXPO_PUBLIC_ANALYTICS_ENABLED=true` or non-production `__DEV__`.  
**Source of truth:** `src/analytics/analyticsTypes.ts`  
**Transport:** None today — no third-party analytics SDK is installed. Events must not assume network delivery.

Payload type: `AnalyticsPayload = Record<string, string | number | boolean | null>`.

---

## Events

| Event | When | Recommended payload keys | Notes |
|-------|------|--------------------------|-------|
| `app_opened` | App root / analytics provider mount | `env`, `version`, `platform` | Fired once per cold start when provider is wired |
| `screen_viewed` | Screen focus | `screen` (route name) | Use `RootStackParamList` names |
| `tutorial_started` | Classic tutorial overlay shown | `mode` (`classic`) | |
| `tutorial_completed` | Tutorial finished or skipped | `mode`, `completed` (bool) | |
| `run_started` | Gameplay session begins | `mode` (`classic` \| `daily` \| `ranked`), `seed?`, `officialAttempt?` | Ranked mode UI is Coming Soon — event reserved |
| `run_completed` | Run ends (bust / quit / clear) | `mode`, `score`, `reason`, `tilesPlaced`, `maxCombo`, `isNewBest` | |
| `powerup_used` | Power-up consumed in run | `type` (`multi` \| `swap` \| `bomb` \| `freeze` \| `shield` \| `wild`), `mode` | |
| `daily_attempt_started` | Official or practice Daily start | `dateKey`, `officialAttempt`, `seed` | Daily works locally |
| `daily_attempt_completed` | Daily run finished | `dateKey`, `officialAttempt`, `score`, `forfeit?` | Local mock board only |
| `ranked_match_started` | Reserved | `division?`, `season?` | **Not live** — Ranked is Coming Soon stub |
| `ranked_match_completed` | Reserved | `rpDelta?`, `result?` | **Not live** |
| `ranked_promotion` | Reserved | `fromDivision?`, `toDivision?` | **Not live** — SFX asset exists as placeholder |
| `mission_claimed` | Mission reward claimed | `missionId`, `period` (`daily` \| `weekly`), `rewardCoins?`, `rewardGems?` | Local missions |
| `virtual_item_purchased` | Soft-currency shop purchase | `itemId`, `itemType`, `currency` (`coins` \| `gems`), `price` | Real-money packs blocked (`coming later`) |
| `theme_selected` | Active theme changed | `themeId` | Local unlock only |
| `setting_changed` | Settings patch | `key`, `value` | Avoid logging PII |
| `error_caught` | Error boundary / reporter | `name`, `message`, `fatal` (bool) | No stack in production payloads |

---

## Privacy rules

- Do **not** attach usernames, device IDs, emails, or raw storage dumps.
- Analytics is **off** for production unless explicitly enabled via env (still no remote backend wired).
- Ranked / global leaderboard events must not be treated as proof of online multiplayer — those features are stubs.

## Implementation notes

- `trackEvent` never throws into gameplay (`analyticsService.ts` swallows adapter errors).
- Adding a remote adapter later requires updating `docs/data-inventory.md` and privacy docs.
