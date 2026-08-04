# Number Rush — Known Limitations (Live Ops phase)

> **Product-direction note:** `main` also contains a separate **sellable
> Classic-only template** repackaging (`cursor/sellable-template-dca3`, see
> the root [`KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md)) that disables
> Daily/Ranked/Shop/backend features via `src/config/templateFeatures.ts`
> and trims the Main Menu accordingly. That posture and this Live Ops phase
> (which extends and depends on those same connected features — Ranked
> seasons, events, admin dashboard) are **not simultaneously compatible**
> without reconciliation. See the merge-conflict report for this PR for
> details; resolve product direction before merging both into `main`.

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
