# Database Backup and Recovery (Draft)

- Use Supabase plan backup features once the Number Rush project plan is confirmed.
- Export schema migrations from git before every release.
- RPO/RTO targets TBD after plan confirmation — do not claim backups are active until verified in dashboard.
- Never test restore by overwriting production.
- Store buckets (event/announcement media) need separate backup consideration.
- Emergency: enable maintenance mode via remote config; disable Ranked/Daily submissions.
