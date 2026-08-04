# Incident Response

## Severity
- SEV1: App unusable / data corruption / privacy breach
- SEV2: Competitive integrity / payment fulfillment broken
- SEV3: Degraded feature / single mode outage

## Emergency controls (prefer remote config)
- Maintenance mode
- Disable Ranked / Daily submissions
- Disable purchases / rewarded ads / live events
- Roll back remote config by publishing previous version

## Playbooks (summary)
For each incident: detect → contain → communicate → recover → verify → postmortem.

Examples: crash storm, DB outage, auth outage, leaderboard exploit, duplicate currency, purchase delay, ad reward duplication, bad remote config, wrong min-version block, event misconfig, season finalization error, compromised operator, privacy incident.

Never put service-role keys in clients while responding.
