import {
  applyMissionEvent,
  claimMissionReward,
  getActiveMissionDefinitions,
  getDailyMissionState,
  getWeeklyMissionState,
  resetMissions,
} from '../missionStorage';
import { clearAllStorage } from '../../test/storageTestUtils';

describe('missionStorage', () => {
  beforeEach(async () => {
    await clearAllStorage();
    await resetMissions();
  });

  it('selects deterministic daily missions for a period key', () => {
    const a = getActiveMissionDefinitions('daily');
    const b = getActiveMissionDefinitions('daily');
    expect(a.periodKey).toBe(b.periodKey);
    expect(a.definitions.map((d) => d.id)).toEqual(
      b.definitions.map((d) => d.id),
    );
    expect(a.definitions).toHaveLength(3);
  });

  it('selects four weekly missions', () => {
    const weekly = getActiveMissionDefinitions('weekly');
    expect(weekly.definitions).toHaveLength(4);
  });

  it('updates additive and max metrics; claim applies once', async () => {
    const daily = await getDailyMissionState();
    const mission = daily.missions[0];
    const def = getActiveMissionDefinitions('daily').definitions.find(
      (d) => d.id === mission.missionId,
    );
    expect(def).toBeTruthy();
    if (!def) return;

    if (def.metric === 'single_run_score' || def.metric === 'reach_combo') {
      await applyMissionEvent({
        metric: def.metric,
        amount: 0,
        highestValue: def.target,
      });
    } else {
      await applyMissionEvent({ metric: def.metric, amount: def.target });
    }

    const after = await getDailyMissionState();
    const progress = after.missions.find((m) => m.missionId === def.id);
    expect(progress?.completed).toBe(true);

    const first = await claimMissionReward('daily', def.id);
    expect(first.ok).toBe(true);
    const second = await claimMissionReward('daily', def.id);
    expect(second.ok).toBe(false);
  });

  it('loads weekly state without throwing', async () => {
    const weekly = await getWeeklyMissionState();
    expect(weekly.missions.length).toBe(4);
  });
});
