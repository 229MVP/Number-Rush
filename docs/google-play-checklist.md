# Google Play — Beta Checklist

## Blockers

| Item | Status |
|------|--------|
| `android.package` in Expo config | **BLOCKED — MISSING** (do not invent) |
| `android.versionCode` | **MISSING** |
| Signed AAB via EAS `production` / `preview` | Not built (needs package ID) |
| Store screenshots (min required) | **MISSING** (folder empty) |
| Privacy Policy URL | DRAFT only — host before production |
| Data safety form | Not submitted — base on `data-inventory.md` |

## Release config

| Item | Status / action |
|------|-----------------|
| Expo SDK 57 | Present |
| App version `1.0.0` | Present |
| Adaptive icon assets | Present & wired |
| Splash asset | File present — **not wired** in `app.json` |
| `eas.json` profiles | Added — no secrets in repo |
| Play App Signing | Operator Play Console |

## Content & policy

| Item | Notes |
|------|-------|
| Listing copy | Use `store-listing.md` — no fake multiplayer/cash |
| Ranked / Leaderboard | Disclose Coming Soon if shown in screenshots |
| Ads declaration | No ads SDK |
| IAP / Paid features | No billing SDK; soft currency local only |
| Target API / policies | Follow current Play target API when building |
| Families / Designed for families | Not configured — default general audience |

## QA before closed testing

| Item | Expectation |
|------|-------------|
| Splash → Menu | Works |
| Classic run + pause/resume | Works |
| Daily official + practice | Works locally |
| Ranked / Ranks tab | Coming Soon stubs |
| Settings resets | Local only |
| Offline play | Expected (no backend) |
| Maestro smoke | `.maestro/*.yml` after `appId` set |

## Submit path (when unblocked)

1. Set `android.package` + versionCode.
2. `eas build --profile preview --platform android`
3. Upload to internal / closed testing.
4. Complete Data safety from inventory (local-only).
5. Attach privacy URL when hosted.
6. Promote — **do not** claim online Ranked.
