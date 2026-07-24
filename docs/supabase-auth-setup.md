# Supabase Auth Setup — Number Rush

## Project note

Create a **dedicated Number Rush** Supabase project. Do **not** apply these migrations to unrelated linked projects.

## Dashboard steps

1. Create project → copy Project URL + anon (publishable) key into `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Auth → Providers → Email → enable **Magic Link** (OTP email).
3. Auth → URL configuration → Redirect URLs:
   - `numberrush://auth/callback`
   - `exp://127.0.0.1:8081/--/auth/callback` (Expo Go local, adjust port)
   - `http://localhost:8081/auth/callback` (web)
   - Production web origin + `/auth/callback` when hosted
4. Site URL: your primary app URL (or Expo web URL during beta).
5. Apply local migrations (`supabase db reset` / `supabase db push` **only** after linking the Number Rush project).
6. Deploy Edge Functions:
   - `supabase functions deploy validate-run`
   - `supabase functions deploy delete-account`
7. Never put `service_role` in the Expo client.

## Client flow

1. `signInWithMagicLink(email)` with `emailRedirectTo` = `numberrush://auth/callback`
2. User opens email → deep link → `AuthCallback` screen restores session
3. `CloudSync` / Account screens handle first migration

## Local magic links

With `supabase start`, Inbucket captures emails (see CLI output for URL).
