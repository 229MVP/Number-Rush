# Number Rush — EAS Update Guide (OTA)

**Goal for this phase:** Prepare OTA channels and profiles. **Do not publish** an update until store IDs and a signed binary exist.

## Prerequisites

- Expo SDK 57 project (`expo ~57.0.8`)
- EAS CLI authenticated locally (`eas login`) — credentials stay on the operator machine, not in repo
- `eas.json` profiles: `development`, `preview`, `production`, `e2e-test`
- **Blockers before any real OTA:** `android.package` and `ios.bundleIdentifier` must be set in Expo config (currently **MISSING**)
- **`expo-updates` is not installed yet.** After `eas init` / project link, install with:
  `npx expo install expo-updates`
  Then set `updates.url` to `https://u.expo.dev/<EAS_PROJECT_ID>` and `extra.eas.projectId` in Expo config. Do not invent a project ID.

## Runtime version

`app.json` already sets `runtimeVersion.policy: appVersion` so OTA updates stay aligned with `version` (`1.0.0`). Changing the app version requires a new binary for that runtime line.

## Channels

| Channel | Typical binary profile | Purpose |
|---------|------------------------|---------|
| `development` | `development` (dev client) | Internal tooling / `__DEV__` helpers |
| `preview` | `preview` | Closed beta / TestFlight-like Android internal |
| `production` | `production` | Store builds only |

Channels are declared on build profiles in `eas.json`. Runtime JS updates target the channel embedded in that binary.

## Binary vs OTA — what each can change

| Change type | Needs new binary | OTA (`eas update`) OK |
|-------------|------------------|------------------------|
| JS / TS screens, game logic, styles | No | Yes (same native modules) |
| Assets bundled in JS (images required via `require`) | No* | Yes* |
| New native module / Expo SDK bump | **Yes** | No |
| `app.json` icon / splash / permissions / package IDs | **Yes** | No |
| Plugin changes (`expo-audio`, etc.) | **Yes** | No |

\*Large asset swaps still need QA; prefer binary when splash/icon change.

## Prepare (do not publish yet)

```bash
# 1) Validate env + assets locally
node scripts/validateAssets.mjs

# 2) Ensure package / bundle IDs exist before first store/OTA binary (BLOCKED today)

# 3) Build a channel-aligned binary when ready (examples — run only when IDs exist)
# eas build --profile preview --platform android
# eas build --profile preview --platform ios

# 4) Draft an update WITHOUT publishing to users until QA signs off
# eas update --branch preview --message "beta prep" --json
# Prefer explicit publish only after checklist PASS:
# eas update --channel preview --message "…"
```

**This beta-readiness pass intentionally stops before publish.** Do not run production `eas update` or store submit from automation stubs.

## Safe workflow

1. Land JS changes on the beta branch.
2. Smoke-test Classic + Daily on a **preview** binary.
3. Confirm Ranked / Leaderboard still show Coming Soon (no false online claims).
4. Only then publish OTA to `preview`.
5. Promote to `production` channel only from a production binary after store approval.

## Rollback

- Publish a previous known-good update to the same channel, or
- Ship a new binary pinning an older runtime version.

## Related

- `docs/BETA_RELEASE_CHECKLIST.md`
- `docs/KNOWN_LIMITATIONS.md`
- `.eas/workflows/e2e-tests.yml` (manual Maestro stub — not auto-publish)
