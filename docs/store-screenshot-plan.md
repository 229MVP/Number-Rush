# Number Rush — Store Screenshot Plan

**Target count:** 8 frames  
**Device frames:** Phone portrait (Play: 1080×1920 or similar; App Store: 6.7" + 6.5" sets later)  
**Output folder:** `assets/store-screenshots/` (**currently empty**)

Capture from a **preview** build with placeholder audio acceptable. Do **not** imply online Ranked or live global boards.

| # | Filename (planned) | Screen / state | Caption idea | Notes |
|---|--------------------|----------------|--------------|-------|
| 1 | `01-splash.png` | Splash — logo + “TAP TO START” | NUMBER RUSH | Brand-first; full-bleed neon |
| 2 | `02-main-menu.png` | Main Menu with PLAY / Daily / Ranked / Shop | Choose your rush | Ranked button OK; do not caption as live competitive |
| 3 | `03-classic-gameplay.png` | Classic mid-run (lanes + HUD + tray) | Stack to the target | Core loop |
| 4 | `04-powerups.png` | Gameplay with power-up tray emphasized / Power-Ups screen | Bomb, Freeze, Shield, Wild | Show local inventory fantasy only |
| 5 | `05-daily.png` | Daily Tournament lobby or results | Daily challenge (local) | Caption must say local / daily puzzle — not global prizes |
| 6 | `06-missions-shop.png` | Missions **or** Shop soft-currency tab | Missions & upgrades | No real-money pack emphasis |
| 7 | `07-profile.png` | Profile — level, XP, stats | Your local progress | On-device progression |
| 8 | `08-ranked-coming-soon.png` | Ranked **Coming Soon** stub screen | Ranked — Coming Soon | Honest state; do not mock fake divisions as live |

## Optional alternates

- Settings (audio / haptics) — accessibility story
- Game Over with combo stats — skill fantasy
- Leaderboard Coming Soon — only if needed to set expectations

## Capture rules

1. Use English UI.
2. Prefer high-contrast neon look; avoid empty debug overlays / `__DEV__` panels.
3. No personal emails or real account UI (none exists).
4. If a frame includes Ranked or Ranks tab, the **Coming Soon** treatment must be visible.
5. Do not composite fake online player lists.

## Checklist

- [ ] All 8 PNGs exported to `assets/store-screenshots/`
- [ ] Play feature graphic (separate) planned
- [ ] `node scripts/validateAssets.mjs` warning cleared for screenshots
