# Ranked scoring tests — intentionally deferred

Ranked match flow, RP brackets, division promotion/demotion, and Blaze display are **not implemented** in this codebase (`RankedScreen` / `LeaderboardScreen` are Coming Soon stubs).

What exists today:
- Soft-currency reward formulas via `calculateRankedReward` in `src/progression/gameRewards.ts` (unit-tested in `gameRewards.test.ts`)
- No Ranked Points engine, no divisions, no win/loss streak persistence for ranked matches

Do **not** invent RP bracket tests until a Ranked gameplay phase lands. Treat full Ranked scoring coverage as **BLOCKED / NOT APPLICABLE** for beta readiness.
