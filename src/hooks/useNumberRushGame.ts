import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  BUST_FEEDBACK_DURATION,
  NORMAL_FEEDBACK_DURATION,
  PERFECT_FEEDBACK_DURATION,
  SCORE_POPUP_DURATION,
  TILE_MOVE_DURATION,
} from '../game/gameConstants';
import {
  createNewRun,
  resolveLanePlacement,
  swapLaneTotals,
} from '../game/gameEngine';
import type {
  FloatingPopup,
  GameOverPayload,
  GameStatus,
  LaneState,
  NumberTileData,
  PlacementOutcome,
  RunStats,
  SwapMode,
} from '../game/gameTypes';
import { updateBestScoreIfNeeded } from '../storage/gameStorage';

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
  multiplierQuantity: number;
  multiplierSelected: boolean;
  swapQuantity: number;
  swapMode: SwapMode;
  selectedSwapLane: number | null;
  floatingPopups: FloatingPopup[];
  travel: TravelState;
  scorePulseKey: number;
  comboPulseKey: number;
};

type Action =
  | { type: 'RESTART' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TOGGLE_MULTIPLIER' }
  | { type: 'TOGGLE_SWAP' }
  | { type: 'SELECT_SWAP_LANE'; laneIndex: number }
  | { type: 'CLEAR_SWAP_HIGHLIGHT' }
  | { type: 'BEGIN_PLACE'; laneIndex: number }
  | {
      type: 'APPLY_PLACE';
      result: ReturnType<typeof resolveLanePlacement>;
    }
  | { type: 'CLEAR_LANE_FEEDBACK'; laneIndex: number; resetTotal: boolean }
  | { type: 'ADD_POPUP'; popup: FloatingPopup }
  | { type: 'REMOVE_POPUP'; id: string }
  | { type: 'SET_GAME_OVER' };

/** Module-level generator so resolve advances the same bag used at run start. */
let activeGenerator = createNewRun().tileGenerator;

function restartGenerator(): ReturnType<typeof createNewRun> {
  const run = createNewRun();
  activeGenerator = run.tileGenerator;
  return run;
}

function buildFreshState(): State {
  const run = restartGenerator();
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
    multiplierSelected: run.multiplierSelected,
    swapQuantity: run.swapQuantity,
    swapMode: 'off',
    selectedSwapLane: null,
    floatingPopups: [],
    travel: null,
    scorePulseKey: 0,
    comboPulseKey: 0,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESTART': {
      return buildFreshState();
    }
    case 'PAUSE': {
      if (state.gameStatus !== 'playing' && state.gameStatus !== 'resolving') {
        return state;
      }
      return {
        ...state,
        gameStatus: 'paused',
        multiplierSelected: false,
        swapMode: 'off',
        selectedSwapLane: null,
      };
    }
    case 'RESUME': {
      if (state.gameStatus !== 'paused') return state;
      return { ...state, gameStatus: 'playing' };
    }
    case 'TOGGLE_MULTIPLIER': {
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode !== 'off') return state;
      if (state.multiplierQuantity <= 0) return state;
      return { ...state, multiplierSelected: !state.multiplierSelected };
    }
    case 'TOGGLE_SWAP': {
      if (state.gameStatus !== 'playing') return state;
      if (state.swapQuantity <= 0) return state;
      if (state.swapMode !== 'off') {
        return {
          ...state,
          swapMode: 'off',
          selectedSwapLane: null,
          lanes: state.lanes.map((l) =>
            l.status === 'selected' ? { ...l, status: 'default' } : l,
          ),
        };
      }
      return {
        ...state,
        multiplierSelected: false,
        swapMode: 'selectFirst',
        selectedSwapLane: null,
      };
    }
    case 'SELECT_SWAP_LANE': {
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
              ? { ...l, status: 'selected' }
              : { ...l, status: l.status === 'selected' ? 'default' : l.status },
          ),
        };
      }

      // selectSecond
      if (state.selectedSwapLane == null) {
        return { ...state, swapMode: 'off' };
      }
      if (state.selectedSwapLane === action.laneIndex) {
        // Same lane twice — cancel without consuming.
        return {
          ...state,
          swapMode: 'off',
          selectedSwapLane: null,
          lanes: state.lanes.map((l) =>
            l.status === 'selected' ? { ...l, status: 'default' } : l,
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
          l.status === 'selected' ? { ...l, status: 'default' } : l,
        ),
      };
    }
    case 'BEGIN_PLACE': {
      if (state.gameStatus !== 'playing') return state;
      if (state.swapMode !== 'off') return state;
      const lane = state.lanes[action.laneIndex];
      if (!lane || lane.status === 'frozen') return state;
      const effective =
        state.currentTile.value * (state.multiplierSelected ? 2 : 1);
      return {
        ...state,
        gameStatus: 'resolving',
        travel: {
          laneIndex: action.laneIndex,
          tile: state.currentTile,
          effectiveValue: effective,
        },
        lanes: state.lanes.map((l, i) =>
          i === action.laneIndex ? { ...l, status: 'receiving' } : l,
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
                status: 'default',
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
    case 'SET_GAME_OVER': {
      return { ...state, gameStatus: 'gameOver' };
    }
    default:
      return state;
  }
}

let popupSerial = 0;

type Options = {
  onGameOver: (payload: GameOverPayload) => void;
};

export function useNumberRushGame({ onGameOver }: Options) {
  const [state, dispatch] = useReducer(reducer, undefined, buildFreshState);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const placingRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

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

  const finishGameOver = useCallback(
    async (stats: RunStats) => {
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
      });
    },
    [],
  );

  const placeTile = useCallback(
    (laneIndex: number) => {
      if (placingRef.current) return;
      if (state.gameStatus !== 'playing') return;
      if (state.swapMode !== 'off') {
        const modeBefore = state.swapMode;
        dispatch({ type: 'SELECT_SWAP_LANE', laneIndex });
        if (modeBefore === 'selectSecond') {
          schedule(() => dispatch({ type: 'CLEAR_SWAP_HIGHLIGHT' }), 350);
        }
        return;
      }
      const lane = state.lanes[laneIndex];
      if (!lane || lane.status === 'frozen') return;

      placingRef.current = true;
      dispatch({ type: 'BEGIN_PLACE', laneIndex });

      // Capture values for delayed resolve (avoid stale state).
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
      };

      schedule(() => {
        const result = resolveLanePlacement({
          ...snapshot,
          laneIndex,
          tileGenerator: activeGenerator,
        });

        dispatch({ type: 'APPLY_PLACE', result });

        if (result.outcome === 'perfect') {
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
            schedule(() => {
              void finishGameOver(result.runStats);
            }, 120);
          }
        }, feedbackMs);
      }, TILE_MOVE_DURATION);
    },
    [
      state.gameStatus,
      state.swapMode,
      state.lanes,
      state.currentTile,
      state.nextTile,
      state.score,
      state.comboStreak,
      state.strikesRemaining,
      state.runStats,
      state.multiplierSelected,
      state.multiplierQuantity,
      schedule,
      addPopup,
      finishGameOver,
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
    clearTimers();
    placingRef.current = false;
    dispatch({ type: 'RESTART' });
  }, [clearTimers]);

  const quitGame = useCallback(() => {
    clearTimers();
    placingRef.current = false;
  }, [clearTimers]);

  const toggleMultiplier = useCallback(() => {
    dispatch({ type: 'TOGGLE_MULTIPLIER' });
  }, []);

  const toggleSwap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SWAP' });
  }, []);

  const instructionText = (() => {
    if (state.swapMode === 'selectFirst') return 'SELECT FIRST LANE';
    if (state.swapMode === 'selectSecond') return 'SELECT SECOND LANE';
    if (state.multiplierSelected) return 'X2 ACTIVE — TAP A LANE';
    return 'TAP A LANE TO PLACE THE TILE';
  })();

  return {
    lanes: state.lanes,
    score: state.score,
    comboStreak: state.comboStreak,
    comboMultiplier: state.comboMultiplier,
    strikesRemaining: state.strikesRemaining,
    currentTile: state.currentTile,
    nextTile: state.nextTile,
    gameStatus: state.gameStatus,
    runStats: state.runStats,
    multiplierQuantity: state.multiplierQuantity,
    multiplierSelected: state.multiplierSelected,
    swapQuantity: state.swapQuantity,
    swapMode: state.swapMode,
    selectedSwapLane: state.selectedSwapLane,
    floatingPopups: state.floatingPopups,
    travel: state.travel,
    scorePulseKey: state.scorePulseKey,
    comboPulseKey: state.comboPulseKey,
    instructionText,
    placeTile,
    toggleMultiplier,
    toggleSwap,
    selectSwapLane,
    pauseGame,
    resumeGame,
    restartGame,
    quitGame,
  };
}

export type NumberRushGameApi = ReturnType<typeof useNumberRushGame>;

// Silence unused import if PlacementOutcome needed later for typing
export type { PlacementOutcome };
