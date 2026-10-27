import { Howl, Howler } from 'howler';
import { Synth } from './synth';

/** Recordings from docs/tech-train.md §5, placed in public/audio/ as .ogg or .mp3. */
const FILES = {
  whistle: 'whistle',
  chugLoop: 'chug-loop',
  clackLoop: 'rail-clack-loop',
  steam: 'steam-release',
  brake: 'brake-squeal',
  bell: 'station-bell',
  lever: 'lever-clunk',
  flap: 'flap-tick',
  punch: 'ticket-punch',
  drumroll: 'drumroll',
  applause: 'applause',
  tear: 'paper-tear',
} as const;

type Name = keyof typeof FILES;

function tryLoad(src: string, loop: boolean): Promise<Howl | null> {
  return new Promise((resolve) => {
    const h = new Howl({
      src: [src],
      loop,
      preload: true,
      onload: () => resolve(h),
      onloaderror: () => resolve(null),
    });
    setTimeout(() => resolve(h.state() === 'loaded' ? h : null), 5000);
  });
}

/** Distance between chuffs: four per driver revolution (r = 50px). */
const CHUG_STEP = (2 * Math.PI * 50) / 4;
/** Rail joint spacing. */
const CLACK_STEP = 420;

export class Sound {
  private howls = new Map<Name, Howl>();
  private synth: Synth | null = null;
  private lastFlap = 0;
  private nextChugAt = 0;
  private nextClackAt = 0;
  private stopRoll: (() => void) | null = null;
  private running = false;

  async init(): Promise<void> {
    await Promise.all(
      (Object.keys(FILES) as Name[]).map(async (name) => {
        const loop = name === 'chugLoop' || name === 'clackLoop';
        const h = (await tryLoad(`audio/${FILES[name]}.ogg`, loop)) ?? (await tryLoad(`audio/${FILES[name]}.mp3`, loop));
        if (h) this.howls.set(name, h);
      }),
    );
  }

  /** Must run inside a user gesture (the boarding button). */
  unlock(): void {
    const ctx = Howler.ctx;
    if (ctx && ctx.state !== 'running') void ctx.resume();
    if (ctx && !this.synth) this.synth = new Synth(ctx, Howler.masterGain);
  }

  setVolume(v: number): void {
    Howler.volume(v);
  }

  setMuted(m: boolean): void {
    Howler.mute(m);
  }

  private one(name: Name, fallback: (s: Synth) => void, volume = 1): void {
    const h = this.howls.get(name);
    if (h) {
      const id = h.play();
      h.volume(volume, id);
    } else if (this.synth) fallback(this.synth);
  }

  whistle(): void {
    this.one('whistle', (s) => s.whistle());
  }
  steam(strength = 1): void {
    this.one('steam', (s) => s.steam(strength), strength);
  }
  bell(): void {
    this.one('bell', (s) => s.bell(), 0.7);
  }
  lever(): void {
    this.one('lever', (s) => s.lever());
  }
  punch(): void {
    this.one('punch', (s) => s.punch());
  }
  tear(): void {
    this.one('tear', (s) => s.tear());
  }
  applause(): void {
    this.one('applause', (s) => s.applause(), 0.6);
  }
  /** The recording is longer than any draw, so it is faded out as the train stops. */
  brake(duration: number): void {
    const h = this.howls.get('brake');
    if (!h) {
      this.synth?.brake(duration);
      return;
    }
    const id = h.play();
    h.volume(0.45, id);
    const fadeMs = Math.min(800, duration * 400);
    setTimeout(() => h.fade(0.45, 0, fadeMs, id), duration * 1000 - fadeMs);
    setTimeout(() => h.stop(id), duration * 1000 + 50);
  }

  flap(): void {
    const now = performance.now();
    if (now - this.lastFlap < 28) return;
    this.lastFlap = now;
    this.one('flap', (s) => s.flap(), 0.5);
  }

  drumroll(duration: number): void {
    this.stopDrumroll();
    const h = this.howls.get('drumroll');
    if (h) {
      const id = h.play();
      h.fade(0.2, 0.9, duration * 1000, id);
      this.stopRoll = () => h.fade(0.9, 0, 250, id);
    } else if (this.synth) {
      this.stopRoll = this.synth.drumroll(duration);
    }
  }

  stopDrumroll(): void {
    this.stopRoll?.();
    this.stopRoll = null;
  }

  startRun(distance: number): void {
    this.running = true;
    this.nextChugAt = distance + CHUG_STEP;
    this.nextClackAt = distance + CLACK_STEP;
    for (const n of ['chugLoop', 'clackLoop'] as const) {
      const h = this.howls.get(n);
      if (h && !h.playing()) {
        h.volume(0);
        h.play();
      }
    }
  }

  /** Called every frame while the train moves. `speed` is 0..1. */
  travel(distance: number, speed: number): void {
    if (!this.running) return;
    const chug = this.howls.get('chugLoop');
    const clack = this.howls.get('clackLoop');
    if (chug) {
      // Rate also shifts pitch; past ~1.3x a real recording starts to sound toy-like.
      chug.rate(0.75 + speed * 0.55);
      chug.volume(0.2 + speed * 0.65);
    } else if (this.synth && distance >= this.nextChugAt) {
      this.synth.chug(speed);
      // At high speed the chuffs merge; keep at most ~14 per second.
      this.nextChugAt = distance + Math.max(CHUG_STEP, speed * 2200 * 0.07);
    }
    if (clack) {
      clack.rate(0.7 + speed * 0.8);
      clack.volume(speed * 0.7);
    } else if (this.synth && distance >= this.nextClackAt) {
      this.synth.clack(speed);
      this.nextClackAt = distance + CLACK_STEP;
    }
  }

  stopRun(): void {
    this.running = false;
    for (const n of ['chugLoop', 'clackLoop'] as const) {
      const h = this.howls.get(n);
      if (h?.playing()) {
        h.fade(h.volume(), 0, 400);
        setTimeout(() => h.stop(), 450);
      }
    }
  }
}

export const sound = new Sound();
