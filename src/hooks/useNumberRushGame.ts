import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  BOMB_RESOLVE_DURATION,
  BUST_FEEDBACK_DURATION,
  NORMAL_FEEDBACK_DURATION,
  PERFECT_FEEDBACK_DURATION,
  SCORE_POPUP_DURATION,
  TILE_MOVE_DURATION,
} from '../game/gameConstants';
import {
  clearLaneWithBomb,
  createNewRun,
  effectiveTileValue,
  resolveLanePlacement,
  swapLaneTotals,
} from '../game/gameEngine';
import { getDailySeed, getUtcDateKey } from '../game/dailyTournament';
import { getClassicConfig } from '../game/gameModes';
import {
  calculateDailyRank,
  DAILY_LEADERBOARD,
} from '../data/dailyLeaderboard';
import type {
  DailyResultsParams,
  DailyRunResult,
  FloatingPopup,
  GameOverPayload,
  GameStatus,
  LaneState,
  NumberTileData,
  PlacementOutcome,
  RunCompletionReason,
  RunConfiguration,
  RunStats,
  SwapMode,
} from '../game/gameTypes';
import type { RunPowerInventory } from '../game/powerUpInventory';
import { toRunPowerInventory } from '../game/powerUpInventory';
import {
  getDailyPracticeRecord,
  getOfficialDailyRecord,
  saveDailyPracticeResult,
  saveOfficialFromRun,
  updateDailyAllTimeBest,
} from '../storage/dailyStorage';
import { updateBestScoreIfNeeded } from '../storage/gameStorage';
import {
  createTransactionId,
  getPlayerInventory,
  updateInventoryItem,
} from '../storage/playerStorage';

type TravelState = {
  laneIndex: number;
  tile: NumberTileData;
  effectiveValue: number;
} | null;

type State = {
  lanes: LaneState[];
  score: number;
  comboStreak: number;
  comboMultiplier: number;
  strikesRemaining: number;
  currentTile: NumberTileData;
  nextTile: NumberTileData;
  gameStatus: GameStatus;
  runStats: RunStats;
  // Power-up quantities
  multiplierQuantity: number;
  swapQuantity: number;
  bombQuantity: number;
  freezeQuantity: number;
  shieldQuantity: number;
  wildQuantity: number;
  // Power-up selection states
  multiplierSelected: boolean;
  swapMode: SwapMode;
  selectedSwapLane: number | null;
  bombSelected: boolean;
  freezeSelected: boolean;
  shieldArmed: boolean;
  wildSelected: boolean;
  selectedWildValue: number | null;
  bombPulseLane: number | null;
  // UI state
  floatingPopups: FloatingPopup[];
  travel: TravelState;
  scorePulseKey: number;
  comboPulseKey: number;
  config: RunConfiguration;
};

type PlaceResult = ReturnType<typeof resolveLanePlacement>;

type Action =
  | { type: 'RESTART'; config: RunConfiguration; inventory?: Partial<RunPowerInventory> }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TOGGLE_MULTIPLIER' }
  | { type: 'TOGGLE_SWAP' }
  | { type: 'TOGGLE_BOMB' }
  | { type: 'TOGGLE_FREEZE' }
  | { type: 'TOGGLE_SHIELD' }
  | { type: 'OPEN_WILD' }
  | { type: 'SET_WILD_VALUE'; value: number }
  | { type: 'CANCEL_WILD' }
  | { type: 'SELECT_SWAP_LANE'; laneIndex: number }
  | { type: 'CLEAR_SWAP_HIGHLIGHT' }
  | { type: 'APPLY_BOMB'; laneIndex: number }
  | { type: 'CLEAR_BOMB_RESOLVE' }
  | { type: 'BEGIN_PLACE'; laneIndex: number }
  | { type: 'APPLY_PLACE'; result: PlaceResult }
  | { type: 'CLEAR_LANE_FEEDBACK'; laneIndex: number; resetTotal: boolean }
  | { type: 'ADD_POPUP'; popup: FloatingPopup }
  | { type: 'REMOVE_POPUP'; id: string }
  | { type: 'SET_GAME_OVER' };

let activeGenerator = createNewRun(getClassicConfig()).tileGenerator;

function restartWithConfig(
  config: RunConfiguration,
  inventory?: Partial<RunPowerInventory>,
): ReturnType<typeof createNewRun> {
  const run = createNewRun(config, inventory);
  activeGenerator = run.tileGenerator;
  return run;
}

function buildFreshState(
  config: RunConfiguration,
  inventory?: Partial<RunPowerInventory>,
): State {
  const run = restartWithConfig(config, inventory);
  return {
    lanes: run.lanes,
    score: run.score,
    comboStreak: run.comboStreak,
    comboMultiplier: run.comboMultiplier,
    strikesRemaining: run.strikesRemaining,
    currentTile: run.currentTile,
    nextTile: run.nextTile,
    gameStatus: 'playing',
    runStats: run.runStats,
    multiplierQuantity: run.multiplierQuantity,
    swapQuantity: run.swapQuantity,
    bombQuantity: run.bombQuantity,
    freezeQuantity: run.freezeQuantity,
    shieldQuantity: run.shieldQuantity,
    wildQuantity: run.wildQuantity,
    multiplierSelected: false,
    swapMode: 'off',
    selectedSwapLane: null,
    bombSelected: false,
    freezeSelected: false,
    shieldArmed: false,
    wildSelected: false,
    selectedWildValue: null,
    bombPulseLane: null,
    floatingPopups: [],
    travel: null,
    scorePulseKey: 0,
    comboPulseKey: 0,
    config: run.config,
  };
}

/** Clear all placement-modifying selections (multi/swap/bomb/freeze/wild). Shield is untouched. */
function clearPlacementSelections(state: State): Partial<State> {
  return {
    multiplierSelected: false,
    swapMode: 'off',
    selectedSwapLane: null,
    bombSelected: false,
    freezeSelected: false,
    wildSelected: false,
    selectedWildValue: null,
    lanes: state.lanes.map((l) =>
      l.status === 'selected' ? { ...l, status: 'default' as const } : l,
    ),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESTART':
      return buildFreshState(action.config, action.inventory);

    case 'PAUSE': {
      if (state.gameStatus !== 'playing' && state.gameStatus !== 'resolving') {
        return state;
      }
      return {
        ...state,
        ...clearPlacementSelections(state),
        gameStatus: 'paused',
        // shieldArmed intentionally preserved across pause
      };
    }

    case 'RESUME': {
      if (state.gameStatus !== 'paused') return state;
      return { ...state, gameStatus: 'playing' };
    }

    case 'TOGGLE_MULTIPLIER': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode !== 'off') return state;
      if (state.multiplierQuantity <= 0 && !state.multiplierSelected) return state;
      return {
        ...state,
        multiplierSelected: !state.multiplierSelected,
        bombSelected: false,
        freezeSelected: false,
        wildSelected: false,
        selectedWildValue: null,
      };
    }

    case 'TOGGLE_SWAP': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode !== 'off') {
        return {
          ...state,
          swapMode: 'off',
          selectedSwapLane: null,
          lanes: state.lanes.map((l) =>
            l.status === 'selected' ? { ...l, status: 'default' as const } : l,
          ),
        };
      }
      if (state.swapQuantity <= 0) return state;
      return {
        ...state,
        multiplierSelected: false,
        bombSelected: false,
        freezeSelected: false,
        wildSelected: false,
        selectedWildValue: null,
        swapMode: 'selectFirst',
        selectedSwapLane: null,
      };
    }

    case 'TOGGLE_BOMB': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.bombQuantity <= 0 && !state.bombSelected) return state;
      return {
        ...state,
        bombSelected: !state.bombSelected,
        multiplierSelected: false,
        swapMode: 'off',
        selectedSwapLane: null,
        freezeSelected: false,
        wildSelected: false,
        selectedWildValue: null,
        lanes: state.lanes.map((l) =>
          l.status === 'selected' ? { ...l, status: 'default' as const } : l,
        ),
      };
    }

    case 'TOGGLE_FREEZE': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.freezeQuantity <= 0 && !state.freezeSelected) return state;
      return {
        ...state,
        freezeSelected: !state.freezeSelected,
        multiplierSelected: false,
        swapMode: 'off',
        selectedSwapLane: null,
        bombSelected: false,
        wildSelected: false,
        selectedWildValue: null,
        lanes: state.lanes.map((l) =>
          l.status === 'selected' ? { ...l, status: 'default' as const } : l,
        ),
      };
    }

    case 'TOGGLE_SHIELD': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.shieldQuantity <= 0 && !state.shieldArmed) return state;
      // Shield does not clear other placement power-ups
      return { ...state, shieldArmed: !state.shieldArmed };
    }

    case 'OPEN_WILD': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.wildQuantity <= 0 && !state.wildSelected) return state;
      return {
        ...state,
        wildSelected: true,
        selectedWildValue: null,
        multiplierSelected: false,
        swapMode: 'off',
        selectedSwapLane: null,
        bombSelected: false,
        freezeSelected: false,
        lanes: state.lanes.map((l) =>
          l.status === 'selected' ? { ...l, status: 'default' as const } : l,
        ),
      };
    }

    case 'SET_WILD_VALUE': {
      if (!state.wildSelected) return state;
      const clamped = Math.max(1, Math.min(10, Math.floor(action.value)));
      return { ...state, selectedWildValue: clamped };
    }

    case 'CANCEL_WILD': {
      return { ...state, wildSelected: false, selectedWildValue: null };
    }

    case 'SELECT_SWAP_LANE': {
      if (!state.config.powerUpsEnabled) return state;
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode === 'off') return state;
      const lane = state.lanes[action.laneIndex];
      if (!lane || lane.status === 'frozen') return state;

      if (state.swapMode === 'selectFirst') {
        return {
          ...state,
          selectedSwapLane: action.laneIndex,
          swapMode: 'selectSecond',
          lanes: state.lanes.map((l, i) =>
            i === action.laneIndex
              ? { ...l, status: 'selected' as const }
              : { ...l, status: l.status === 'selected' ? ('default' as const) : l.status },
          ),
        };
      }

      if (state.selectedSwapLane == null) {
        return { ...state, swapMode: 'off' };
      }
      if (state.selectedSwapLane === action.laneIndex) {
        return {
          ...state,
          swapMode: 'off',
          selectedSwapLane: null,
          lanes: state.lanes.map((l) =>
            l.status === 'selected' ? { ...l, status: 'default' as const } : l,
          ),
        };
      }

      const swapped = swapLaneTotals(
        state.lanes,
        state.selectedSwapLane,
        action.laneIndex,
      );
      return {
        ...state,
        lanes: swapped,
        swapQuantity: Math.max(0, state.swapQuantity - 1),
        swapMode: 'off',
        selectedSwapLane: null,
      };
    }

    case 'CLEAR_SWAP_HIGHLIGHT': {
      return {
        ...state,
        lanes: state.lanes.map((l) =>
          l.status === 'selected' ? { ...l, status: 'default' as const } : l,
        ),
      };
    }

    case 'APPLY_BOMB': {
      if (!state.config.powerUpsEnabled || state.bombQuantity <= 0) return state;
      const bombed = clearLaneWithBomb(state.lanes, action.laneIndex);
      if (!bombed.ok) return state;
      return {
        ...state,
        lanes: bombed.lanes,
        bombQuantity: Math.max(0, state.bombQuantity - 1),
        bombSelected: false,
        bombPulseLane: action.laneIndex,
        gameStatus: 'resolving',
      };
    }

    case 'CLEAR_BOMB_RESOLVE': {
      return {
        ...state,
        bombPulseLane: null,
        gameStatus: state.gameStatus === 'resolving' ? 'playing' : state.gameStatus,
      };
    }

    case 'BEGIN_PLACE': {
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode !== 'off') return state;
      const lane = state.lanes[action.laneIndex];
      if (!lane || lane.status === 'frozen') return state;
      const wildValue =
        state.wildSelected && state.selectedWildValue != null
          ? state.selectedWildValue
          : null;
      const usingMultiplier = wildValue == null && state.multiplierSelected;
      const effective = effectiveTileValue(state.currentTile, usingMultiplier, wildValue);
      return {
        ...state,
        gameStatus: 'resolving',
        travel: {
          laneIndex: action.laneIndex,
          tile: state.currentTile,
          effectiveValue: effective,
        },
        lanes: state.lanes.map((l, i) =>
          i === action.laneIndex ? { ...l, status: 'receiving' as const } : l,
        ),
      };
    }

    case 'APPLY_PLACE': {
      const r = action.result;
      return {
        ...state,
        lanes: r.lanes,
        score: r.score,
        comboStreak: r.comboStreak,
        comboMultiplier: r.comboMultiplier,
        strikesRemaining: r.strikesRemaining,
        currentTile: r.currentTile,
        nextTile: r.nextTile,
        runStats: r.runStats,
        multiplierQuantity: r.multiplierQuantity,
        multiplierSelected: false,
        freezeQuantity: r.consumedFreeze
          ? Math.max(0, state.freezeQuantity - 1)
          : state.freezeQuantity,
        freezeSelected: false,
        wildQuantity: r.consumedWild
          ? Math.max(0, state.wildQuantity - 1)
          : state.wildQuantity,
        wildSelected: false,
        selectedWildValue: null,
        shieldQuantity: r.consumedShield
          ? Math.max(0, state.shieldQuantity - 1)
          : state.shieldQuantity,
        shieldArmed: r.consumedShield ? false : state.shieldArmed,
        travel: null,
        scorePulseKey:
          r.pointsAwarded > 0 ? state.scorePulseKey + 1 : state.scorePulseKey,
        comboPulseKey:
          r.outcome === 'perfect' || r.outcome === 'bust'
            ? state.comboPulseKey + 1
            : state.comboPulseKey,
        gameStatus: r.gameOver ? 'resolving' : 'playing',
      };
    }

    case 'CLEAR_LANE_FEEDBACK': {
      return {
        ...state,
        lanes: state.lanes.map((l, i) =>
          i === action.laneIndex
            ? {
                ...l,
                status: 'default' as const,
                total: action.resetTotal ? 0 : l.total,
              }
            : l,
        ),
      };
    }

    case 'ADD_POPUP': {
      return {
        ...state,
        floatingPopups: [...state.floatingPopups, action.popup],
      };
    }

    case 'REMOVE_POPUP': {
      return {
        ...state,
        floatingPopups: state.floatingPopups.filter((p) => p.id !== action.id),
      };
    }

    case 'SET_GAME_OVER':
      return { ...state, gameStatus: 'gameOver' };

    default:
      return state;
  }
}

let popupSerial = 0;

type Options = {
  configuration: RunConfiguration;
  onGameOver: (payload: GameOverPayload) => void;
  onDailyComplete: (params: DailyResultsParams) => void;
};

export function useNumberRushGame({
  configuration,
  onGameOver,
  onDailyComplete,
}: Options) {
  const configRef = useRef(configuration);
  configRef.current = configuration;

  const [state, dispatch] = useReducer(reducer, configuration, buildFreshState);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const onDailyCompleteRef = useRef(onDailyComplete);
  onDailyCompleteRef.current = onDailyComplete;
  const placingRef = useRef(false);
  const finishingRef = useRef(false);
  const inventoryRef = useRef<Partial<RunPowerInventory> | null>(null);
  const usageRef = useRef({ multipliersUsed: 0, swapsUsed: 0 });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const loadInventoryAndRestart = useCallback(
    async (config: RunConfiguration) => {
      usageRef.current = { multipliersUsed: 0, swapsUsed: 0 };
      if (config.powerUpsEnabled) {
        const inv = await getPlayerInventory();
        const runInv = toRunPowerInventory(inv);
        inventoryRef.current = runInv;
        dispatch({ type: 'RESTART', config, inventory: runInv });
      } else {
        inventoryRef.current = null;
        dispatch({ type: 'RESTART', config });
      }
    },
    [],
  );

  useEffect(() => {
    clearTimers();
    placingRef.current = false;
    finishingRef.current = false;
    void loadInventoryAndRestart(configuration);
  }, [
    configuration.mode,
    configuration.seed,
    configuration.officialAttempt,
    configuration.maximumTiles,
    configuration.powerUpsEnabled,
    configuration.maximumStrikes,
    configuration.targetValue,
    clearTimers,
    loadInventoryAndRestart,
  ]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const addPopup = useCallback(
    (text: string, laneIndex: number, kind: FloatingPopup['kind']) => {
      popupSerial += 1;
      const id = `popup-${popupSerial}`;
      dispatch({ type: 'ADD_POPUP', popup: { id, text, laneIndex, kind } });
      schedule(() => dispatch({ type: 'REMOVE_POPUP', id }), SCORE_POPUP_DURATION);
    },
    [schedule],
  );

  const finishClassic = useCallback(async (stats: RunStats) => {
    const { bestScore, isNewBest } = await updateBestScoreIfNeeded(stats.score);
    dispatch({ type: 'SET_GAME_OVER' });
    onGameOverRef.current({
      finalScore: stats.score,
      bestScore,
      maxComboMultiplier: stats.maxComboMultiplier,
      longestPerfectStreak: stats.longestPerfectStreak,
      perfectClears: stats.perfectClears,
      tilesPlaced: stats.tilesPlaced,
      isNewBest,
      rewardKey: createTransactionId(
        `classic-${stats.score}-${stats.tilesPlaced}`,
      ),
      multipliersUsed: usageRef.current.multipliersUsed,
      swapsUsed: usageRef.current.swapsUsed,
    });
  }, []);

  const finishDaily = useCallback(
    async (stats: RunStats, reason: RunCompletionReason, cfg: RunConfiguration) => {
      const dateKey = getUtcDateKey();
      const completedAt = new Date().toISOString();
      const runResult: DailyRunResult = {
        mode: 'daily',
        dateKey,
        officialAttempt: cfg.officialAttempt,
        score: stats.score,
        perfectClears: stats.perfectClears,
        maxComboMultiplier: stats.maxComboMultiplier,
        longestPerfectStreak: stats.longestPerfectStreak,
        tilesPlaced: stats.tilesPlaced,
        strikesUsed: stats.strikesUsed,
        completionReason: reason,
        completedAt,
      };

      if (cfg.officialAttempt) {
        const { record, isNewDailyBest, allTimeBest } =
          await saveOfficialFromRun(runResult);
        const practice = await getDailyPracticeRecord(dateKey);
        const rank = calculateDailyRank(record.score, DAILY_LEADERBOARD);
        dispatch({ type: 'SET_GAME_OVER' });
        onDailyCompleteRef.current({
          dateKey,
          officialAttempt: true,
          score: record.score,
          perfectClears: record.perfectClears,
          maxComboMultiplier: record.maxComboMultiplier,
          longestPerfectStreak: record.longestPerfectStreak,
          tilesPlaced: record.tilesPlaced,
          strikesUsed: record.strikesUsed,
          completionReason: reason,
          officialScore: record.score,
          practiceBest: practice?.bestScore ?? null,
          calculatedRank: rank,
          isNewDailyBest,
          allTimeBest: allTimeBest.score,
          rewardKey: createTransactionId(
            `daily-official-${dateKey}-${record.score}`,
          ),
        });
        return;
      }

      const practice = await saveDailyPracticeResult(runResult);
      const { best: allTimeBest, isNew } = await updateDailyAllTimeBest(
        stats.score,
        dateKey,
        completedAt,
      );
      const official = await getOfficialDailyRecord(dateKey);
      const rank = calculateDailyRank(stats.score, DAILY_LEADERBOARD);
      dispatch({ type: 'SET_GAME_OVER' });
      onDailyCompleteRef.current({
        dateKey,
        officialAttempt: false,
        score: stats.score,
        perfectClears: stats.perfectClears,
        maxComboMultiplier: stats.maxComboMultiplier,
        longestPerfectStreak: stats.longestPerfectStreak,
        tilesPlaced: stats.tilesPlaced,
        strikesUsed: stats.strikesUsed,
        completionReason: reason,
        officialScore: official?.score ?? null,
        practiceBest: practice.bestScore,
        calculatedRank: rank,
        isNewDailyBest: isNew,
        allTimeBest: allTimeBest.score,
        rewardKey: createTransactionId(
          `daily-practice-${dateKey}-${stats.score}-${Date.now()}`,
        ),
      });
    },
    [],
  );

  const finishRun = useCallback(
    async (stats: RunStats, reason: RunCompletionReason) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      const cfg = configRef.current;
      if (cfg.mode === 'daily') {
        await finishDaily(stats, reason, cfg);
        return;
      }
      // Ranked uses Classic local reward path for now; server validation
      // is queued separately when cloud features are configured.
      await finishClassic(stats);
    },
    [finishClassic, finishDaily],
  );

  const placeTile = useCallback(
    (laneIndex: number) => {
      if (placingRef.current || finishingRef.current) return;
      if (state.gameStatus !== 'playing') return;

      // --- Bomb flow: consume bomb on a non-empty lane ---
      if (state.bombSelected) {
        const lane = state.lanes[laneIndex];
        if (!lane || lane.total <= 0) return;
        placingRef.current = true;
        dispatch({ type: 'APPLY_BOMB', laneIndex });
        void updateInventoryItem('bomb', -1);
        addPopup('BOMB!', laneIndex, 'bomb');
        schedule(() => {
          dispatch({ type: 'CLEAR_BOMB_RESOLVE' });
          placingRef.current = false;
        }, BOMB_RESOLVE_DURATION);
        return;
      }

      // --- Swap flow ---
      if (state.swapMode !== 'off') {
        const modeBefore = state.swapMode;
        const willConsumeSwap =
          modeBefore === 'selectSecond' &&
          state.selectedSwapLane != null &&
          state.selectedSwapLane !== laneIndex &&
          state.lanes[laneIndex]?.status !== 'frozen';
        dispatch({ type: 'SELECT_SWAP_LANE', laneIndex });
        if (willConsumeSwap) {
          usageRef.current.swapsUsed += 1;
          void updateInventoryItem('swap', -1);
        }
        if (modeBefore === 'selectSecond') {
          schedule(() => dispatch({ type: 'CLEAR_SWAP_HIGHLIGHT' }), 350);
        }
        return;
      }

      // --- Normal / Wild / Freeze / Shield placement ---
      const lane = state.lanes[laneIndex];
      if (!lane || lane.status === 'frozen') return;

      // Wild selected but value not yet chosen — wait for picker
      if (state.wildSelected && state.selectedWildValue === null) return;

      placingRef.current = true;
      dispatch({ type: 'BEGIN_PLACE', laneIndex });

      const wildValue =
        state.wildSelected && state.selectedWildValue != null
          ? state.selectedWildValue
          : null;

      const snapshot = {
        lanes: state.lanes,
        currentTile: state.currentTile,
        nextTile: state.nextTile,
        score: state.score,
        comboStreak: state.comboStreak,
        strikesRemaining: state.strikesRemaining,
        runStats: state.runStats,
        multiplierSelected: state.multiplierSelected,
        multiplierQuantity: state.multiplierQuantity,
        maximumTiles: state.config.maximumTiles,
        wildValue,
        freezeActive: state.freezeSelected,
        shieldArmed: state.shieldArmed,
      };

      schedule(() => {
        const result = resolveLanePlacement({
          ...snapshot,
          laneIndex,
          tileGenerator: activeGenerator,
        });

        dispatch({ type: 'APPLY_PLACE', result });

        if (result.consumedMultiplier) {
          usageRef.current.multipliersUsed += 1;
          void updateInventoryItem('multiplier', -1);
        }
        if (result.consumedFreeze) {
          void updateInventoryItem('freeze', -1);
        }
        if (result.consumedWild) {
          void updateInventoryItem('wild', -1);
        }
        if (result.consumedShield) {
          void updateInventoryItem('shield', -1);
        }

        if (result.shieldBlocked) {
          addPopup('SHIELDED!', laneIndex, 'shielded');
        } else if (result.outcome === 'perfect') {
          addPopup(`PERFECT +${result.pointsAwarded}`, laneIndex, 'perfect');
        } else if (result.outcome === 'bust') {
          addPopup('BUST!', laneIndex, 'bust');
        }

        const feedbackMs =
          result.outcome === 'perfect'
            ? PERFECT_FEEDBACK_DURATION
            : result.outcome === 'bust'
              ? BUST_FEEDBACK_DURATION
              : NORMAL_FEEDBACK_DURATION;

        schedule(() => {
          dispatch({
            type: 'CLEAR_LANE_FEEDBACK',
            laneIndex,
            resetTotal:
              result.outcome === 'perfect' || result.outcome === 'bust',
          });
          placingRef.current = false;

          if (result.gameOver) {
            const reason: RunCompletionReason = result.tileLimitReached
              ? 'tileLimit'
              : 'strikes';
            schedule(() => {
              void finishRun(result.runStats, reason);
            }, 120);
          }
        }, feedbackMs);
      }, TILE_MOVE_DURATION);
    },
    [
      state.gameStatus,
      state.swapMode,
      state.selectedSwapLane,
      state.lanes,
      state.currentTile,
      state.nextTile,
      state.score,
      state.comboStreak,
      state.strikesRemaining,
      state.runStats,
      state.multiplierSelected,
      state.multiplierQuantity,
      state.config.maximumTiles,
      state.bombSelected,
      state.freezeSelected,
      state.shieldArmed,
      state.wildSelected,
      state.selectedWildValue,
      schedule,
      addPopup,
      finishRun,
    ],
  );

  const selectSwapLane = useCallback(
    (laneIndex: number) => {
      if (state.swapMode === 'off') return;
      placeTile(laneIndex);
    },
    [placeTile, state.swapMode],
  );

  const pauseGame = useCallback(() => {
    if (placingRef.current) return;
    dispatch({ type: 'PAUSE' });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const restartGame = useCallback(() => {
    const cfg = configRef.current;
    if (cfg.mode === 'daily' && cfg.officialAttempt) return;
    clearTimers();
    placingRef.current = false;
    finishingRef.current = false;
    void loadInventoryAndRestart(cfg);
  }, [clearTimers, loadInventoryAndRestart]);

  const quitGame = useCallback(() => {
    clearTimers();
    placingRef.current = false;
  }, [clearTimers]);

  const forfeitOfficialDaily = useCallback(async () => {
    const cfg = configRef.current;
    if (cfg.mode !== 'daily' || !cfg.officialAttempt) return;
    if (finishingRef.current) return;
    finishingRef.current = true;
    clearTimers();
    placingRef.current = false;
    await finishDaily(state.runStats, 'quit', cfg);
  }, [clearTimers, finishDaily, state.runStats]);

  const toggleMultiplier = useCallback(() => {
    dispatch({ type: 'TOGGLE_MULTIPLIER' });
  }, []);

  const toggleSwap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SWAP' });
  }, []);

  const toggleBomb = useCallback(() => {
    dispatch({ type: 'TOGGLE_BOMB' });
  }, []);

  const toggleFreeze = useCallback(() => {
    dispatch({ type: 'TOGGLE_FREEZE' });
  }, []);

  const toggleShield = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHIELD' });
  }, []);

  const openWildPicker = useCallback(() => {
    dispatch({ type: 'OPEN_WILD' });
  }, []);

  const confirmWildValue = useCallback((value: number) => {
    dispatch({ type: 'SET_WILD_VALUE', value });
  }, []);

  const cancelWild = useCallback(() => {
    dispatch({ type: 'CANCEL_WILD' });
  }, []);

  const tilesRemaining =
    state.config.maximumTiles == null
      ? null
      : Math.max(0, state.config.maximumTiles - state.runStats.tilesPlaced);

  const dateKey =
    state.config.mode === 'daily' ? getUtcDateKey() : null;

  const instructionText = (() => {
    if (!state.config.powerUpsEnabled) return 'TAP A LANE TO PLACE THE TILE';
    if (state.swapMode === 'selectFirst') return 'SELECT FIRST LANE';
    if (state.swapMode === 'selectSecond') return 'SELECT SECOND LANE';
    if (state.multiplierSelected) return 'X2 ACTIVE — TAP A LANE';
    if (state.bombSelected) return 'SELECT A LANE TO CLEAR';
    if (state.freezeSelected) return 'FREEZE ACTIVE — TAP A LANE';
    if (state.wildSelected) {
      if (state.selectedWildValue != null) {
        return `WILD ${state.selectedWildValue} — TAP A LANE`;
      }
      return 'PICK A WILD VALUE';
    }
    if (state.shieldArmed) return 'SHIELD ARMED — TAP A LANE';
    return 'TAP A LANE TO PLACE THE TILE';
  })();

  return {
    // Board state
    lanes: state.lanes,
    score: state.score,
    comboStreak: state.comboStreak,
    comboMultiplier: state.comboMultiplier,
    strikesRemaining: state.strikesRemaining,
    currentTile: state.currentTile,
    nextTile: state.nextTile,
    gameStatus: state.gameStatus,
    runStats: state.runStats,
    // Power-up quantities
    multiplierQuantity: state.multiplierQuantity,
    swapQuantity: state.swapQuantity,
    bombQuantity: state.bombQuantity,
    freezeQuantity: state.freezeQuantity,
    shieldQuantity: state.shieldQuantity,
    wildQuantity: state.wildQuantity,
    // Power-up selection states
    multiplierSelected: state.multiplierSelected,
    swapMode: state.swapMode,
    selectedSwapLane: state.selectedSwapLane,
    bombSelected: state.bombSelected,
    freezeSelected: state.freezeSelected,
    shieldArmed: state.shieldArmed,
    wildSelected: state.wildSelected,
    selectedWildValue: state.selectedWildValue,
    bombPulseLane: state.bombPulseLane,
    // UI state
    floatingPopups: state.floatingPopups,
    travel: state.travel,
    scorePulseKey: state.scorePulseKey,
    comboPulseKey: state.comboPulseKey,
    config: state.config,
    mode: state.config.mode,
    powerUpsEnabled: state.config.powerUpsEnabled,
    officialAttempt: state.config.officialAttempt,
    tilesRemaining,
    dateKey,
    dailySeed: dateKey ? getDailySeed(dateKey) : null,
    instructionText,
    // Actions
    placeTile,
    toggleMultiplier,
    toggleSwap,
    toggleBomb,
    toggleFreeze,
    toggleShield,
    openWildPicker,
    confirmWildValue,
    cancelWild,
    selectSwapLane,
    pauseGame,
    resumeGame,
    restartGame,
    quitGame,
    forfeitOfficialDaily,
  };
}

export type NumberRushGameApi = ReturnType<typeof useNumberRushGame>;
export type { PlacementOutcome };
