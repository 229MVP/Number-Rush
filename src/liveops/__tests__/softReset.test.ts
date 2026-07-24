import { softResetPoints } from '../softReset';

describe('softResetPoints', () => {
  it('keeps bronze at or below cap', () => {
    expect(softResetPoints(120)).toBe(120);
    expect(softResetPoints(5000, { bronze_cap: 299 })).toBe(2000);
  });

  it('maps tiers to configured floors', () => {
    expect(softResetPoints(450)).toBe(300);
    expect(softResetPoints(900)).toBe(600);
    expect(softResetPoints(1300)).toBe(1000);
    expect(softResetPoints(1900)).toBe(1500);
    expect(softResetPoints(3000)).toBe(2000);
  });
});
