import { asset } from '../core/assets';
import { cityTile, fenceTile, groundTile, midTile, skyTile, trackTile } from './backdrops';

interface LayerSpec {
  slot: string;
  top: number;
  height: number;
  tile: number;
  /** Parallax factor: 1 moves with the track. */
  k: number;
  fallback: (w: number, h: number) => string;
  /** Tones down busy art so the board and train stay the focus. */
  opacity?: number;
}

const LAYERS: LayerSpec[] = [
  { slot: 'bg/sky', top: 0, height: 880, tile: 1920, k: 0.04, fallback: skyTile, opacity: 0.55 },
  { slot: 'bg/city-far', top: 420, height: 440, tile: 1600, k: 0.15, fallback: cityTile },
  { slot: 'bg/mid-props', top: 560, height: 320, tile: 900, k: 0.45, fallback: midTile },
  { slot: 'bg/near-ground', top: 800, height: 80, tile: 240, k: 0.8, fallback: fenceTile },
  { slot: 'bg/track', top: 870, height: 50, tile: 240, k: 1, fallback: trackTile },
  { slot: 'bg/ground', top: 920, height: 160, tile: 480, k: 1, fallback: groundTile },
];

const MEMORY_K = 0.45;
const MEMORY_GAP = 760;
const MEMORY_SLOTS = Math.ceil(1920 / MEMORY_GAP) + 2;

interface Layer {
  el: HTMLElement;
  tile: number;
  k: number;
}

export class World {
  private layers: Layer[] = [];
  private strip!: HTMLElement;
  private boards: HTMLElement[] = [];
  private photos: HTMLImageElement[] = [];
  private memoryBase = -1;

  constructor(private root: HTMLElement) {}

  async init(photos: HTMLImageElement[]): Promise<void> {
    this.photos = photos;
    for (const spec of LAYERS) {
      const el = document.createElement('div');
      el.className = 'layer';
      let tile = spec.tile;
      const img = await asset(spec.slot);
      if (img) {
        tile = Math.round(img.naturalWidth * (spec.height / img.naturalHeight));
        el.style.backgroundImage = `url("${img.src}")`;
        el.style.backgroundSize = `${tile}px ${spec.height}px`;
      } else {
        el.style.backgroundImage = spec.fallback(spec.tile, spec.height);
      }
      if (img && spec.opacity !== undefined) el.style.opacity = String(spec.opacity);
      el.style.top = `${spec.top}px`;
      el.style.height = `${spec.height}px`;
      el.style.width = `${1920 + tile}px`;
      this.root.appendChild(el);
      this.layers.push({ el, tile, k: spec.k });
      // Memory boards stand between the city and the poles.
      if (spec.slot === 'bg/city-far') this.buildMemoryStrip();
    }
    this.update(0);
  }

  private buildMemoryStrip(): void {
    this.strip = document.createElement('div');
    this.strip.className = 'memory-strip';
    for (let i = 0; i < MEMORY_SLOTS; i++) {
      const b = document.createElement('div');
      b.className = 'memory-board';
      b.style.left = `${i * MEMORY_GAP + 330}px`;
      b.innerHTML = '<div class="stamp"><div class="photo"></div></div><div class="legs"></div>';
      this.boards.push(b);
      this.strip.appendChild(b);
    }
    this.root.appendChild(this.strip);
  }

  update(scroll: number): void {
    for (const l of this.layers) {
      const off = (scroll * l.k) % l.tile;
      l.el.style.transform = `translate3d(${(-off).toFixed(2)}px,0,0)`;
    }
    const ms = scroll * MEMORY_K;
    const base = Math.floor(ms / MEMORY_GAP);
    this.strip.style.transform = `translate3d(${(-(ms - base * MEMORY_GAP)).toFixed(2)}px,0,0)`;
    if (base !== this.memoryBase) {
      this.memoryBase = base;
      this.boards.forEach((b, i) => this.paintBoard(b, base + i));
    }
  }

  private paintBoard(board: HTMLElement, index: number): void {
    const photo = board.querySelector<HTMLElement>('.photo')!;
    if (this.photos.length === 0) {
      photo.className = 'photo placeholder';
      photo.textContent = 'Ký ức';
      return;
    }
    const img = this.photos[((index % this.photos.length) + this.photos.length) % this.photos.length];
    photo.className = 'photo';
    photo.textContent = '';
    photo.style.backgroundImage = `url("${img.src}")`;
  }
}
