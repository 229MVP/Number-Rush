/**
 * Generates original placeholder synthesized WAV assets for Number Rush.
 * These are short programmatic tones — not copied from any commercial game.
 *
 * Run: node scripts/generateAudioAssets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sfxDir = path.join(root, 'assets/audio/sfx');
const musicDir = path.join(root, 'assets/audio/music');

fs.mkdirSync(sfxDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

function writeWav(filePath, samples, sampleRate = 22050) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((clamped * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function tone(freq, durationSec, opts = {}) {
  const sampleRate = opts.sampleRate ?? 22050;
  const volume = opts.volume ?? 0.35;
  const attack = opts.attack ?? 0.01;
  const release = opts.release ?? 0.08;
  const n = Math.floor(sampleRate * durationSec);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const env =
      Math.min(1, t / attack) *
      Math.min(1, (durationSec - t) / release);
    let sample = Math.sin(2 * Math.PI * freq * t);
    if (opts.saw) {
      sample = 2 * ((freq * t) % 1) - 1;
    }
    if (opts.noise) {
      sample = sample * 0.3 + (Math.random() * 2 - 1) * opts.noise;
    }
    out[i] = sample * volume * Math.max(0, env);
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function mix(a, b, gainB = 1) {
  const n = Math.max(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = (a[i] ?? 0) + (b[i] ?? 0) * gainB;
  }
  return out;
}

const sfx = {
  buttonTap: tone(880, 0.06, { volume: 0.22, release: 0.04 }),
  screenOpen: concat(
    tone(440, 0.08, { volume: 0.2 }),
    tone(660, 0.1, { volume: 0.18 }),
  ),
  tilePlace: tone(520, 0.08, { volume: 0.25, release: 0.05 }),
  perfect: concat(
    tone(660, 0.08, { volume: 0.28 }),
    tone(880, 0.1, { volume: 0.26 }),
    tone(1175, 0.12, { volume: 0.22 }),
  ),
  bust: mix(
    tone(180, 0.18, { volume: 0.3, saw: true, release: 0.1 }),
    tone(90, 0.18, { volume: 0.2, noise: 0.35 }),
  ),
  comboUp: concat(
    tone(740, 0.07, { volume: 0.22 }),
    tone(988, 0.1, { volume: 0.24 }),
  ),
  bomb: mix(
    tone(120, 0.22, { volume: 0.35, noise: 0.5, release: 0.12 }),
    tone(60, 0.22, { volume: 0.25, saw: true }),
  ),
  freeze: mix(
    tone(1200, 0.16, { volume: 0.18, release: 0.1 }),
    tone(1800, 0.16, { volume: 0.12, noise: 0.15 }),
  ),
  shield: concat(
    tone(400, 0.08, { volume: 0.22 }),
    tone(800, 0.12, { volume: 0.26 }),
  ),
  wild: concat(
    tone(523, 0.07, { volume: 0.2 }),
    tone(659, 0.07, { volume: 0.2 }),
    tone(784, 0.1, { volume: 0.22 }),
  ),
  swap: concat(
    tone(500, 0.07, { volume: 0.2 }),
    tone(350, 0.09, { volume: 0.22 }),
  ),
  reward: concat(
    tone(523, 0.08, { volume: 0.22 }),
    tone(659, 0.08, { volume: 0.22 }),
    tone(784, 0.12, { volume: 0.24 }),
  ),
  purchase: concat(
    tone(660, 0.07, { volume: 0.22 }),
    tone(990, 0.1, { volume: 0.24 }),
  ),
  missionClaim: concat(
    tone(587, 0.08, { volume: 0.22 }),
    tone(784, 0.12, { volume: 0.24 }),
  ),
  victory: concat(
    tone(523, 0.1, { volume: 0.24 }),
    tone(659, 0.1, { volume: 0.24 }),
    tone(784, 0.1, { volume: 0.24 }),
    tone(1046, 0.18, { volume: 0.26 }),
  ),
  gameOver: mix(
    tone(220, 0.28, { volume: 0.28, release: 0.15 }),
    tone(165, 0.28, { volume: 0.2, saw: true }),
  ),
  rankPromotion: concat(
    tone(440, 0.08, { volume: 0.22 }),
    tone(554, 0.08, { volume: 0.22 }),
    tone(659, 0.08, { volume: 0.22 }),
    tone(880, 0.16, { volume: 0.26 }),
  ),
};

for (const [name, samples] of Object.entries(sfx)) {
  writeWav(path.join(sfxDir, `${name}.wav`), samples);
}

/** Soft looping ambient pads — short loops suitable for placeholder BGM. */
function ambientLoop(baseFreq, durationSec = 4) {
  const sampleRate = 22050;
  const n = Math.floor(sampleRate * durationSec);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const a = Math.sin(2 * Math.PI * baseFreq * t) * 0.08;
    const b = Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.05;
    const c = Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.06;
    const pulse = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t);
    out[i] = (a + b + c) * pulse;
  }
  return out;
}

writeWav(path.join(musicDir, 'menu.wav'), ambientLoop(110, 6));
writeWav(path.join(musicDir, 'gameplay.wav'), ambientLoop(98, 6));
writeWav(path.join(musicDir, 'results.wav'), ambientLoop(130, 5));

console.log('Generated placeholder audio assets in assets/audio/');
