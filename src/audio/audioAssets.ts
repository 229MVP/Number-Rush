import type { AudioAssetMap } from './audioTypes';

/** Metro require() map for generated placeholder WAV assets. */
export const AUDIO_ASSETS: AudioAssetMap = {
  sfx: {
    buttonTap: require('../../assets/audio/sfx/buttonTap.wav'),
    screenOpen: require('../../assets/audio/sfx/screenOpen.wav'),
    tilePlace: require('../../assets/audio/sfx/tilePlace.wav'),
    perfect: require('../../assets/audio/sfx/perfect.wav'),
    bust: require('../../assets/audio/sfx/bust.wav'),
    comboUp: require('../../assets/audio/sfx/comboUp.wav'),
    bomb: require('../../assets/audio/sfx/bomb.wav'),
    freeze: require('../../assets/audio/sfx/freeze.wav'),
    shield: require('../../assets/audio/sfx/shield.wav'),
    wild: require('../../assets/audio/sfx/wild.wav'),
    swap: require('../../assets/audio/sfx/swap.wav'),
    reward: require('../../assets/audio/sfx/reward.wav'),
    purchase: require('../../assets/audio/sfx/purchase.wav'),
    missionClaim: require('../../assets/audio/sfx/missionClaim.wav'),
    victory: require('../../assets/audio/sfx/victory.wav'),
    gameOver: require('../../assets/audio/sfx/gameOver.wav'),
    rankPromotion: require('../../assets/audio/sfx/rankPromotion.wav'),
  },
  music: {
    menu: require('../../assets/audio/music/menu.wav'),
    gameplay: require('../../assets/audio/music/gameplay.wav'),
    results: require('../../assets/audio/music/results.wav'),
  },
};
