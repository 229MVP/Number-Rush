import {
  getAppSettings,
  normalizeAppSettings,
  resetAppSettings,
  updateAppSettings,
} from '../settingsStorage';
import { clearAllStorage, seedRaw } from '../../test/storageTestUtils';
import { SETTINGS_STORAGE_KEY } from '../../settings/settingsTypes';

describe('settingsStorage', () => {
  beforeEach(async () => {
    await clearAllStorage();
  });

  it('normalizes malformed settings and clamps volume', () => {
    const settings = normalizeAppSettings({
      musicVolume: 4,
      soundEffectsVolume: -1,
      musicEnabled: 'yes',
    });
    expect(settings.musicVolume).toBe(1);
    expect(settings.soundEffectsVolume).toBe(0);
    expect(typeof settings.musicEnabled).toBe('boolean');
  });

  it('persists toggles and survives corrupt JSON', async () => {
    await updateAppSettings({ reducedMotion: true, hapticsEnabled: false });
    const saved = await getAppSettings();
    expect(saved.reducedMotion).toBe(true);
    expect(saved.hapticsEnabled).toBe(false);

    await seedRaw(SETTINGS_STORAGE_KEY, '!!!');
    const recovered = await getAppSettings();
    expect(recovered.musicEnabled).toBe(true);

    const defaults = await resetAppSettings();
    expect(defaults.musicVolume).toBe(0.55);
  });
});
