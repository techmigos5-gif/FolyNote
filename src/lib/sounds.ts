/**
 * FolyNote calm sounds — fully synthesized with the Web Audio API.
 * No audio assets: every soundscape is generated procedurally, so it costs
 * zero bytes of download and works offline in the browser and in Capacitor.
 *
 * Scapes:
 *  - rain:   band-passed noise with slow swell
 *  - ocean:  low-passed noise with a 12s wave LFO
 *  - forest: airy leaf shimmer + random pentatonic bird chirps
 *  - night:  warm drone pad + rare soft pings
 *  - stream: bubbling band-passed noise with water blips
 */

export type SoundscapeId = 'rain' | 'ocean' | 'forest' | 'night' | 'stream';

export const SOUNDSCAPES: { id: SoundscapeId; name: string; emoji: string; description: string }[] = [
  { id: 'rain', name: 'Gentle Rain', emoji: '🌧️', description: 'Soft rainfall on a window' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', description: 'Slow rolling surf' },
  { id: 'forest', name: 'Forest Morning', emoji: '🌿', description: 'Leaves and distant songbirds' },
  { id: 'night', name: 'Night Hum', emoji: '🌙', description: 'Warm drone under a quiet sky' },
  { id: 'stream', name: 'Forest Stream', emoji: '💧', description: 'Bubbling water over stones' },
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let active: { id: SoundscapeId; stop: () => void } | null = null;
let volume = 0.55;

function ensureCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = c.sampleRate * 2;
  noiseBuffer = c.createBuffer(1, len, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0; // cheap pink-ish filter state
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099;
    b1 = 0.963 * b1 + white * 0.2965;
    b2 = 0.57 * b2 + white * 1.0526;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
  }
  return noiseBuffer;
}

function loopNoise(c: AudioContext, gainValue: number): { src: AudioBufferSourceNode; gain: GainNode } {
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  src.loop = true;
  const gain = c.createGain();
  gain.gain.value = gainValue;
  src.connect(gain);
  src.start();
  return { src, gain };
}

/** A short FM-ish chirp used for birds and water blips. */
function blip(c: AudioContext, out: AudioNode, freq: number, dur: number, gainValue: number, sweep = 0) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  const t = c.currentTime;
  osc.frequency.setValueAtTime(freq, t);
  if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

const buildRain = (c: AudioContext): (() => void) => {
  const { src, gain } = loopNoise(c, 0.55);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900;
  bp.Q.value = 0.4;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.09;
  lfoGain.gain.value = 0.18;
  lfo.connect(lfoGain).connect(gain.gain);
  gain.connect(bp).connect(master!);
  lfo.start();
  return () => {
    src.stop(); lfo.stop();
    gain.disconnect(); bp.disconnect();
  };
};

const buildOcean = (c: AudioContext): (() => void) => {
  const { src, gain } = loopNoise(c, 0.7);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.08; // ~12s wave cycle
  lfoGain.gain.value = 0.55;
  lfo.connect(lfoGain).connect(gain.gain);
  const flfo = c.createOscillator();
  const flfoGain = c.createGain();
  flfo.frequency.value = 0.08;
  flfoGain.gain.value = 220;
  flfo.connect(flfoGain).connect(lp.frequency);
  gain.connect(lp).connect(master!);
  lfo.start(); flfo.start();
  return () => {
    src.stop(); lfo.stop(); flfo.stop();
    gain.disconnect(); lp.disconnect();
  };
};

const buildForest = (c: AudioContext): (() => void) => {
  const { src, gain } = loopNoise(c, 0.12);
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2400;
  gain.connect(hp).connect(master!);
  const scale = [2093, 2349, 2637, 3136, 3520]; // pentatonic-ish high register
  const timer = window.setInterval(() => {
    if (Math.random() < 0.75) {
      blip(c, master!, scale[Math.floor(Math.random() * scale.length)], 0.18, 0.05, Math.random() * 400 - 200);
    }
  }, 2600);
  return () => {
    src.stop(); window.clearInterval(timer);
    gain.disconnect(); hp.disconnect();
  };
};

const buildNight = (c: AudioContext): (() => void) => {
  const oscs: OscillatorNode[] = [];
  const padGain = c.createGain();
  padGain.gain.value = 0.05;
  [110, 164.81, 220].forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = c.createGain();
    g.gain.value = [0.5, 0.25, 0.18][i];
    osc.connect(g).connect(padGain);
    osc.start();
    oscs.push(osc);
  });
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain).connect(padGain.gain);
  padGain.connect(master!);
  lfo.start();
  const timer = window.setInterval(() => {
    if (Math.random() < 0.4) blip(c, master!, 1318.5, 0.5, 0.02, -60);
  }, 9000);
  return () => {
    oscs.forEach((o) => o.stop());
    lfo.stop(); window.clearInterval(timer);
    padGain.disconnect();
  };
};

const buildStream = (c: AudioContext): (() => void) => {
  const { src, gain } = loopNoise(c, 0.4);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1500;
  bp.Q.value = 0.8;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.5;
  lfoGain.gain.value = 500;
  lfo.connect(lfoGain).connect(bp.frequency);
  gain.connect(bp).connect(master!);
  lfo.start();
  const timer = window.setInterval(() => {
    blip(c, master!, 400 + Math.random() * 700, 0.1, 0.05, 200 + Math.random() * 200);
  }, 1800);
  return () => {
    src.stop(); lfo.stop(); window.clearInterval(timer);
    gain.disconnect(); bp.disconnect();
  };
};

const BUILDERS: Record<SoundscapeId, (c: AudioContext) => () => void> = {
  rain: buildRain,
  ocean: buildOcean,
  forest: buildForest,
  night: buildNight,
  stream: buildStream,
};

/** Start (or switch) the ambient soundscape. Cross-fades over ~0.8s. */
export function startSoundscape(id: SoundscapeId, vol?: number): void {
  const c = ensureCtx();
  if (vol !== undefined) setVolume(vol);
  if (active) {
    if (active.id === id) return;
    stopSoundscape();
  }
  const stop = BUILDERS[id](c);
  active = { id, stop };
  if (master) {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(0.0001, c.currentTime);
    master.gain.exponentialRampToValueAtTime(volume, c.currentTime + 0.8);
  }
}

/** Fade out and stop any playing soundscape. */
export function stopSoundscape(): void {
  if (!active || !ctx || !master) return;
  const t = ctx.currentTime;
  const stopFn = active.stop;
  active = null;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  window.setTimeout(stopFn, 700);
}

export function setVolume(v: number): void {
  volume = Math.min(1, Math.max(0, v));
  if (ctx && master && active) {
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
  }
}

export function isSoundscapePlaying(): boolean {
  return active !== null;
}

export function currentSoundscape(): SoundscapeId | null {
  return active?.id ?? null;
}

/** One-shot soft bell used for reminder alerts and breathing phase changes. */
export function playChime(vol = 0.35, note = 880): void {
  const c = ensureCtx();
  const t = c.currentTime;
  [note, note * 2.01, note * 3.02].forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    const amp = [vol, vol * 0.35, vol * 0.15][i];
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(amp, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4 - i * 0.35);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(t);
    osc.stop(t + 1.6);
  });
}
