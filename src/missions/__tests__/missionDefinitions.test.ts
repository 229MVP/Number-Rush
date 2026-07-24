import {
  DAILY_MISSION_POOL,
  selectMissionsForKey,
  WEEKLY_MISSION_POOL,
} from '../missionDefinitions';

describe('missionDefinitions selection', () => {
  it('keeps daily selection stable for a date key', () => {
    const a = selectMissionsForKey(DAILY_MISSION_POOL, '2026-07-24', 3);
    const b = selectMissionsForKey(DAILY_MISSION_POOL, '2026-07-24', 3);
    expect(a.map((m) => m.id)).toEqual(b.map((m) => m.id));
  });

  it('changes when the date key changes', () => {
    const a = selectMissionsForKey(DAILY_MISSION_POOL, '2026-07-24', 3).map(
      (m) => m.id,
    );
    const b = selectMissionsForKey(DAILY_MISSION_POOL, '2026-07-25', 3).map(
      (m) => m.id,
    );
    // Extremely unlikely to collide for all three with this seed
    expect(a.join(',')).not.toEqual(b.join(','));
  });

  it('selects four weekly missions stably', () => {
    const a = selectMissionsForKey(WEEKLY_MISSION_POOL, '2026-W30', 4);
    const b = selectMissionsForKey(WEEKLY_MISSION_POOL, '2026-W30', 4);
    expect(a).toHaveLength(4);
    expect(a.map((m) => m.id)).toEqual(b.map((m) => m.id));
  });
});
