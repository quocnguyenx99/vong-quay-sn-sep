import { asset } from '../core/assets';
import type { Point } from './train';

type Kind = 'smoke' | 'steam' | 'spark';

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  grow: number;
  rot: number;
  vr: number;
  sprite: number;
  alpha: number;
}

const MAX = 260;

/** Engraved cloud puff: overlapping circle outlines, interiors filled with paper. */
function drawPuff(seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  let s = seed;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const blobs = Array.from({ length: 6 }, () => ({
    x: 128 + (r() - 0.5) * 110,
    y: 128 + (r() - 0.5) * 70,
    r: 34 + r() * 30,
  }));
  g.lineWidth = 6;
  g.strokeStyle = '#D6B47E';
  for (const b of blobs) {
    g.beginPath();
    g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = '#F3EFE8';
  for (const b of blobs) {
    g.beginPath();
    g.arc(b.x, b.y, b.r - 3, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 2.2;
  g.strokeStyle = '#E0C493';
  for (const b of blobs.slice(0, 4)) {
    g.beginPath();
    g.arc(b.x + b.r * 0.15, b.y + b.r * 0.1, b.r * 0.55, Math.PI * 0.9, Math.PI * 1.7);
    g.stroke();
  }
  return c;
}

export class Particles {
  private g: CanvasRenderingContext2D;
  private pool: Particle[] = [];
  private sprites: CanvasImageSource[] = [];
  private emitDebt = 0;
  private density = 1;
  /** Horizontal drift applied to new smoke (px/s), i.e. the world speed. */
  wind = 0;
  /** Smoke puffs per second. */
  smokeRate = 2.5;
  source: Point = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = 1920;
    canvas.height = 1080;
    this.g = canvas.getContext('2d')!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) this.density = 0.3;
  }

  async init(): Promise<void> {
    const imgs = await Promise.all([1, 2, 3, 4].map((i) => asset(`fx/smoke-puff-${i}`)));
    const real = imgs.filter((i): i is HTMLImageElement => i !== null);
    this.sprites = real.length ? real : [11, 23, 37, 59].map(drawPuff);
  }

  /** Lowers particle counts on slow machines. */
  setDensity(d: number): void {
    this.density = Math.max(0.2, Math.min(1, d));
  }

  private spawn(p: Omit<Particle, 'age'>): void {
    if (this.pool.length >= MAX) this.pool.shift();
    this.pool.push({ ...p, age: 0 });
  }

  steamBurst(at: Point, strength = 1): void {
    const n = Math.round(14 * strength * this.density);
    for (let i = 0; i < n; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      this.spawn({
        kind: 'steam',
        x: at.x + (Math.random() - 0.5) * 20,
        y: at.y + (Math.random() - 0.5) * 16,
        vx: dir * (120 + Math.random() * 260) * strength,
        vy: -10 - Math.random() * 40,
        life: 0.9 + Math.random() * 0.7,
        size: 50 + Math.random() * 40,
        grow: 2.2,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 1.2,
        sprite: i % this.sprites.length,
        alpha: 0.75,
      });
    }
  }

  sparks(points: Point[], count: number): void {
    for (let i = 0; i < count * this.density; i++) {
      const p = points[Math.floor(Math.random() * points.length)];
      this.spawn({
        kind: 'spark',
        x: p.x,
        y: p.y,
        vx: -80 - Math.random() * 260,
        vy: -60 - Math.random() * 160,
        life: 0.25 + Math.random() * 0.35,
        size: 2 + Math.random() * 2,
        grow: 0,
        rot: 0,
        vr: 0,
        sprite: 0,
        alpha: 1,
      });
    }
  }

  update(dt: number): void {
    this.emitDebt += this.smokeRate * this.density * dt;
    while (this.emitDebt >= 1) {
      this.emitDebt -= 1;
      this.spawn({
        kind: 'smoke',
        x: this.source.x + (Math.random() - 0.5) * 10,
        y: this.source.y,
        vx: -this.wind * 0.85 + (Math.random() - 0.5) * 30,
        vy: -50 - Math.random() * 45 - this.wind * 0.04,
        life: 2.4 + Math.random() * 1.2,
        size: 46 + Math.random() * 26,
        grow: 1.6 + Math.random() * 0.8,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.6,
        sprite: Math.floor(Math.random() * this.sprites.length),
        alpha: 0.95,
      });
    }

    const g = this.g;
    g.clearRect(0, 0, 1920, 1080);
    const alive: Particle[] = [];
    for (const p of this.pool) {
      p.age += dt;
      if (p.age >= p.life) continue;
      alive.push(p);
      const t = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.kind === 'spark') {
        p.vy += 900 * dt;
        g.globalAlpha = 1 - t;
        g.fillStyle = t < 0.4 ? '#FFE3A8' : '#E39A52';
        g.fillRect(p.x, p.y, p.size, p.size);
        continue;
      }
      p.vy *= 1 - 0.6 * dt;
      p.vx *= 1 - (p.kind === 'steam' ? 2.2 : 0.25) * dt;
      const size = p.size * (1 + p.grow * t);
      g.globalAlpha = p.alpha * (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88);
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.drawImage(this.sprites[p.sprite], -size / 2, -size / 2, size, size);
      g.restore();
    }
    g.globalAlpha = 1;
    this.pool = alive;
  }
}
