import { asset } from '../core/assets';
import {
  CAR_H,
  CARS,
  LOCO_POINTS,
  PLAQUE,
  RAIL_LOCAL,
  RAIL_Y,
  ROD,
  TRAIN_W,
  type CarSpec,
} from './train.config';
import { carriageSvg, locoSvg, tenderSvg, wheelSvg } from './trainArt';

const ART: Record<CarSpec['id'], () => string> = {
  carriage: carriageSvg,
  tender: tenderSvg,
  loco: locoSvg,
};

interface Wheel {
  el: HTMLElement;
  r: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * The train is a stack of DOM layers moved only with transforms. Wheel angle is derived
 * from distance travelled so the wheels roll without slipping, and the valve gear is
 * solved geometrically from the driver angle every frame.
 */
export class Train {
  readonly root: HTMLElement;
  private wheels: Wheel[] = [];
  private plaque!: HTMLElement;
  private sideRod!: SVGLineElement;
  private mainRod!: SVGLineElement;
  private pistonRod!: SVGLineElement;
  private crosshead!: SVGRectElement;
  private locoX = 0;
  x = 0;
  private y = RAIL_Y - RAIL_LOCAL;

  constructor(layer: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'train';
    this.root.style.width = `${TRAIN_W}px`;
    this.root.style.height = `${CAR_H}px`;
    layer.appendChild(this.root);
  }

  async init(): Promise<void> {
    for (const car of CARS) {
      const el = document.createElement('div');
      el.className = `train-car car-${car.id}`;
      el.style.left = `${car.x}px`;
      el.style.width = `${car.width}px`;
      el.style.height = `${CAR_H}px`;

      for (const w of car.wheels) {
        const img = await asset(
          w.kind === 'driver' ? 'train/loco-wheel-big' : w.kind === 'small' ? 'train/loco-wheel-small' : 'train/carriage-wheel',
        );
        const wheel = document.createElement('div');
        wheel.className = 'wheel';
        const size = w.r * 2 + 4;
        wheel.style.cssText = `left:${w.x - size / 2}px;top:${w.y - size / 2}px;width:${size}px;height:${size}px`;
        if (img) {
          const i = img.cloneNode() as HTMLImageElement;
          i.style.cssText = 'width:100%;height:100%;display:block';
          wheel.appendChild(i);
        } else {
          wheel.innerHTML = wheelSvg(w.r, w.kind, w.kind === 'driver' ? ROD.crankRadius : 0);
        }
        this.wheels.push({ el: wheel, r: w.r });
        el.appendChild(wheel);
      }

      // Body sits behind the wheels; the rods are added last so they ride on top.
      const bodyImg = await asset(car.bodySlot);
      if (bodyImg) {
        const i = bodyImg.cloneNode() as HTMLImageElement;
        i.className = 'body';
        i.style.cssText = `left:${car.body.left}px;top:${car.body.top}px;width:${car.body.width}px`;
        el.insertBefore(i, el.firstChild);
      } else {
        el.insertAdjacentHTML('afterbegin', ART[car.id]());
      }

      if (car.id === 'carriage') {
        this.plaque = document.createElement('div');
        this.plaque.className = 'car-plaque';
        this.plaque.style.cssText = `left:${PLAQUE.left}px;top:${PLAQUE.top}px;width:${PLAQUE.width}px;height:${PLAQUE.height}px`;
        this.plaque.textContent = '- - -';
        el.appendChild(this.plaque);
      }
      if (car.id === 'loco') {
        this.locoX = car.x;
        el.appendChild(this.buildRods());
      }
      this.root.appendChild(el);
    }
    this.setPose(0, 0, 0);
  }

  private buildRods(): SVGSVGElement {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '520');
    svg.setAttribute('height', String(CAR_H));
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
    const line = (w: number, color: string) => {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('stroke', color);
      l.setAttribute('stroke-width', String(w));
      l.setAttribute('stroke-linecap', 'round');
      svg.appendChild(l);
      return l;
    };
    this.pistonRod = line(5, '#B8925A');
    this.sideRod = line(9, '#B8925A');
    this.mainRod = line(8, '#D6B47E');
    this.crosshead = document.createElementNS(NS, 'rect');
    this.crosshead.setAttribute('width', '22');
    this.crosshead.setAttribute('height', '14');
    this.crosshead.setAttribute('fill', '#E8D3AC');
    this.crosshead.setAttribute('stroke', '#B8925A');
    this.crosshead.setAttribute('stroke-width', '2');
    svg.appendChild(this.crosshead);
    return svg;
  }

  /**
   * @param x train left edge on stage
   * @param distance total distance rolled (px), drives wheel rotation
   * @param bob vertical shake (px)
   */
  setPose(x: number, distance: number, bob: number): void {
    this.x = x;
    this.root.style.transform = `translate3d(${x.toFixed(2)}px, ${(this.y + bob).toFixed(2)}px, 0)`;
    for (const w of this.wheels) {
      w.el.style.transform = `rotate(${((distance / w.r) * 57.2958) % 360}deg)`;
    }
    this.updateRods(distance);
  }

  private updateRods(distance: number): void {
    const drivers = CARS.find((c) => c.id === 'loco')!.wheels.filter((w) => w.kind === 'driver');
    const theta = distance / drivers[0].r;
    const cx = Math.cos(theta) * ROD.crankRadius;
    const cy = Math.sin(theta) * ROD.crankRadius;
    const first = drivers[0];
    const last = drivers[drivers.length - 1];
    const main = drivers[ROD.mainDriverIndex];
    this.sideRod.setAttribute('x1', (first.x + cx).toFixed(1));
    this.sideRod.setAttribute('y1', (first.y + cy).toFixed(1));
    this.sideRod.setAttribute('x2', (last.x + cx).toFixed(1));
    this.sideRod.setAttribute('y2', (last.y + cy).toFixed(1));

    const px = main.x + cx;
    const py = main.y + cy;
    const dy = ROD.cylinderY - py;
    const chx = px + Math.sqrt(ROD.mainRodLength ** 2 - dy * dy);
    this.mainRod.setAttribute('x1', px.toFixed(1));
    this.mainRod.setAttribute('y1', py.toFixed(1));
    this.mainRod.setAttribute('x2', chx.toFixed(1));
    this.mainRod.setAttribute('y2', String(ROD.cylinderY));
    this.pistonRod.setAttribute('x1', chx.toFixed(1));
    this.pistonRod.setAttribute('y1', String(ROD.cylinderY));
    this.pistonRod.setAttribute('x2', String(ROD.cylinderX + 4));
    this.pistonRod.setAttribute('y2', String(ROD.cylinderY));
    this.crosshead.setAttribute('x', (chx - 11).toFixed(1));
    this.crosshead.setAttribute('y', String(ROD.cylinderY - 7));
  }

  setPlaque(text: string): void {
    this.plaque.textContent = text;
  }

  /** Converts a loco-local point to stage coordinates at the current pose. */
  locoPoint(p: Point): Point {
    return { x: this.x + this.locoX + p.x, y: this.y + p.y };
  }

  get stack(): Point {
    return this.locoPoint(LOCO_POINTS.stack);
  }
  get headlight(): Point {
    return this.locoPoint(LOCO_POINTS.headlight);
  }
  get cylinder(): Point {
    return this.locoPoint(LOCO_POINTS.cylinder);
  }
  /** Rail contact points of the drivers, for brake sparks. */
  get driverContacts(): Point[] {
    const loco = CARS.find((c) => c.id === 'loco')!;
    return loco.wheels
      .filter((w) => w.kind === 'driver')
      .map((w) => this.locoPoint({ x: w.x, y: w.y + w.r - 4 }));
  }
}
