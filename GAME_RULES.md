# Number Rush — Game Rules (Classic Rush 21)

## Objective

Place number tiles into one of four lanes. Land a lane's total on **exactly
21** for a Perfect clear. Go **over 21** and the lane Busts, costing a strike.
Lose all three strikes and the run ends.

## Setup (new run)

- Score: **0**
- Combo multiplier: **×1**
- Strikes remaining: **3**
- Four lane totals: **0, 0, 0, 0**
- Current tile: random **1–10**
- Next tile: random **1–10**
- Multiplier power-up: **×2** uses
- Swap power-up: **×3** uses

## Placing a tile

Tap any lane to add the **current tile's** value to that lane's total, then:

- **Current tile ← Next tile**, and a new random **Next tile (1–10)** is drawn.
- Input is locked for a short moment while the placement animation and any
  resulting Perfect/Bust feedback plays out, so a rapid double-tap cannot
  place the same tile twice.

## Outcomes

| Result | Trigger | Effect |
|---|---|---|
| **Normal** | Lane total stays under 21 | Lane keeps its new total; nothing else changes. |
| **Perfect** | Lane total reaches exactly **21** | Lane resets to 0. Perfect streak +1. Combo multiplier is recalculated from the new streak. Score += `100 × combo multiplier`. |
| **Bust** | Lane total exceeds **21** | Lane resets to 0. Combo multiplier resets to **×1**. One strike is lost. |

## Combo table

Combo multiplier is derived from the **consecutive Perfect streak** (resets
to 0 on any Bust):

| Perfect streak | Combo multiplier |
|---|---|
| 0–1 | ×1 |
| 2–3 | ×2 |
| 4–5 | ×3 |
| 6+ | ×4 |

**Example:** base Perfect reward is 100 points.
1st consecutive Perfect (streak 1) → ×1 → **100 points**
2nd consecutive Perfect (streak 2) → ×2 → **200 points**
4th consecutive Perfect (streak 4) → ×3 → **300 points**

## Game Over

Three Busts (three lost strikes) end the run. The Game Over screen shows:

- Final Score
- Best Score (saved locally; shows a "NEW BEST!" indicator when beaten)
- Perfect Clears
- Highest Combo reached this run
- Tiles Placed

**PLAY AGAIN** starts a fresh run. **MAIN MENU** returns to the menu. Neither
requires a backend or an account — everything is local to the device.

## Power-ups

### Multiplier (×2 per run by default)

- Doubles the value of the **next tile you place** (not the Next-tile preview
  itself — the currently selected/current tile).
- Tap again before placing to cancel the selection.
- Consumed only after a **successful** placement (canceling costs nothing).
- Does not change score/combo math beyond the doubled tile value feeding into
  the normal Perfect/Bust rules.

### Swap (×3 per run by default)

- Select two lanes to exchange their current totals.
- Does **not** advance the tile queue, and does **not** change score or combo.
- Tap again / select the same lane to cancel before confirming the swap.
- Consumed only after a successful swap.

Power-up counts reset to their defaults at the start of every run — there is
no shop or currency required in this template.

## What Classic does *not* do

- No paid power-ups, no pay-to-win advantages, no randomized loot.
- No online leaderboard comparison (Best Score is local to this device).
- No timers beyond your own strikes — take your time between placements.
