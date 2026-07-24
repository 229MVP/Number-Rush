# Number Rush — Monetization Dashboard Setup

## RevenueCat

1. Create project; set **app user id** = Supabase `auth.users.id` (UUID string).
2. Configure products matching SQL map: `gems_80`, `gems_450`, `gems_1000`, `gems_2500`, `starter_bundle`, `remove_ads`.
3. Webhook URL: `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`
4. Authorization header: `Bearer <REVENUECAT_WEBHOOK_AUTH_SECRET>` (set in Supabase Edge secrets).
5. Enable sandbox events in staging (`REVENUECAT_ALLOW_SANDBOX=true`); use `REVENUECAT_PRODUCTION_ONLY=true` in production if desired.

## AdMob SSV

1. Enable server-side verification on rewarded ad units.
2. Callback URL: `https://<project-ref>.supabase.co/functions/v1/admob-reward-callback`
3. Pass `custom_data` JSON with `opportunity_id` from `create_ad_reward_opportunity`.
4. Set Edge secrets: `ADMOB_SSV_STRICT=true` (production), optional `ADMOB_SSV_ALLOW_UNVERIFIED=false`.

## Supabase

- Apply migrations `0016`–`0021` locally first; deploy to Number Rush project when ready.
- Deploy Edge Functions with `supabase functions deploy admob-reward-callback revenuecat-webhook`.
- Grant **no** `service_role` key to mobile client.

## Optional charts

- Metabase / Supabase SQL on `purchase_transactions` and `ad_reward_transactions`.
- RevenueCat charts for MRR (when Club launches).
