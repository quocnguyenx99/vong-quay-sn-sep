/** An empty flap, like a real Solari board between departures. */
const BLANK = ' ';

function nextChar(c: string): string {
  return c === BLANK ? '0' : String((Number(c) + 1) % 10);
}

class FlapCell {
  readonly el: HTMLElement;
  char = BLANK;
  private top: HTMLElement;
  private bottom: HTMLElement;
  private leafTop: HTMLElement;
  private leafBottom: HTMLElement;
  private anims: Animation[] = [];

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'flap';
    this.el.innerHTML =
      '<div class="half top"><span></span></div><div class="half bottom"><span></span></div>' +
      '<div class="leaf leaf-top"><span></span></div><div class="leaf leaf-bottom"><span></span></div>';
    const q = (s: string) => this.el.querySelector<HTMLElement>(s)!;
    this.top = q('.top span');
    this.bottom = q('.bottom span');
    this.leafTop = q('.leaf-top');
    this.leafBottom = q('.leaf-bottom');
    this.set(BLANK);
  }

  private settle(): void {
    this.anims.forEach((a) => a.cancel());
    this.anims = [];
    this.leafTop.style.visibility = 'hidden';
    this.leafBottom.style.visibility = 'hidden';
    this.bottom.textContent = this.char;
  }

  set(c: string): void {
    this.char = c;
    this.top.textContent = c;
    this.settle();
  }

  /** Real split-flap: the old top half falls, revealing the new top; the new bottom drops into place. */
  flipTo(c: string, durationMs: number): void {
    this.settle();
    const old = this.char;
    this.char = c;
    this.top.textContent = c;
    this.bottom.textContent = old;
    this.leafTop.firstElementChild!.textContent = old;
    this.leafBottom.firstElementChild!.textContent = c;
    this.leafTop.style.visibility = 'visible';
    this.leafBottom.style.visibility = 'visible';
    const half = durationMs / 2;
    const a1 = this.leafTop.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], {
      duration: half,
      easing: 'ease-in',
      fill: 'forwards',
    });
    const a2 = this.leafBottom.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], {
      duration: half,
      delay: half,
      easing: 'ease-out',
      fill: 'both',
    });
    a2.onfinish = () => this.settle();
    this.anims = [a1, a2];
  }

  setLocked(on: boolean): void {
    this.el.classList.toggle('locked', on);
  }
}

interface Track {
  mode: 'free' | 'final' | 'locked';
  nextAt: number;
  /** Final approach, scheduled once the brake starts. */
  lockAt: number;
  window: number;
  target: string;
  steps: number[];
}

export class FlapBoard {
  readonly el: HTMLElement;
  private cells: FlapCell[] = [];
  private tracks: Track[] = [];
  private flapsEl: HTMLElement;
  private tripEl: HTMLElement;
  private lamp: HTMLElement;
  private frame: HTMLElement;
  onFlip: () => void = () => {};

  constructor(slot: HTMLElement, digits: number) {
    this.el = document.createElement('div');
    this.el.className = 'station-board';
    this.el.innerHTML = `
      <div class="board-chains"></div>
      <div class="board-frame">
        <div class="rivet" style="left:8px;top:8px"></div><div class="rivet" style="right:8px;top:8px"></div>
        <div class="rivet" style="left:8px;bottom:8px"></div><div class="rivet" style="right:8px;bottom:8px"></div>
        <div class="board-head"><span class="board-lamp"></span><span>Sân ga Ký Ức</span></div>
        <div class="board-row">
          <div class="board-col"><div class="col-label">Chuyến</div><div class="col-value trip">#--</div></div>
          <div class="board-col ticket"><div class="col-label">Vé số</div><div class="flaps"></div></div>
        </div>
      </div>`;
    this.flapsEl = this.el.querySelector('.flaps')!;
    this.tripEl = this.el.querySelector('.trip')!;
    this.lamp = this.el.querySelector('.board-lamp')!;
    this.frame = this.el.querySelector('.board-frame')!;
    slot.appendChild(this.el);
    this.setDigits(digits);
  }

  setDigits(n: number): void {
    if (n === this.cells.length) return;
    this.flapsEl.innerHTML = '';
    this.cells = Array.from({ length: n }, () => new FlapCell());
    this.cells.forEach((c) => this.flapsEl.appendChild(c.el));
  }

  clear(): void {
    this.show('');
  }

  show(text: string, locked = false): void {
    this.cells.forEach((c, i) => {
      c.set(text[i] ?? BLANK);
      c.setLocked(locked);
    });
    this.tracks = [];
  }

  setTrip(n: number | null): void {
    this.tripEl.textContent = n === null ? '#--' : `#${String(n).padStart(2, '0')}`;
  }

  setLamp(state: 'idle' | 'run' | 'stop'): void {
    this.lamp.className = `board-lamp ${state === 'idle' ? '' : state}`;
  }

  glow(on: boolean): void {
    this.frame.classList.toggle('glow', on);
  }

  /** Every digit starts cycling freely. */
  startSpin(now: number): void {
    this.cells.forEach((c) => c.setLocked(false));
    this.tracks = this.cells.map((_, i) => ({
      mode: 'free',
      nextAt: now + 120 + i * 45,
      lockAt: Infinity,
      window: 0,
      target: '',
      steps: [],
    }));
  }

  /**
   * Locks digits left to right across the draw: 40% / 70% / 100% for three digits.
   * The last digit gets the longest, slowest approach for the near-miss moment.
   */
  scheduleLock(target: string, brakeStart: number, drawMs: number): void {
    const n = this.cells.length;
    this.tracks.forEach((t, i) => {
      const frac = n === 1 ? 1 : 0.4 + (0.6 * i) / (n - 1);
      const last = i === n - 1;
      t.lockAt = brakeStart + drawMs * frac;
      t.window = drawMs * (last ? 0.45 : 0.22);
      t.target = target[i];
    });
  }

  /** `speed` 0..1 sets the free-running flip rate. */
  update(now: number, speed: number): void {
    this.tracks.forEach((t, i) => {
      const cell = this.cells[i];
      if (t.mode === 'locked') return;
      if (t.mode === 'free' && now >= t.lockAt - t.window) this.beginFinal(t, cell, i === this.cells.length - 1, now);
      if (now < t.nextAt) return;

      if (t.mode === 'free') {
        const interval = 70 + (1 - speed) * 150 + Math.random() * 25;
        cell.flipTo(nextChar(cell.char), Math.min(interval * 0.9, 200));
        t.nextAt = now + interval;
        this.onFlip();
        return;
      }
      const interval = t.steps.shift()!;
      const done = t.steps.length === 0;
      cell.flipTo(nextChar(cell.char), Math.max(40, Math.min(interval * 0.9, 380)));
      this.onFlip();
      if (done) {
        t.mode = 'locked';
        setTimeout(() => cell.setLocked(true), Math.min(interval, 380));
      } else {
        t.nextAt = now + t.steps[0];
      }
    });
  }

  private beginFinal(t: Track, cell: FlapCell, last: boolean, now: number): void {
    const cur = cell.char === BLANK ? -1 : Number(cell.char);
    let s = (Number(t.target) - cur + 10) % 10;
    if (s === 0 && cur === -1) s = 10;
    if (s < (last ? 4 : 2)) s += 10;
    // Linearly growing intervals that sum exactly to the window.
    const ratio = last ? 5 : 2.5;
    const a = t.window / (s + ((ratio - 1) * s) / 2);
    const b = s > 1 ? (a * (ratio - 1)) / (s - 1) : 0;
    t.steps = Array.from({ length: s }, (_, k) => a + b * k);
    t.mode = 'final';
    t.nextAt = now + t.steps[0];
  }

  get settled(): boolean {
    return this.tracks.every((t) => t.mode === 'locked');
  }
}
