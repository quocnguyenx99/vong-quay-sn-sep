import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { asset } from '../core/assets';
import { formatTime, padNumber, ticketCode } from '../core/format';
import { pickOne } from '../core/rng';
import { store } from '../state/store';
import { sound } from '../audio/sound';

export interface WinnerInfo {
  number: number;
  time: number;
  /** Trip number on the leaderboard, null for a preview. */
  seq: number | null;
  preview: boolean;
}

const COLORS = ['#D6B47E', '#B8925A', '#E8D3AC', '#F3EFE8', '#A8473A'];

/**
 * Stand-in NKC rubber seal until public/assets/ui/stamp-nkc.png exists: double red ring,
 * a ring of dots and "NKC", with a filter that roughens edges and drops ink like a hand stamp.
 */
function sealSvg(): string {
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return `<circle cx="${(120 + Math.cos(a) * 91).toFixed(1)}" cy="${(120 + Math.sin(a) * 91).toFixed(1)}" r="2.6"/>`;
  }).join('');
  return `<svg viewBox="0 0 240 240" aria-label="NKC">
    <defs>
      <filter id="seal-ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.5" result="rough"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="11" result="spots"/>
        <feColorMatrix in="spots" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4 3.25" result="ink"/>
        <feComposite in="rough" in2="ink" operator="in"/>
      </filter>
    </defs>
    <g filter="url(#seal-ink)" fill="#A8473A" stroke="#A8473A" opacity="0.92">
      <circle cx="120" cy="120" r="112" fill="none" stroke-width="8"/>
      <circle cx="120" cy="120" r="101" fill="none" stroke-width="2.5"/>
      <g stroke="none">${dots}</g>
      <circle cx="120" cy="120" r="80" fill="none" stroke-width="2.5"/>
      <text x="120" y="122" text-anchor="middle" dominant-baseline="central" stroke="none"
        font-family="Cormorant Garamond, serif" font-weight="700" font-size="74" letter-spacing="2">NKC</text>
      <text x="120" y="70" text-anchor="middle" dominant-baseline="central" stroke="none" font-size="18">★</text>
      <text x="120" y="172" text-anchor="middle" dominant-baseline="central" stroke="none" font-size="18">★</text>
    </g>
  </svg>`;
}

export class Celebration {
  private ticket!: HTMLElement;
  private fire: confetti.CreateTypes;
  private canvas: HTMLCanvasElement;
  private typing: number | null = null;
  private drizzle: number | null = null;
  private sealImg: string | null = null;
  onContinue: () => void = () => {};
  onAbsent: () => void = () => {};

  constructor(
    private root: HTMLElement,
    private photos: HTMLImageElement[],
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'confetti';
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.fire = confetti.create(this.canvas, { resize: false, useWorker: false });
    void asset('ui/stamp-nkc').then((img) => (this.sealImg = img ? img.src : null));
  }

  get isOpen(): boolean {
    return this.root.classList.contains('open');
  }

  show(info: WinnerInfo, from: { x: number; y: number }): void {
    const digits = store.digits;
    const num = padNumber(info.number, digits);
    const c = store.config;
    const messages = c.messages
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);
    const message = messages.length ? pickOne(messages) : '';
    const photo = this.photos.length ? pickOne(this.photos).src : null;
    const range = `${padNumber(c.start, digits)}–${padNumber(c.end, digits)}`;

    this.root.innerHTML = `
      <div class="backdrop"></div>
      <div class="ticket-wrap">
        <div class="ticket scalloped"><div class="inner">
          <div class="bite" style="width:80px;height:80px;left:-40px;top:-40px"></div>
          <div class="bite" style="width:80px;height:80px;right:-40px;top:-40px"></div>
          <div class="bite" style="width:80px;height:80px;left:-40px;bottom:-40px"></div>
          <div class="bite" style="width:80px;height:80px;right:-40px;bottom:-40px"></div>
          <div class="bite" style="width:64px;height:64px;left:858px;top:-32px"></div>
          <div class="bite" style="width:64px;height:64px;left:858px;bottom:-32px"></div>
          <div class="ticket-main">
            <div class="label">Chuyến tàu</div>
            <div class="display t-title">Hành khách may mắn</div>
            <div class="t-sub">Sân ga Ký Ức · ${info.seq === null ? 'Chuyến chạy thử' : `Chuyến #${info.seq}`}</div>
            <div class="t-chip"><span>Giờ cập ga <b>${formatTime(info.time)}</b></span><span>Dải vé <b>${range}</b></span></div>
            <div class="t-number-row"><span class="label">Vé số</span><span class="t-number">${num}</span></div>
          </div>
          <div class="ticket-divider"></div>
          <div class="ticket-stub">
            <div class="stamp"><div class="photo ${photo ? '' : 'placeholder'}" ${
              photo ? `style="background-image:url('${photo}')"` : ''
            }>${photo ? '' : 'Ký ức'}</div></div>
            <div class="display t-code">${ticketCode(c.prefix, info.number, digits)}</div>
            <div class="t-message"></div>
          </div>
        </div>
        <div class="seal"><div class="seal-art" ${
          this.sealImg ? `style="background-image:url('${this.sealImg}')"` : ''
        }>${this.sealImg ? '' : sealSvg()}</div></div>
        ${info.preview ? '<div class="preview-badge">Xem trước</div>' : ''}
        </div>
      </div>
      <div class="celebrate-actions">
        <button class="btn-primary" data-act="continue" type="button">Tiếp tục <span class="depart-hint">Space</span></button>
        ${info.preview ? '' : '<button class="btn-ghost" data-act="absent" type="button">Vắng mặt</button>'}
      </div>`;
    this.root.appendChild(this.canvas);
    this.root.classList.add('open');
    this.ticket = this.root.querySelector('.ticket')!;
    this.root.querySelector('[data-act="continue"]')!.addEventListener('click', () => this.onContinue());
    this.root.querySelector('[data-act="absent"]')?.addEventListener('click', () => this.onAbsent());

    const wrap = this.root.querySelector<HTMLElement>('.ticket-wrap')!;
    const seal = this.root.querySelector<HTMLElement>('.seal')!;
    const actions = this.root.querySelector<HTMLElement>('.celebrate-actions')!;
    // Fly out of the carriage window: wrap center is (960, 450).
    const tl = gsap.timeline();
    tl.from(this.root.querySelector('.backdrop'), { opacity: 0, duration: 0.4 })
      .fromTo(
        wrap,
        { x: from.x - 960, y: from.y - 450, scale: 0.12, rotateZ: -18, opacity: 0 },
        { x: 0, y: 0, scale: 1, rotateZ: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        0.05,
      )
      .from(this.ticket, { rotateY: 160, duration: 0.9, ease: 'power2.out' }, 0.05)
      .add(() => this.burst(), 0.75)
      .fromTo(
        seal,
        { opacity: 0, scale: 2.4 },
        { opacity: 1, scale: 1, duration: 0.24, ease: 'power4.in', onComplete: () => sound.punch() },
        1.05,
      )
      .to(wrap, { y: 6, duration: 0.06, yoyo: true, repeat: 1 }, 1.27)
      .add(() => this.typeMessage(message), 1.3)
      .from(actions, { opacity: 0, y: 20, duration: 0.4 }, 1.4);
    if (!info.preview) tl.add(() => sound.applause(), 0.9);
  }

  private burst(): void {
    const base = { colors: COLORS, ticks: 320, gravity: 0.9, scalar: 1.25, disableForReducedMotion: true };
    void this.fire({ ...base, particleCount: 130, angle: 60, spread: 65, startVelocity: 62, origin: { x: 0.05, y: 0.95 } });
    void this.fire({ ...base, particleCount: 130, angle: 120, spread: 65, startVelocity: 62, origin: { x: 0.95, y: 0.95 } });
    let n = 0;
    this.drizzle = window.setInterval(() => {
      void this.fire({ ...base, particleCount: 10, angle: 270, spread: 140, startVelocity: 8, origin: { x: Math.random(), y: -0.05 } });
      if (++n > 14 && this.drizzle) window.clearInterval(this.drizzle);
    }, 140);
  }

  private typeMessage(text: string): void {
    const el = this.root.querySelector('.t-message');
    if (!el) return;
    let i = 0;
    const step = Math.max(14, 1400 / Math.max(text.length, 1));
    this.typing = window.setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length && this.typing) window.clearInterval(this.typing);
    }, step);
  }

  private stopTimers(): void {
    if (this.typing) window.clearInterval(this.typing);
    if (this.drizzle) window.clearInterval(this.drizzle);
    this.typing = this.drizzle = null;
  }

  /** Ticket shrinks into the leaderboard. */
  async hideToBoard(): Promise<void> {
    this.stopTimers();
    const wrap = this.root.querySelector<HTMLElement>('.ticket-wrap')!;
    await gsap
      .timeline()
      .to(this.root.querySelector('.celebrate-actions'), { opacity: 0, duration: 0.2 }, 0)
      .to(wrap, { x: 1700 - 960, y: 260 - 450, scale: 0.08, opacity: 0.2, duration: 0.65, ease: 'power2.in' }, 0)
      .to(this.root.querySelector('.backdrop'), { opacity: 0, duration: 0.5 }, 0.15);
    this.clear();
  }

  /** Absent: the ticket greys out, tears and falls away. */
  async hideTorn(): Promise<void> {
    this.stopTimers();
    sound.tear();
    const wrap = this.root.querySelector<HTMLElement>('.ticket-wrap')!;
    await gsap
      .timeline()
      .to(this.root.querySelector('.celebrate-actions'), { opacity: 0, duration: 0.2 }, 0)
      .to(this.ticket, { filter: 'grayscale(1) brightness(0.9)', duration: 0.25 }, 0)
      .to(wrap, { rotateZ: 9, y: 700, opacity: 0, duration: 0.85, ease: 'power2.in' }, 0.2)
      .to(this.root.querySelector('.backdrop'), { opacity: 0, duration: 0.5 }, 0.5);
    this.clear();
  }

  private clear(): void {
    this.fire.reset();
    this.root.classList.remove('open');
    this.root.innerHTML = '';
  }
}
