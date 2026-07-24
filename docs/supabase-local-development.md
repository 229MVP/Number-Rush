# Supabase Local Development — Number Rush

## Prerequisites

- Supabase CLI (`npx supabase` or installed binary)
- Docker for local stack
- Expo SDK 57 app in this repo

## Commands (local only)

```bash
# From repo root
npx supabase init   # if config missing
npx supabase start
npx supabase db reset   # applies migrations + seed.sql
npx supabase functions serve validate-run --env-file supabase/.env.local
```

Copy local API URL + anon key from `supabase status` into `.env` as `EXPO_PUBLIC_*` values.

## Do not

- `supabase db reset` against a remote production project
- Push migrations remotely without explicit confirmation
- Apply Number Rush SQL to non–Number Rush Supabase projects

## Tests

See `docs/supabase-test-plan.md`. Unit tests mock Supabase and do not require local Docker.

## Remote apply (manual approval required)

```bash
npx supabase link --project-ref <NUMBER_RUSH_PROJECT_REF>
npx supabase db push   # ONLY after confirmation
npx supabase functions deploy validate-run
npx supabase functions deploy delete-account
```
