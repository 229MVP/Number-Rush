# Number Rush — Data Inventory

**Modes:** Guest (local) and optional Authenticated (Supabase).  
**Persistence:** AsyncStorage + SecureStore (session) on device; Supabase Postgres when configured.

## First-party data

| Category | Guest | Authenticated cloud | Public? |
|----------|-------|---------------------|---------|
| Profile XP/level/themes | Local | Synced | Level/theme may be public |
| Coins/gems/inventory | Local | Synced (server-trusted path planned) | No |
| Missions/settings | Local | Missions mergeable; settings device-local preferred | No |
| Official Daily scores | Local preview only | Server submissions | Username + score on LB |
| Ranked Points / matches | Local preview | Server-validated | Username + RP on LB |
| Email | No | Auth only | No |
| Install device ID | Local | Sync metadata | No |
| Access/refresh tokens | No | SecureStore / web storage | No |

## SDK inventory (additions)

| Package | Role | Network / PII |
|---------|------|---------------|
| `@supabase/supabase-js` | Auth + DB RPC + functions invoke | Email auth; cloud rows when signed in |
| `expo-secure-store` | Session persistence (native) | Tokens on device |
| `react-native-url-polyfill` | URL APIs for Supabase | None |
| `expo-network` | Connectivity | None |
| `expo-linking` | Magic-link callback | Auth redirect URLs |

Prior Expo/RN packages unchanged (fonts, audio, haptics, navigation, AsyncStorage, etc.).

## Explicitly not present

- Ads / IAP / push SDKs
- Service-role key in client
- Chat / friends / KYC / geolocation SDKs
