/**
 * Train geometry in car-local pixels. Each car is CAR_H tall; wheels sit on y = RAIL_LOCAL.
 * The Codex art is drawn over docs/reference/layout-*.png at 4x this scale, so by default a
 * body image covers its whole car box. If an image still lands off, nudge `body` here.
 */
export const CAR_H = 300;
export const RAIL_LOCAL = 290;
/** Stage y of the rail top. */
export const RAIL_Y = 880;

export interface WheelSpec {
  x: number;
  y: number;
  r: number;
  kind: 'driver' | 'small' | 'car';
}

export interface CarSpec {
  id: 'carriage' | 'tender' | 'loco';
  x: number;
  width: number;
  /** Image slot from image-prompts.md, used instead of the drawn SVG when present. */
  bodySlot: string;
  /** Placement of the body image inside the car box when the real asset is used. */
  body: { left: number; top: number; width: number };
  wheels: WheelSpec[];
}

export const CARS: CarSpec[] = [
  {
    id: 'carriage',
    x: 0,
    width: 430,
    bodySlot: 'train/carriage',
    body: { left: 0, top: 0, width: 430 },
    wheels: [55, 105, 325, 375].map((x) => ({ x, y: 268, r: 22, kind: 'car' as const })),
  },
  {
    id: 'tender',
    x: 440,
    width: 230,
    bodySlot: 'train/tender',
    body: { left: 0, top: 0, width: 230 },
    wheels: [55, 175].map((x) => ({ x, y: 266, r: 24, kind: 'car' as const })),
  },
  {
    id: 'loco',
    x: 680,
    width: 520,
    bodySlot: 'train/loco-body',
    body: { left: 0, top: 0, width: 520 },
    wheels: [
      { x: 150, y: 240, r: 50, kind: 'driver' },
      { x: 262, y: 240, r: 50, kind: 'driver' },
      { x: 374, y: 240, r: 50, kind: 'driver' },
      { x: 462, y: 264, r: 26, kind: 'small' },
    ],
  },
];

export const TRAIN_W = 1200;

/** Valve gear on the loco (local coords). */
export const ROD = {
  crankRadius: 26,
  mainRodLength: 150,
  mainDriverIndex: 1,
  cylinderY: 212,
  cylinderX: 440,
};

/** Loco-local points used by effects. */
export const LOCO_POINTS = {
  stack: { x: 448, y: 36 },
  headlight: { x: 500, y: 78 },
  cylinder: { x: 470, y: 222 },
};

/** Carriage plaque that shows the drawn number. */
export const PLAQUE = { left: 140, top: 168, width: 150, height: 46 };

/** Train left edge positions on stage. */
export const TRAIN_X = {
  idle: 270,
  /** Carriage center ends near the board center (x ≈ 980). */
  stop: 700,
  offRight: 1980,
  offLeft: -TRAIN_W - 60,
};
