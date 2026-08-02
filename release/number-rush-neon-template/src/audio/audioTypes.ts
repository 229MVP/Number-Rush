export type SoundEffectId =
  | 'buttonTap'
  | 'screenOpen'
  | 'tilePlace'
  | 'perfect'
  | 'bust'
  | 'comboUp'
  | 'bomb'
  | 'freeze'
  | 'shield'
  | 'wild'
  | 'swap'
  | 'reward'
  | 'purchase'
  | 'missionClaim'
  | 'victory'
  | 'gameOver'
  | 'rankPromotion';

export type MusicTrackId = 'menu' | 'gameplay' | 'results';

export type AudioAssetMap = {
  sfx: Record<SoundEffectId, number>;
  music: Record<MusicTrackId, number>;
};
