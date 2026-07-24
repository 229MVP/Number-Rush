# Supabase Test Plan — Number Rush

**Status:** Plans only. Database / RLS tests are **NOT PASSED** until run against a local or linked Number Rush Supabase environment.

## Auth / client unit tests (Jest)

Covered in-repo with mocks:

- Guest startup / session timeout → guest
- Migration merge helpers
- Run validator
- Feature flags when Supabase absent

## SQL / integration cases (run locally)

| Case | Expected |
|------|----------|
| New auth user trigger | Creates profiles, progress, inventory, statistics, ranked_profiles |
| Username uniqueness | `NeonPlayer` / `neonplayer` conflict via `claim_username` |
| Player A cannot SELECT Player B private rows | RLS denies |
| Player A cannot UPDATE coins / ranked_points directly | RLS denies |
| Anonymous cannot read private tables | Denied |
| `get_daily_leaderboard` | Only `accepted`, safe fields, no email |
| Duplicate daily `(user_id, date_key)` | Rejected |
| Duplicate `run_id` | Rejected |
| Reused ranked ticket | Rejected |
| `validate-run` replay mismatch | `rejected` |
| Economy `transaction_id` unique | Second insert fails |
| `delete_my_account_data` + delete-account function | Owned rows + auth user removed |

## How to run (when Docker available)

```bash
npx supabase start
npx supabase db reset
# Optional: pgTAP or SQL scripts under supabase/tests/
```

Do not mark this document’s SQL cases as PASS without executing them.
