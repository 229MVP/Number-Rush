# Number Rush — Performance Audit

**Date:** 2026-07-24  
**Scope:** Observed patterns in the current Expo SDK 57 client. Claims below are limited to reasonable, incremental fixes — not a full profiler report.

## Observed patterns

### Animated decorative backgrounds

- `AnimatedNeonBackground`, `GridBackground`, and `PerspectiveGrid` run on Splash, Main Menu, Settings, Coming Soon, and other surfaces.
- Shooting-star / drift loops use `Animated.loop` with native driver where `Platform.OS !== 'web'`.
- Reduced motion is already plumbed on some menu paths (`reducedMotion` prop) but not universally applied to every decorative consumer.

### Provider tree

`App.tsx` nests `SafeAreaProvider` → `SettingsProvider` → `AudioProvider` → `HapticsProvider` → `GameThemeProvider` → navigator.  
Cost is mostly mount/subscription overhead; acceptable for this app size, but audio/music focus effects should stay tied to screen focus (already used on Main Menu via `useFocusEffect`).

### Gameplay

- Tile / lane UI + HUD pulse animations on score/combo changes.
- Pause modal mounts with gameplay; ensure timers / input handlers pause when `gameStatus === 'paused'`.
- Web keyboard listeners in `GameplayScreen` need cleanup on unmount (pattern present — verify remains intact during refactors).

### Persistence

- AsyncStorage reads on menu focus (profile, missions, daily badge). Bursty but small payloads; avoid duplicate parallel refreshes when navigating quickly.

## Intended fixes (reasonable)

| Fix | Why | Status intent |
|-----|-----|---------------|
| Pause / unmount decorative animations when screen blurs (`useFocusEffect` or `reducedMotion` / opacity-0 stop) | Cut JS/UI thread work on covered screens | Recommended before wider beta |
| Gate shooting stars behind `reducedMotion` everywhere decor is used | Accessibility + battery | Partial today — extend |
| Keep audio `playMusic` / stop tied to focus and app state | Prevent overlap and wasted decode | Maintain / harden |
| Ensure gameplay keyboard / interval listeners remove on cleanup | Avoid leaks after Game Over | Maintain |
| Avoid starting Classic with heavy menu decor still animating underneath stack | Navigator already replaces/pushes — confirm menu loops stop when blurred | Recommended |
| Do not add heavy screenshot / particle libraries for store marketing inside the app binary | Keep runtime lean | Policy |

## Non-goals for this pass

- No premature `useMemo` / `useCallback` sprawl
- No claim of frame-perfect 120 Hz measurements without Instruments / Systrace captures
- Ranked online netcode N/A (Coming Soon stub)

## Validation suggestions

1. Android: Gameplay 3-minute Classic run — watch for thermal / jank with decor behind pause.
2. iOS TestFlight: Main Menu → Settings → back; confirm no stacked music.
3. Toggle Reduced Motion — stars/drifts should calm.
4. Repeat after any OTA that touches `AnimatedNeonBackground` or providers.
