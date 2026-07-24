# Number Rush — Known Limitations (Live Ops phase)

## Product
- Live Ops client architecture present (remote config, events, announcements, maintenance/min-version). Server tables are **local migrations only** until explicitly applied.
- Admin dashboard is a separate `admin/` app scaffold — operators require `operator_roles`; **no service-role key in browser**.
- Season soft-reset / next-season seeding not fully automated in finalize beyond snapshot + complete.
- No live chat, clans, gambling, cash prizes, or realtime PvP.

## Store / identity
- `android.package` / `ios.bundleIdentifier` still **MISSING**.
- Privacy/Terms often unhosted drafts.

## Monetization
- Test AdMob IDs / sandbox purchases until production confirmation.
- Club subscription disabled by default.

## Ops
- Do not claim public launch readiness until RC checklist, store IDs, legal URLs, RLS tests, and staged rollout criteria PASS.
