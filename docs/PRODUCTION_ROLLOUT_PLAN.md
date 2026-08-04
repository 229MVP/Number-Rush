# Production Rollout Plan

Stages: Internal → Closed beta → Open testing (where available) → 5% → 20% → 50% → 100%.

Review each stage: crash rate, auth/sync failures, Daily/Ranked submission failures, purchase/ad fulfillment, retention, reviews, support volume.

Platform staged rollout controls differ (Play vs App Store) — document store-specific steps at release time.

Rollback thresholds: SEV1 crash/auth outage → maintenance mode + halt rollout; SEV2 economy exploit → disable purchases/events remotely.
