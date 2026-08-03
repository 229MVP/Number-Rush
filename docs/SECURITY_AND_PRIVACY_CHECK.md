# Security & Privacy Check (Sellable Template)

**Scan date:** 2026-08-02
**Scope:** Entire repository (excluding `node_modules/`), before curating `release/`.

Statuses used: `Safe` · `Potential issue` · `Removed` · `Buyer must configure`

| Check | Result | Notes |
|---|---|---|
| `sbp_` (Supabase personal access token prefix) | Safe | No matches anywhere in the repo. |
| `SUPABASE_ACCESS_TOKEN` | Safe | No matches. |
| `SUPABASE_DB_PASSWORD` | Safe | No matches. |
| `service_role` | Safe | Every occurrence is either a SQL `GRANT ... TO service_role` statement, an Edge Function reading `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` (server-only runtime env, no literal value committed), or documentation warning against exposing it client-side. No secret value is committed anywhere. |
| Database connection strings (`postgres://user:pass@…`, `mongodb://…`) | Safe | No matches. |
| Personal email addresses (`@gmail.com`, `@outlook.com`, etc.) | Safe | No matches. |
| Private API keys (Stripe `sk_live_`/`sk_test_`, GitHub `ghp_`/`gho_`, Slack `xox*-`) | Safe | No matches. |
| Private key blocks (`-----BEGIN … PRIVATE KEY-----`) | Safe | No matches. |
| Committed `.env` files | Safe | None found; only `.env.example` (names only, no values) is tracked. |
| AdMob / RevenueCat live keys | Safe | Only placeholder Google **test** AdMob app IDs appear in monetization reference code (`app.config.ts`'s disabled branch), which are Google's own published sample IDs, not a real account. No RevenueCat key values are committed. |
| Apple / EAS credentials | Safe | None found. `.eas/workflows/e2e-tests.yml` contains no secrets. |
| Cursor/IDE configuration | Safe | `.claude/settings.json` contains only a plugin toggle, no private data. |
| `assets/fonts/*.import`, `assets/icons/*.import` (Godot metadata) | Removed from release | Not secrets, but excluded from `release/` as irrelevant clutter from an unrelated Godot project (see `KNOWN_LIMITATIONS.md`). |
| Supabase project link metadata (`supabase/.temp/`, `.supabase/`) | Safe | Gitignored; not present in a committed state. |
| `android.package` / `ios.bundleIdentifier` | Buyer must configure | Intentionally unset — see `CUSTOMIZATION_GUIDE.md`. Never invented on the buyer's behalf. |
| Hosted Privacy Policy / Terms URLs | Buyer must configure | Draft-only text exists in `docs/privacy-policy-draft.md` / `docs/terms-draft.md` for the (disabled) connected-backend product; not required for the local-only template but required if the buyer re-enables backend features and submits to a store. |

## Conclusion

No private credentials, tokens, or personal information were found anywhere
in the repository. The only cleanup performed for the release folder is
removing unrelated Godot-port asset metadata files, which contain no secrets
— they're excluded purely for professionalism/clutter, not security.
