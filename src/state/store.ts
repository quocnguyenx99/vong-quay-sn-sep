import { randomIndex } from '../core/rng';

export type BrakeMode = 'auto' | 'manual';

export interface Config {
  start: number;
  end: number;
  /** 0 = derive from the length of `end`. */
  digits: number;
  prefix: string;
  title: string;
  subtitle: string;
  /** One message per line; one is picked at random per win. */
  messages: string;
  runSeconds: number;
  drawSeconds: number;
  brakeMode: BrakeMode;
  volume: number;
  muted: boolean;
}

export type ResultStatus = 'win' | 'absent';

export interface DrawResult {
  number: number;
  time: number;
  status: ResultStatus;
}

export interface Pending {
  number: number;
  time: number;
}

interface Persisted {
  config: Config;
  results: DrawResult[];
  pending: Pending | null;
}

const KEY = 'chuyen-tau-ky-uc/v1';

export const DEFAULT_CONFIG: Config = {
  start: 1,
  end: 220,
  digits: 0,
  prefix: 'ILOVEMRTHIET',
  title: 'Trở về những ký ức',
  subtitle: 'Tuổi thơ của Mr. Thiết',
  messages: [
    'Bạn hãy cứ cất kỹ tấm vé của tháng năm này nhé, vì không có người soát vé trên chuyến đi đặc biệt này.',
    'Những năm tháng ấy sẽ luôn là kỷ niệm tươi đẹp của Người ấy và của chính các bạn.',
    'Chuyến tàu ký ức hôm nay đã dừng ở ga của bạn. Chúc bạn luôn giữ được nụ cười hồn nhiên như thuở ấy.',
    'Mỗi tấm vé là một trang ký ức. Chúc bạn có thật nhiều trang đẹp trên hành trình phía trước.',
    'Còi tàu đã vang lên rồi! Chúc bạn một năm mới đủ đầy niềm vui và những chuyến đi thật ý nghĩa.',
    'Hãy giữ tấm vé này như giữ lại một mùa tuổi thơ không bao giờ cũ.',
    'Có những sân ga chỉ ghé qua một lần trong đời. Cảm ơn bạn đã cùng lên chuyến tàu đặc biệt này.',
    'Chúc bạn luôn có những người bạn đồng hành tuyệt vời trên mọi chặng đường.',
    'Tàu có thể đi xa, nhưng ký ức đẹp thì luôn ở lại. Chúc bạn mãi bình an và hạnh phúc.',
  ].join('\n'),
  runSeconds: 15,
  drawSeconds: 8,
  brakeMode: 'auto',
  volume: 0.8,
  muted: false,
};

export const LIMITS = {
  runSeconds: [3, 30] as const,
  drawSeconds: [2, 15] as const,
  /** In manual brake mode the train brakes on its own after this long. */
  manualMaxRunSeconds: 60,
};

/** Defaults shipped before; a saved value still equal to one of these was never customised. */
const PREVIOUS_DEFAULTS: Partial<Config> = {
  end: 200,
  runSeconds: 8,
  drawSeconds: 5,
  messages: [
    'Bạn hãy cứ cất kỹ tấm vé của tháng năm này nhé, vì không có người soát vé trên chuyến đi đặc biệt này.',
    'Những năm tháng ấy sẽ luôn là kỷ niệm tươi đẹp của Người ấy và của chính các bạn.',
  ].join('\n'),
};

function upgradeDefaults(saved: Partial<Config>): Partial<Config> {
  const out = { ...saved };
  for (const key of Object.keys(PREVIOUS_DEFAULTS) as (keyof Config)[]) {
    if (out[key] === PREVIOUS_DEFAULTS[key]) delete out[key];
  }
  return out;
}

type Listener = () => void;

class Store {
  config: Config = { ...DEFAULT_CONFIG };
  results: DrawResult[] = [];
  pending: Pending | null = null;
  private listeners = new Set<Listener>();

  load(): void {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<Persisted>;
      this.config = { ...DEFAULT_CONFIG, ...upgradeDefaults(data.config ?? {}) };
      this.results = Array.isArray(data.results) ? data.results : [];
      this.pending = data.pending ?? null;
    } catch {
      // Corrupt or blocked storage: start fresh rather than crash at the venue.
    }
  }

  private save(): void {
    try {
      const data: Persisted = { config: this.config, results: this.results, pending: this.pending };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable; the CSV export remains the backup.
    }
    this.listeners.forEach((l) => l());
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  get digits(): number {
    return this.config.digits > 0 ? this.config.digits : Math.max(String(this.config.end).length, 1);
  }

  get winners(): DrawResult[] {
    return this.results.filter((r) => r.status === 'win');
  }

  get hasHistory(): boolean {
    return this.results.length > 0 || this.pending !== null;
  }

  remaining(): number[] {
    const used = new Set(this.results.map((r) => r.number));
    if (this.pending) used.add(this.pending.number);
    const out: number[] = [];
    for (let n = this.config.start; n <= this.config.end; n++) if (!used.has(n)) out.push(n);
    return out;
  }

  /** Highest ticket already drawn or pending; the range end may not drop below it. */
  get maxUsed(): number | null {
    const used = this.results.map((r) => r.number);
    if (this.pending) used.push(this.pending.number);
    return used.length ? Math.max(...used) : null;
  }

  get rangeSize(): number {
    return this.config.end - this.config.start + 1;
  }

  /** Decides the result up-front and persists it before any animation runs. */
  draw(): Pending | null {
    const pool = this.remaining();
    if (pool.length === 0) return null;
    this.pending = { number: pool[randomIndex(pool.length)], time: Date.now() };
    this.save();
    return this.pending;
  }

  /** A preview spin: random number, nothing stored. */
  previewNumber(): number {
    const pool = this.remaining();
    const src = pool.length ? pool : [this.config.start];
    return src[randomIndex(src.length)];
  }

  resolvePending(status: ResultStatus): DrawResult | null {
    if (!this.pending) return null;
    const result: DrawResult = { number: this.pending.number, time: this.pending.time, status };
    this.results.push(result);
    this.pending = null;
    this.save();
    return result;
  }

  updateConfig(patch: Partial<Config>): void {
    this.config = { ...this.config, ...patch };
    this.save();
  }

  resetResults(): void {
    this.results = [];
    this.pending = null;
    this.save();
  }
}

export const store = new Store();
