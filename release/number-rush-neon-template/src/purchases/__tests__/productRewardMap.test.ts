import { PRODUCT_REWARD_MAP, toServerProductKey } from '../productRewardMap';
import {
  GEM_PACK_AMOUNTS,
  STARTER_BUNDLE_CONTENTS,
} from '../../monetization/economyBalance';

describe('productRewardMap', () => {
  it('maps gem packs to configured amounts', () => {
    expect(PRODUCT_REWARD_MAP['numberrush.gems_80'].gems).toBe(
      GEM_PACK_AMOUNTS['numberrush.gems_80'],
    );
    expect(PRODUCT_REWARD_MAP['numberrush.gems_2500'].gems).toBe(
      GEM_PACK_AMOUNTS['numberrush.gems_2500'],
    );
  });

  it('maps remove ads and club entitlements', () => {
    expect(
      PRODUCT_REWARD_MAP['numberrush.remove_ads'].entitlements?.removeAds,
    ).toBe(true);
    expect(
      PRODUCT_REWARD_MAP['numberrush.club.monthly'].entitlements?.clubActive,
    ).toBe(true);
  });

  it('maps starter bundle rewards', () => {
    expect(PRODUCT_REWARD_MAP['numberrush.starter_bundle'].gems).toBe(
      STARTER_BUNDLE_CONTENTS.gems,
    );
    expect(PRODUCT_REWARD_MAP['numberrush.starter_bundle'].inventory).toEqual(
      STARTER_BUNDLE_CONTENTS.inventory,
    );
  });

  it('normalizes store ids to server keys', () => {
    expect(toServerProductKey('numberrush.gems_80')).toBe('gems_80');
    expect(toServerProductKey('numberrush.remove_ads')).toBe('remove_ads');
  });
});
