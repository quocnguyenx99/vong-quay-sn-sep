/**
 * Web Audio stand-ins for every sound in docs/tech-train.md §5, so the app is never silent
 * before the real recordings are added.
 */
export class Synth {
  private noise: AudioBuffer;

  constructor(
    private ctx: AudioContext,
    private out: AudioNode,
  ) {
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  private get now(): number {
    return this.ctx.currentTime;
  }

  private burst(o: {
    at?: number;
    dur: number;
    type: BiquadFilterType;
    freq: number;
    q?: number;
    gain: number;
    attack?: number;
    dest?: AudioNode;
  }): void {
    const t = o.at ?? this.now;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = o.type;
    f.frequency.value = o.freq;
    f.Q.value = o.q ?? 1;
    const g = this.ctx.createGain();
    const a = o.attack ?? 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f).connect(g).connect(o.dest ?? this.out);
    src.start(t, Math.random() * 1.5);
    src.stop(t + o.dur + 0.05);
  }

  private tone(o: { at?: number; freq: number; to?: number; dur: number; gain: number; type?: OscillatorType }): void {
    const t = o.at ?? this.now;
    const osc = this.ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(this.out);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  flap(): void {
    this.burst({ dur: 0.035, type: 'bandpass', freq: 2600, q: 2.5, gain: 0.28 });
    this.burst({ dur: 0.02, type: 'highpass', freq: 5000, gain: 0.12 });
  }

  chug(intensity: number): void {
    this.burst({ dur: 0.16, type: 'lowpass', freq: 520 + intensity * 500, gain: 0.25 + intensity * 0.35, attack: 0.008 });
    this.burst({ dur: 0.1, type: 'bandpass', freq: 1800, q: 0.7, gain: 0.06 + intensity * 0.08 });
  }

  clack(intensity: number): void {
    const t = this.now;
    for (const dt of [0, 0.075]) {
      this.burst({ at: t + dt, dur: 0.03, type: 'bandpass', freq: 1600, q: 3, gain: 0.12 + intensity * 0.18 });
    }
  }

  steam(strength = 1): void {
    this.burst({ dur: 1.3 * strength, type: 'highpass', freq: 2400, gain: 0.32 * strength, attack: 0.04 });
  }

  whistle(): void {
    const t = this.now;
    const dur = 2.3;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.22, t + 0.14);
    master.gain.setValueAtTime(0.22, t + dur - 0.5);
    master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    master.connect(lp).connect(this.out);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 5.2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain);
    for (const f of [370, 466, 554]) {
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f * 0.93, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.18);
      lfoGain.connect(o.frequency);
      o.connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
    this.burst({ at: t, dur, type: 'bandpass', freq: 1500, q: 0.8, gain: 0.07, attack: 0.1 });
  }

  bell(): void {
    const t = this.now;
    for (const dt of [0, 0.38]) {
      this.tone({ at: t + dt, freq: 1318, dur: 1.2, gain: 0.18 });
      this.tone({ at: t + dt, freq: 2637, dur: 0.6, gain: 0.06 });
    }
  }

  lever(): void {
    this.burst({ dur: 0.14, type: 'lowpass', freq: 380, gain: 0.5 });
    this.tone({ freq: 140, to: 60, dur: 0.16, gain: 0.3 });
    this.burst({ dur: 0.03, type: 'bandpass', freq: 3200, q: 2, gain: 0.2 });
  }

  punch(): void {
    this.burst({ dur: 0.025, type: 'bandpass', freq: 3200, q: 2, gain: 0.35 });
    this.tone({ freq: 170, to: 55, dur: 0.14, gain: 0.4 });
  }

  tear(): void {
    const t = this.now;
    for (let i = 0; i < 16; i++) {
      this.burst({ at: t + i * 0.028 + Math.random() * 0.01, dur: 0.05, type: 'bandpass', freq: 1800 + Math.random() * 1600, q: 0.9, gain: 0.15 + Math.random() * 0.12 });
    }
  }

  brake(duration: number): void {
    const t = this.now;
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(2350, t);
    o.frequency.linearRampToValueAtTime(2150, t + duration);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 7;
    const lg = this.ctx.createGain();
    lg.gain.value = 30;
    lfo.connect(lg).connect(o.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
    g.gain.setValueAtTime(0.05, t + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g).connect(this.out);
    o.start(t);
    lfo.start(t);
    o.stop(t + duration + 0.05);
    lfo.stop(t + duration + 0.05);
  }

  applause(): void {
    const t = this.now;
    for (let i = 0; i < 140; i++) {
      const at = t + Math.random() * 2.6;
      this.burst({ at, dur: 0.03, type: 'bandpass', freq: 1400 + Math.random() * 2200, q: 1.2, gain: 0.04 + Math.random() * 0.05 * (1 - (at - t) / 3) });
    }
  }

  /** Accelerating snare roll with crescendo; returns a stop function. */
  drumroll(duration: number): () => void {
    const bus = this.ctx.createGain();
    bus.gain.value = 1;
    bus.connect(this.out);
    const t0 = this.now;
    let t = t0;
    while (t < t0 + duration) {
      const p = (t - t0) / duration;
      this.burst({ at: t, dur: 0.06, type: 'bandpass', freq: 900, q: 0.8, gain: 0.08 + p * 0.3, dest: bus });
      t += 0.09 - p * 0.05;
    }
    return () => {
      bus.gain.setTargetAtTime(0.0001, this.now, 0.05);
      setTimeout(() => bus.disconnect(), 400);
    };
  }
}
