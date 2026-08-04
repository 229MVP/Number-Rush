# Live Operations & Launch — Project Audit

**Date:** 2026-07-24  
**Branch:** `cursor/live-operations-launch-dca3`  
**Status:** Pre-implementation audit. No production deploy from this document.

## Schema

| Item | Value |
|------|-------|
| Migrations present | `0001`–`0021` |
| Local player schema | `LOCAL_PLAYER_SCHEMA_VERSION = 1` |
| Cloud player schema | `CLOUD_PLAYER_SCHEMA_VERSION = 1` |
| Known SQL bug | `0004_player_inventory.freeze` unquoted (reserved keyword) — blocks `db push` |
| Seasons | `ranked_seasons` + seed `season-1` (`0015`); minimal columns |
| Announcements / events / remote config / operator roles | **Missing** |
| Admin tables | **Missing** |

## Connected features (present in codebase)

- Auth / guest, cloud sync, validate-run Edge Function sources
- Live Daily / Ranked leaderboard services behind flags
- Monetization architecture (AdMob + RevenueCat) with test IDs / sandbox posture
- Soft economy, missions, shop, themes, power-ups

## Gaps for Live Ops

| Area | Status |
|------|--------|
| Remote configuration | None |
| Server clock RPC | None |
| Season history / soft reset / rewards | Incomplete |
| Limited-time events | None |
| Announcements / News UI | None |
| Maintenance / min-version | None |
| Operator roles + audit | None |
| Internal admin app | None (`admin/` / `apps/admin` absent) |
| Leaderboard / username moderation | None |
| Anti-cheat review queue | None |
| Player support admin tools | None |
| Beta allowlist + server feedback | Local share-only feedback |
| Release-candidate validator | Missing |

## Identifiers & store

| Item | Status |
|------|--------|
| `android.package` | **MISSING** |
| `ios.bundleIdentifier` | **MISSING** |
| Privacy / Terms URLs | Draft / often empty env |
| Support URL | Not standardized |
| Production icons / splash | Present assets; production polish TBD |

## Security blockers

- Do not put service-role keys in Expo or browser admin
- RLS must remain player-scoped; operators via role-checked RPCs / Edge Functions
- Remote migrations / Edge deploys require explicit approval
- Linked remote may be Number Rush (`ptwanezaoldtqlougcig`) — still treat deploys as gated

## Monetization blockers (carry-forward)

- Test AdMob IDs; SSV / RevenueCat webhook not production-proven
- Club subscription disabled
- Package / bundle IDs missing
- Hosted legal docs missing

## Mock / preview posture

- Feature flags gate connected features when Supabase unset
- Monetization uses test ads / MONETIZATION TEST MODE without production keys
- Classic offline remains primary offline path

## Audit conclusion

Implement Live Ops as additive local migrations (`0022+`), client providers with safe defaults, and a separate admin app. **Do not** auto-apply remote schema, production ads, or store builds.
