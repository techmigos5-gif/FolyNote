// Web Audio API ambient nature sound generator
// Synthesizes natural sounds client-side with 0 external network requests

class NatureAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentMode: 'breeze' | 'chime' | 'water' = 'breeze';
  private timerId: number | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create a pink noise buffer for realistic natural wind / water
  private createNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Synthesizes mountain wind through pine trees
  private startBreeze() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(6);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to soft whispering wind frequencies
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Wind modulation LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // slow breath
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(breezeGain);
    breezeGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.activeNodes.push(noiseSource, lfo, filter, breezeGain);
  }

  // Synthesizes gentle twilight lake water ripples
  private startWater() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // Ripple modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.activeNodes.push(noiseSource, lfo, filter, waterGain);
  }

  // Plays a meditative singing bowl harmonic chime
  public playSingingBowl() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreq = 261.63; // Middle C / warm resonant tone
    const harmonics = [1, 2.76, 5.4, 8.9];
    const harmonicWeights = [0.6, 0.25, 0.1, 0.05];

    harmonics.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      // Subtle detune for shimmer
      osc.detune.setValueAtTime(idx * 2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(harmonicWeights[idx] * 0.4, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 6.5);
    });
  }

  // Continuous singing bowl chime repeats periodically
  private startChimes() {
    this.playSingingBowl();
    this.timerId = window.setInterval(() => {
      this.playSingingBowl();
    }, 7000);
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.1);
    }
  }

  public play(mode: 'breeze' | 'chime' | 'water' = 'breeze') {
    this.stop();
    this.init();
    this.currentMode = mode;
    this.isPlaying = true;

    if (mode === 'breeze') {
      this.startBreeze();
    } else if (mode === 'water') {
      this.startWater();
    } else if (mode === 'chime') {
      this.startChimes();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.activeNodes.forEach((node) => {
      if (node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        try {
          (node as AudioScheduledSourceNode).stop();
        } catch {
          // ignore already stopped
        }
      }
      if (node && typeof (node as AudioNode).disconnect === 'function') {
        try {
          (node as AudioNode).disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.activeNodes = [];
  }

  public toggle(mode?: 'breeze' | 'chime' | 'water') {
    if (this.isPlaying && (!mode || mode === this.currentMode)) {
      this.stop();
      return false;
    } else {
      this.play(mode || this.currentMode);
      return true;
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      mode: this.currentMode,
    };
  }
}

export const natureAudio = new NatureAudioSynthesizer();
