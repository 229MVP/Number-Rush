# Number Rush — Known Limitations (Beta)

## Product

- **Ranked** is a Coming Soon stub (no divisions, RP, or match engine).
- **Leaderboard / Ranks** tab is a Coming Soon stub (Daily has a local mock board only).
- **No accounts**, cloud save, friends, or cross-device sync.
- **No ads** and **no real-money IAP** (coin/gem packs show as coming later).
- Daily “tournament” is a **local seeded daily puzzle**, not a networked competition with prizes.

## Technical

- Persistence is **AsyncStorage only** — clearing app data wipes progress.
- `android.package` and `ios.bundleIdentifier` are **MISSING** (store blockers).
- Native splash is **not wired** in Expo config (in-app splash still runs).
- Audio is **placeholder synthesized WAV** content.
- Analytics / error reporting have **no remote vendor** wired by default.
- `__DEV__` helpers can alter local progression / daily state in development builds.
- Store screenshot set is **not produced** yet.
- OTA: channels prepared in docs/`eas.json`; **do not publish** until binaries with real IDs exist.

## Design / assets

- `design_reference/` is preserved for UI reference — not the runtime entry.
- Some icon assets exist both as PNG/SVG while UI primarily uses Lucide.

## Documentation

- Privacy Policy and Terms in-app / under `docs/*-draft.md` are **DRAFT**.
- iOS privacy API strings must be verified from a real binary — not invented in docs.
