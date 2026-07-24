import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { AUDIO_ASSETS } from './audioAssets';
import type { MusicTrackId, SoundEffectId } from './audioTypes';

type AudioServiceState = {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
};

const SFX_COOLDOWN_MS: Partial<Record<SoundEffectId, number>> = {
  buttonTap: 40,
  tilePlace: 50,
  perfect: 80,
  bust: 80,
};

class AudioService {
  private ready = false;
  private sfxPlayers = new Map<SoundEffectId, AudioPlayer>();
  private musicPlayer: AudioPlayer | null = null;
  private currentTrack: MusicTrackId | null = null;
  private lastPlayed = new Map<SoundEffectId, number>();
  private state: AudioServiceState = {
    musicEnabled: true,
    soundEffectsEnabled: true,
    musicVolume: 0.55,
    soundEffectsVolume: 0.8,
  };

  async init(): Promise<void> {
    if (this.ready) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
      });
      await setIsAudioActiveAsync(true);
      // Preload a few common SFX
      const preload: SoundEffectId[] = [
        'buttonTap',
        'tilePlace',
        'perfect',
        'bust',
        'bomb',
        'freeze',
        'shield',
        'wild',
        'swap',
      ];
      for (const id of preload) {
        this.getSfxPlayer(id);
      }
      this.ready = true;
    } catch {
      this.ready = true;
    }
  }

  configure(partial: Partial<AudioServiceState>): void {
    this.state = { ...this.state, ...partial };
    if (this.musicPlayer) {
      this.musicPlayer.volume = this.state.musicEnabled
        ? this.state.musicVolume
        : 0;
      if (!this.state.musicEnabled && this.musicPlayer.playing) {
        try {
          this.musicPlayer.pause();
        } catch {
          // ignore
        }
      } else if (
        this.state.musicEnabled &&
        this.currentTrack &&
        !this.musicPlayer.playing
      ) {
        try {
          this.musicPlayer.play();
        } catch {
          // ignore
        }
      }
    }
  }

  private getSfxPlayer(id: SoundEffectId): AudioPlayer | null {
    try {
      let player = this.sfxPlayers.get(id);
      if (!player) {
        player = createAudioPlayer(AUDIO_ASSETS.sfx[id]);
        player.volume = this.state.soundEffectsVolume;
        this.sfxPlayers.set(id, player);
      }
      return player;
    } catch {
      return null;
    }
  }

  playSound(id: SoundEffectId): void {
    if (!this.state.soundEffectsEnabled) return;
    const now = Date.now();
    const cooldown = SFX_COOLDOWN_MS[id] ?? 0;
    const last = this.lastPlayed.get(id) ?? 0;
    if (cooldown > 0 && now - last < cooldown) return;
    this.lastPlayed.set(id, now);
    try {
      const player = this.getSfxPlayer(id);
      if (!player) return;
      player.volume = this.state.soundEffectsVolume;
      void player
        .seekTo(0)
        .then(() => {
          player.play();
        })
        .catch(() => {
          try {
            player.play();
          } catch {
            // ignore
          }
        });
    } catch {
      // Missing asset / web autoplay block — fail soft
    }
  }

  async playMusic(track: MusicTrackId): Promise<void> {
    try {
      if (this.currentTrack === track && this.musicPlayer) {
        this.musicPlayer.volume = this.state.musicEnabled
          ? this.state.musicVolume
          : 0;
        if (this.state.musicEnabled && !this.musicPlayer.playing) {
          this.musicPlayer.play();
        }
        return;
      }
      await this.stopMusic();
      const player = createAudioPlayer(AUDIO_ASSETS.music[track]);
      player.loop = true;
      player.volume = this.state.musicEnabled ? this.state.musicVolume : 0;
      this.musicPlayer = player;
      this.currentTrack = track;
      if (this.state.musicEnabled) {
        player.play();
      }
    } catch {
      this.musicPlayer = null;
      this.currentTrack = null;
    }
  }

  async stopMusic(): Promise<void> {
    if (!this.musicPlayer) {
      this.currentTrack = null;
      return;
    }
    try {
      this.musicPlayer.pause();
      this.musicPlayer.remove();
    } catch {
      // ignore
    }
    this.musicPlayer = null;
    this.currentTrack = null;
  }

  pauseMusic(): void {
    try {
      this.musicPlayer?.pause();
    } catch {
      // ignore
    }
  }

  resumeMusic(): void {
    if (!this.state.musicEnabled || !this.musicPlayer) return;
    try {
      this.musicPlayer.volume = this.state.musicVolume;
      this.musicPlayer.play();
    } catch {
      // ignore
    }
  }

  async setAppActive(active: boolean): Promise<void> {
    try {
      await setIsAudioActiveAsync(active);
      if (!active) {
        this.pauseMusic();
      } else if (this.state.musicEnabled) {
        this.resumeMusic();
      }
    } catch {
      // ignore
    }
  }

  async dispose(): Promise<void> {
    await this.stopMusic();
    for (const player of this.sfxPlayers.values()) {
      try {
        player.remove();
      } catch {
        // ignore
      }
    }
    this.sfxPlayers.clear();
    this.ready = false;
  }
}

export const audioService = new AudioService();
