# Number Rush — Data Inventory (SDKs & Local Processing)

**App mode:** Local-only beta — no Number Rush backend, accounts, IAP validation, ads, or push.  
**Persistence:** `@react-native-async-storage/async-storage` on device.

## First-party local data categories

| Category | Examples | Leaves device? |
|----------|----------|----------------|
| Progress | XP, level, coins, gems, inventory, themes, best score | No |
| Daily | Official/practice attempt flags, local scores, date key | No |
| Missions | Daily/weekly completion + claim state | No |
| Settings | Music/SFX volumes, haptics, reduced motion, high contrast | No |
| Economy ledger | Local transaction IDs / history (duplicate protection) | No |
| Username display | Local profile display name generator | No |

## SDK / library inventory

| Package | Role | May process / access | Network / PII |
|---------|------|----------------------|---------------|
| `expo` (~57) | Runtime, tooling, native modules bridge | App config, updates machinery when EAS Update configured | OTA only if operator publishes; no user accounts |
| `react` / `react-native` | UI runtime | In-memory UI state | No |
| `@react-native-async-storage/async-storage` | Key-value persistence | Local progress / settings keys | Device-local only |
| `@react-navigation/native` + `native-stack` | Navigation | Route names / params in memory | No remote telemetry by default |
| `expo-font` + `@expo-google-fonts/*` | Font loading | Font assets bundled / loaded for rendering | Font packages are assets; no user content upload |
| `expo-audio` | Music / SFX playback | Local audio files; playback session | No cloud audio |
| `expo-haptics` | Tactile feedback | Requests OS haptic patterns when enabled | No PII |
| `@react-native-community/slider` | Volume controls | Touch input → numeric values in settings | No |
| `react-native-svg` | Vector icons / shapes | Render-only | No |
| `expo-linear-gradient` | Visual gradients | Render-only | No |
| `expo-status-bar` | Status bar style | UI chrome | No |
| `expo-asset` | Asset loading peer for audio/media | Bundled asset resolution | No |
| `expo-splash-screen` | Native splash presentation | Splash image config | No |
| `react-native-safe-area-context` | Insets | Layout metrics | No |
| `react-native-screens` | Native screen containers | Navigation presentation | No |
| `lucide-react-native` | Icon components | Render-only | No |
| `react-native-web` / `react-dom` | Web target | Same local logic in browser storage model | Still no NR backend |

## Explicitly not present

- Auth / identity SDKs
- Analytics vendor SDKs (adapter is no-op / local debug)
- Crash reporter vendor (flag exists; no vendor wired)
- Ad mediation / attribution
- IAP / billing SDKs
- Push notification services

## Beta feedback

`BetaFeedbackScreen` formats a report for the user to **share via OS Share sheet**. Nothing is submitted to a Number Rush server from that screen.

## When this inventory must be updated

- Adding any network API, account system, analytics, ads, or IAP
- Enabling EAS Update in production (document update CDN as infrastructure processing of JS bundles — not player save data)
- Wiring privacy policy / terms URLs that load remote pages
