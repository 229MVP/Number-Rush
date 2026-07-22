# Number-Rush

Godot 4 mobile game — neon UI port from `design_reference/App.tsx`.

## Requirements

- Godot **4.4+**
- Portrait mobile (reference **390 × 844**)

## Run

```bash
godot --path . 
# or open project.godot in the Godot editor
```

Main scene: `res://ui/screens/Main.tscn` (Splash → Menu → …).

## Controls

- Tap / click lanes to place the current tile
- Keys `1`–`4` place into lanes during desktop testing
- `Esc` opens/closes pause
- `Enter` / `Space` on Splash starts
- `F8` toggles debug visual-reference HUD state (debug/editor only)

## Design source

`res://design_reference/App.tsx` is the visual source of truth.
Gameplay scoring uses `100 × combo multiplier` on exact-21 clears (not the React prototype formula).
