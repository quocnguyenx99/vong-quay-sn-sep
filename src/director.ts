import { gsap } from 'gsap';
import { sound } from './audio/sound';
import { padNumber } from './core/format';
import type { Particles } from './scene/particles';
import { PLAQUE, TRAIN_X } from './scene/train.config';
import type { Train } from './scene/train';
import type { World } from './scene/world';
import { LIMITS, store } from './state/store';
import { confirmDialog } from './ui/dialog';
import type { FlapBoard } from './ui/flapBoard';
import type { Leaderboard } from './ui/leaderboard';
import type { Celebration } from './ui/winnerTicket';

export type Phase = 'boarding' | 'idle' | 'running' | 'arrived' | 'celebrating' | 'leaving';

/** Departure ramp-up, seconds. */
const DEPART = 1.2;
/** Lever and bell before the wheels turn, ms. */
const DEPART_DELAY = 600;
/** Speed that maps to 1.0 for effects, px/s. */
const SPEED_REF = 2200;

interface Spin {
  t0: number;
  run: number;
  draw: number;
  vmax: number;
  /** Seconds after t0; Infinity until the operator pulls the brake in manual mode. */
  brakeAt: number;
  manual: boolean;
  scroll0: number;
  trainFrom: number;
  trainMid: number;
  target: number;
  preview: boolean;
  braking: boolean;
  tunnel: { start: number; end: number } | null;
}

interface Deps {
  world: World;
  train: Train;
  particles: Particles;
  board: FlapBoard;
  celebration: Celebration;
  leaderboard: Leaderboard;
  leaderboardEl: HTMLElement;
  tunnel: HTMLElement;
  headlight: HTMLElement;
  tint: HTMLElement;
  onPhase: (p: Phase) => void;
}

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

export class Director {
  phase: Phase = 'boarding';
  private scroll = 0;
  private trainX = TRAIN_X.idle;
  private lastTrainX = TRAIN_X.idle;
  private spin: Spin | null = null;
  private lastNow = performance.now();
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private d: Deps) {
    gsap.ticker.add(() => this.tick());
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    this.d.onPhase(p);
  }

  /** After the boarding screen: resume an interrupted draw or wait at the platform. */
  begin(): void {
    const pending = store.pending;
    if (pending) {
      const num = padNumber(pending.number, store.digits);
      this.d.board.show(num, true);
      this.d.board.setTrip(store.winners.length + 1);
      this.d.board.setLamp('stop');
      this.trainX = TRAIN_X.stop;
      this.d.train.setPlaque(num);
      gsap.set(this.d.leaderboardEl, { x: 420 });
      this.celebrate(pending.number, pending.time, false);
      return;
    }
    this.d.board.setTrip(store.winners.length ? store.winners.length : null);
    this.setPhase('idle');
  }

  /** Space / Enter / the big button. */
  primary(): void {
    if (this.phase === 'idle') this.depart(false);
    else if (this.phase === 'running' && this.spin?.manual && !this.spin.braking) this.pullBrake();
    else if (this.phase === 'celebrating') void this.confirmWin();
  }

  depart(preview: boolean): void {
    if (this.phase !== 'idle') return;
    let target: number;
    if (preview) target = store.previewNumber();
    else {
      const p = store.draw();
      if (!p) return;
      target = p.number;
    }
    const c = store.config;
    const manual = c.brakeMode === 'manual';
    const run = c.runSeconds;
    const now = performance.now();
    const showTunnel = !this.reducedMotion && (manual || run >= 6);
    const tStart = DEPART + (manual ? 2.5 : run * 0.35);
    this.spin = {
      t0: now + DEPART_DELAY,
      run,
      draw: c.drawSeconds,
      vmax: Math.min(2400, 900 + 60 * run),
      brakeAt: manual ? Infinity : DEPART + run,
      manual,
      scroll0: this.scroll,
      trainFrom: this.trainX,
      trainMid: this.trainX + (TRAIN_X.stop - this.trainX) * 0.45,
      target,
      preview,
      braking: false,
      tunnel: showTunnel ? { start: tStart, end: tStart + Math.min(2, Math.max(1.4, run * 0.22)) } : null,
    };

    this.d.board.setTrip(preview ? null : store.winners.length + 1);
    this.d.board.startSpin(now + DEPART_DELAY);
    this.d.board.setLamp('run');
    this.d.train.setPlaque('- - -');
    gsap.to(this.d.leaderboardEl, { x: 420, duration: 0.6, ease: 'power2.in' });
    sound.lever();
    setTimeout(() => sound.bell(), 150);
    setTimeout(() => {
      sound.steam(0.8);
      this.d.particles.steamBurst(this.d.train.cylinder, 1);
      sound.startRun(this.scroll + this.trainX);
    }, DEPART_DELAY - 100);
    this.setPhase('running');
  }

  private pullBrake(): void {
    const s = this.spin!;
    const t = (performance.now() - s.t0) / 1000;
    if (t < DEPART) return;
    s.brakeAt = t;
  }

  /** Distance travelled since t0 for the speed profile: ease-in, cruise, cubic brake. */
  private distanceAt(s: Spin, t: number): { x: number; v: number } {
    if (t <= 0) return { x: 0, v: 0 };
    const V = s.vmax;
    if (t < DEPART) return { x: (V * t ** 3) / (3 * DEPART ** 2), v: V * (t / DEPART) ** 2 };
    const x1 = (V * DEPART) / 3;
    if (t < s.brakeAt) return { x: x1 + V * (t - DEPART), v: V };
    const x2 = x1 + V * (s.brakeAt - DEPART);
    const u = Math.min((t - s.brakeAt) / s.draw, 1);
    return { x: x2 + (V * s.draw * (1 - (1 - u) ** 3)) / 3, v: V * (1 - u) ** 2 };
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min((now - this.lastNow) / 1000, 0.05);
    this.lastNow = now;
    let v = 0;

    const s = this.spin;
    if (this.phase === 'running' && s) {
      const t = (now - s.t0) / 1000;
      if (s.manual && s.brakeAt === Infinity && t > DEPART + LIMITS.manualMaxRunSeconds) s.brakeAt = t;
      if (!s.braking && t >= s.brakeAt) this.startBraking(s, now - (t - s.brakeAt) * 1000);

      const { x, v: vel } = this.distanceAt(s, t);
      v = vel;
      this.scroll = s.scroll0 + x;
      if (!s.braking) {
        this.trainX = s.trainFrom + (s.trainMid - s.trainFrom) * easeInOut(Math.min(Math.max(t, 0) / 3, 1));
      } else {
        const u = Math.min((t - s.brakeAt) / s.draw, 1);
        this.trainX = s.trainMid + (TRAIN_X.stop - s.trainMid) * (1 - (1 - u) ** 3);
        if (vel > 150 && Math.random() < 0.6) this.d.particles.sparks(this.d.train.driverContacts, 2);
      }
      this.updateTunnel(s, t);
      const total = s.braking || !s.manual ? Math.min(s.brakeAt, 1e6) + s.draw : DEPART + LIMITS.manualMaxRunSeconds;
      this.d.tint.style.opacity = String(0.16 * Math.min(Math.max(t / total, 0), 1));
      this.d.board.update(now, Math.min(vel / SPEED_REF, 1));
      // Wait for the last flap to land; the grace period covers a backgrounded tab.
      const end = s.brakeAt + s.draw;
      if (s.braking && t >= end && (this.d.board.settled || t >= end + 0.5)) this.arrive(s);
    } else {
      // Train moved by tweens (arrival jolt, leaving, rolling in): derive speed from motion.
      v = Math.abs(this.trainX - this.lastTrainX) / Math.max(dt, 1e-3);
    }

    const speed = Math.min(v / SPEED_REF, 1);
    const dist = this.scroll + this.trainX;
    const bob = this.reducedMotion ? 0 : Math.sin(dist * 0.045) * 1.8 * speed;
    this.d.world.update(this.scroll);
    this.d.train.setPose(this.trainX, dist, bob);
    this.lastTrainX = this.trainX;

    const p = this.d.particles;
    p.source = this.d.train.stack;
    p.wind = this.phase === 'running' ? v : 0;
    p.smokeRate = 2.2 + 24 * speed;
    p.update(dt);
    sound.travel(dist, speed);
  }

  private startBraking(s: Spin, brakeStartMs: number): void {
    s.braking = true;
    this.d.board.scheduleLock(padNumber(s.target, store.digits), brakeStartMs, s.draw * 1000);
    sound.brake(s.draw);
    sound.drumroll(s.draw);
  }

  private updateTunnel(s: Spin, t: number): void {
    const tn = s.tunnel;
    let o = 0;
    if (tn && !s.braking && t > tn.start && t < tn.end + 0.3) {
      o = t < tn.start + 0.25 ? (t - tn.start) / 0.25 : t > tn.end ? 1 - (t - tn.end) / 0.3 : 1;
    }
    o = Math.max(0, Math.min(o, 1));
    this.d.tunnel.style.opacity = String(o * 0.9);
    if (o > 0) {
      const h = this.d.train.headlight;
      this.d.headlight.style.transform = `translate3d(${h.x}px, ${h.y}px, 0)`;
    }
    this.d.board.glow(o > 0.5);
  }

  private arrive(s: Spin): void {
    this.setPhase('arrived');
    this.scroll = s.scroll0 + this.distanceAt(s, Infinity).x;
    this.d.tunnel.style.opacity = '0';
    this.d.board.glow(false);
    const num = padNumber(s.target, store.digits);
    if (!this.d.board.settled) this.d.board.show(num, true);
    this.d.board.setLamp('stop');
    this.d.train.setPlaque(num);
    sound.stopDrumroll();
    sound.stopRun();
    sound.whistle();
    sound.steam(1);
    this.d.particles.steamBurst(this.d.train.cylinder, 1.4);
    gsap
      .timeline()
      .to(this, { trainX: TRAIN_X.stop + 9, duration: 0.12, ease: 'power1.out' })
      .to(this, { trainX: TRAIN_X.stop, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    const time = s.preview ? Date.now() : store.pending?.time ?? Date.now();
    setTimeout(() => this.celebrate(s.target, time, s.preview), 900);
  }

  private celebrate(number: number, time: number, preview: boolean): void {
    this.setPhase('celebrating');
    const c = this.d.celebration;
    c.onContinue = () => void this.confirmWin();
    c.onAbsent = () => void this.markAbsent();
    c.show(
      { number, time, seq: preview ? null : store.winners.length + 1, preview },
      { x: this.trainX + PLAQUE.left + PLAQUE.width / 2, y: 590 + PLAQUE.top },
    );
  }

  private async confirmWin(): Promise<void> {
    if (this.phase !== 'celebrating') return;
    this.setPhase('leaving');
    const preview = this.spin?.preview ?? false;
    if (!preview) store.resolvePending('win');
    await this.d.celebration.hideToBoard();
    this.d.leaderboard.render();
    this.d.board.setTrip(store.winners.length || null);
    this.leave();
  }

  private async markAbsent(): Promise<void> {
    if (this.phase !== 'celebrating') return;
    const num = padNumber(store.pending?.number ?? 0, store.digits);
    const ok = await confirmDialog({
      title: `Vé ${num} vắng mặt?`,
      body: 'Vé sẽ <b>không</b> được ghi lên bảng vinh danh và bị <b>loại khỏi các lượt quay sau</b>. Không thể hoàn tác.',
      confirm: 'Xác nhận vắng mặt',
      danger: true,
    });
    if (!ok || this.phase !== 'celebrating') return;
    this.setPhase('leaving');
    store.resolvePending('absent');
    await this.d.celebration.hideTorn();
    this.d.board.clear();
    this.leave();
  }

  /** Train pulls out to the right, the next one rolls in from the left. */
  private leave(): void {
    this.spin = null;
    this.d.tint.style.opacity = '0';
    sound.startRun(this.scroll + this.trainX);
    gsap
      .timeline({
        onComplete: () => {
          sound.stopRun();
          this.d.board.setLamp('idle');
          this.setPhase('idle');
        },
      })
      .to(this, { trainX: TRAIN_X.offRight, duration: 2.2, ease: 'power2.in' })
      .add(() => {
        this.trainX = this.lastTrainX = TRAIN_X.offLeft;
        this.d.train.setPlaque('- - -');
      })
      .to(this.d.leaderboardEl, { x: 0, duration: 0.6, ease: 'power2.out' }, '<')
      .to(this, { trainX: TRAIN_X.idle, duration: 2.6, ease: 'power3.out' })
      .add(() => {
        sound.steam(0.5);
        this.d.particles.steamBurst(this.d.train.cylinder, 0.6);
      }, '-=0.3');
  }
}
