# Screenshot Plan

Screenshots in `screenshots/` are **real captures** from the actual app (the
exported web build), not mockups. They were produced with:

```bash
npx expo export --platform web
npx serve dist -p 8756   # or: python3 -m http.server 8756 (from dist/)
node scripts/captureScreenshots.mjs
```

`scripts/captureScreenshots.mjs` is **dev-only tooling** (uses
`puppeteer-core` against a local Chrome install) — it is not part of the
shipped app and is excluded from the sellable release folder.

## Capture settings

- Viewport: **390 × 844** (iPhone-class portrait), `deviceScaleFactor: 2`
- Browser: headless Chrome via `puppeteer-core`

## Files captured

| File | Screen / moment |
|---|---|
| `01-splash.png` | Splash screen before tap-to-start |
| `02-main-menu.png` | Main Menu (PLAY / HOW TO PLAY / STATS / SETTINGS) |
| `03-gameplay.png` | Fresh Classic run, tutorial dismissed |
| `04-perfect.png` | A lane immediately after reaching exactly 21 (Perfect) |
| `05-bust.png` | A lane immediately after exceeding 21 (Bust) |
| `06-tutorial.png` | First-run tutorial, step 1 spotlight on the Current Tile |
| `07-game-over.png` | Game Over screen after 3 strikes, showing a new best |
| `08-settings.png` | Settings screen |

## Capturing your own (manual, for a real device or updated branding)

1. Run the app in dev mode or export the web build.
2. Set your browser/simulator to a 390×844 viewport (or use an actual
   iPhone-class device/simulator for native-accurate screenshots).
3. Walk through: Splash → tap to start → Main Menu → PLAY → let the tutorial
   show once → dismiss it → place tiles until you get a Perfect, then a Bust
   → continue to Game Over → Main Menu → Settings.
4. Save PNGs using the filenames above so `README.md`'s screenshot table
   keeps working.

Do not fabricate screenshots (e.g. editing text over a mockup) — always
capture from a running build.
