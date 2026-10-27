import { formatTime, padNumber } from '../core/format';
import { store } from '../state/store';

const VISIBLE_ROWS = 15;

export class Leaderboard {
  private rows: HTMLElement;
  private more: HTMLElement;
  private shownCount = -1;

  constructor(
    root: HTMLElement,
    private full: HTMLElement,
  ) {
    root.innerHTML = `
      <div class="lb-card scalloped"><div class="inner">
        <div class="bite" style="width:56px;height:56px;left:-28px;top:-28px"></div>
        <div class="bite" style="width:56px;height:56px;right:-28px;top:-28px"></div>
        <div class="bite" style="width:56px;height:56px;left:-28px;bottom:-28px"></div>
        <div class="bite" style="width:56px;height:56px;right:-28px;bottom:-28px"></div>
        <div class="lb-head"><div class="label">Hành khách</div><h2 class="display">May mắn</h2></div>
        <div class="lb-cols"><span>#</span><span>Số vé</span><span style="text-align:right">Giờ</span></div>
        <div class="lb-rows"></div>
        <div class="lb-more"></div>
      </div></div>`;
    this.rows = root.querySelector('.lb-rows')!;
    this.more = root.querySelector('.lb-more')!;
  }

  render(): void {
    const winners = store.winners;
    const digits = store.digits;
    const fresh = this.shownCount >= 0 && winners.length === this.shownCount + 1;
    this.shownCount = winners.length;

    if (winners.length === 0) {
      this.rows.innerHTML = `<div class="lb-empty">Chưa có hành khách nào cập ga.<br/>Chuyến tàu đầu tiên đang chờ khởi hành…</div>`;
      this.more.textContent = '';
    } else {
      const latest = winners.slice(-VISIBLE_ROWS).reverse();
      this.rows.innerHTML = latest
        .map((w, i) => {
          const seq = winners.length - i;
          return `<div class="lb-row${fresh && i === 0 ? ' fresh' : ''}"><span class="c-seq">${seq}</span><span class="c-num">${padNumber(
            w.number,
            digits,
          )}</span><span class="c-time">${formatTime(w.time)}</span></div>`;
        })
        .join('');
      this.more.textContent =
        winners.length > VISIBLE_ROWS ? `… và ${winners.length - VISIBLE_ROWS} hành khách khác (phím B)` : '';
    }
    if (this.full.classList.contains('open')) this.renderFull();
  }

  private renderFull(): void {
    const winners = store.winners;
    const digits = store.digits;
    this.full.innerHTML = `
      <div class="label" style="text-align:center">Sân ga Ký Ức</div>
      <h2 class="display">Hành khách may mắn</h2>
      <div class="sub">${winners.length} hành khách đã cập ga</div>
      <div class="bf-grid">${winners
        .map(
          (w, i) =>
            `<div class="bf-item"><div class="n">${padNumber(w.number, digits)}</div><div class="m">Chuyến #${i + 1} · ${formatTime(
              w.time,
            )}</div></div>`,
        )
        .join('')}</div>
      <div class="close-hint">Nhấn B hoặc Esc để quay lại</div>`;
  }

  toggleFull(force?: boolean): void {
    const open = force ?? !this.full.classList.contains('open');
    this.full.classList.toggle('open', open);
    if (open) this.renderFull();
  }

  get fullOpen(): boolean {
    return this.full.classList.contains('open');
  }
}
