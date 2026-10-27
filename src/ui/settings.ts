import { downloadCsv, formatTime, padNumber, ticketCode } from '../core/format';
import { LIMITS, store, type BrakeMode, type Config } from '../state/store';
import { confirmDialog } from './dialog';

interface SettingsHooks {
  onSaved: () => void;
  onPreview: () => void;
  onReset: () => void;
}

export class Settings {
  constructor(
    private root: HTMLElement,
    private hooks: SettingsHooks,
  ) {}

  get isOpen(): boolean {
    return this.root.classList.contains('open');
  }

  open(): void {
    this.render();
    this.root.classList.add('open');
  }

  close(): void {
    this.root.classList.remove('open');
    (document.activeElement as HTMLElement | null)?.blur();
  }

  private render(): void {
    const c = store.config;
    const locked = store.hasHistory;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    this.root.innerHTML = `
      <div class="label">Sổ ghi chép của trưởng tàu</div>
      <h2 class="display">Cài đặt</h2>

      <div class="set-section"><div class="label">Dải số vé</div>
        <div class="set-grid">
          <label class="field">Số bắt đầu<input type="number" name="start" min="0" value="${c.start}" ${locked ? 'disabled' : ''}/></label>
          <label class="field">Số kết thúc<input type="number" name="end" min="0" value="${c.end}" ${locked ? 'disabled' : ''}/></label>
          <label class="field">Số chữ số hiển thị<input type="number" name="digits" min="0" max="6" value="${c.digits}" ${locked ? 'disabled' : ''}/>
            <span class="note">0 = tự động theo số kết thúc</span></label>
          <label class="field">Tiền tố mã vé<input type="text" name="prefix" value="${esc(c.prefix)}"/>
            <span class="note">VD: ${esc(ticketCode(c.prefix, c.start, store.digits))}</span></label>
          ${locked ? '<span class="field full note">Đã có kết quả: muốn đổi dải số, hãy xoá kết quả trước.</span>' : ''}
        </div>
      </div>

      <div class="set-section"><div class="label">Hành trình</div>
        <div class="set-grid">
          <label class="field">Thời gian tàu chạy (giây)
            <span class="range-row"><input type="range" name="runSeconds" min="${LIMITS.runSeconds[0]}" max="${LIMITS.runSeconds[1]}" step="1" value="${c.runSeconds}"/><output>${c.runSeconds}s</output></span></label>
          <label class="field">Thời gian quay số (giây)
            <span class="range-row"><input type="range" name="drawSeconds" min="${LIMITS.drawSeconds[0]}" max="${LIMITS.drawSeconds[1]}" step="1" value="${c.drawSeconds}"/><output>${c.drawSeconds}s</output></span></label>
          <label class="field full">Cách dừng tàu
            <select name="brakeMode">
              <option value="auto" ${c.brakeMode === 'auto' ? 'selected' : ''}>Tự phanh sau thời gian tàu chạy</option>
              <option value="manual" ${c.brakeMode === 'manual' ? 'selected' : ''}>Phanh tay: nhấn Space lần nữa để phanh (tự phanh sau ${LIMITS.manualMaxRunSeconds}s)</option>
            </select></label>
        </div>
      </div>

      <div class="set-section"><div class="label">Nội dung</div>
        <div class="set-grid">
          <label class="field full">Tiêu đề<input type="text" name="title" value="${esc(c.title)}"/></label>
          <label class="field full">Tiêu đề phụ<input type="text" name="subtitle" value="${esc(c.subtitle)}"/></label>
          <label class="field full">Lời chúc (mỗi dòng một câu, chọn ngẫu nhiên)<textarea name="messages">${esc(c.messages)}</textarea></label>
        </div>
      </div>

      <div class="set-section"><div class="label">Âm thanh</div>
        <label class="field">Âm lượng
          <span class="range-row"><input type="range" name="volume" min="0" max="1" step="0.05" value="${c.volume}"/><output>${Math.round(c.volume * 100)}%</output></span></label>
      </div>

      <div class="set-error"></div>
      <div class="set-actions">
        <button class="btn-small solid" data-act="save" type="button">Lưu &amp; đóng</button>
        <button class="btn-small" data-act="preview" type="button">Xem trước 1 lượt</button>
        <button class="btn-small" data-act="csv" type="button">Xuất CSV</button>
        <button class="btn-small danger" data-act="reset" type="button">Xoá kết quả</button>
        <button class="btn-small" data-act="close" type="button">Đóng</button>
      </div>
      <div class="set-section"><div class="label">Phím tắt</div>
        <div class="note" style="font-size:17px;line-height:1.8;color:var(--ink-soft)">
          Space/Enter: khởi hành · phanh · tiếp tục &nbsp;|&nbsp; F: toàn màn hình &nbsp;|&nbsp; B: bảng vinh danh<br/>
          M: tắt tiếng &nbsp;|&nbsp; S: cài đặt &nbsp;|&nbsp; P: đo FPS &nbsp;|&nbsp; Esc: đóng
        </div>
      </div>
      <div class="set-section"><div class="label">Nguồn âm thanh</div>
        <div class="note" style="font-size:15px;line-height:1.6;color:var(--ink-faint)">
          Wikimedia Commons: Work With Sounds / Konrad Gutkowski, Werstas (CC BY 4.0) · Kevin MacLeod (CC BY 3.0) ·
          David Lawrence, thore (Public domain) · Bell-ring (CC0). Chi tiết: audio/CREDITS.md
        </div>
      </div>`;

    this.root.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((r) => {
      r.addEventListener('input', () => {
        const out = r.parentElement!.querySelector('output')!;
        out.textContent = r.name === 'volume' ? `${Math.round(Number(r.value) * 100)}%` : `${r.value}s`;
      });
    });
    this.root.querySelector('[data-act="save"]')!.addEventListener('click', () => {
      if (this.save()) this.close();
    });
    this.root.querySelector('[data-act="preview"]')!.addEventListener('click', () => {
      if (!this.save()) return;
      this.close();
      this.hooks.onPreview();
    });
    this.root.querySelector('[data-act="csv"]')!.addEventListener('click', () => exportCsv());
    this.root.querySelector('[data-act="reset"]')!.addEventListener('click', () => void this.reset());
    this.root.querySelector('[data-act="close"]')!.addEventListener('click', () => this.close());
  }

  private save(): boolean {
    const f = (name: string) => this.root.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
    const err = this.root.querySelector('.set-error')!;
    const patch: Partial<Config> = {
      prefix: f('prefix').value,
      title: f('title').value.trim() || 'Trở về những ký ức',
      subtitle: f('subtitle').value.trim(),
      messages: (this.root.querySelector<HTMLTextAreaElement>('[name="messages"]')!.value || '').trim(),
      runSeconds: Number(f('runSeconds').value),
      drawSeconds: Number(f('drawSeconds').value),
      brakeMode: (this.root.querySelector<HTMLSelectElement>('[name="brakeMode"]')!.value as BrakeMode) ?? 'auto',
      volume: Number(f('volume').value),
    };
    if (!store.hasHistory) {
      const start = Number(f('start').value);
      const end = Number(f('end').value);
      const digits = Number(f('digits').value);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0) {
        err.textContent = 'Số bắt đầu và kết thúc phải là số nguyên không âm.';
        return false;
      }
      if (start > end) {
        err.textContent = 'Số bắt đầu phải nhỏ hơn hoặc bằng số kết thúc.';
        return false;
      }
      if (end > 999999) {
        err.textContent = 'Bảng ga hiển thị tối đa 6 chữ số.';
        return false;
      }
      if (!Number.isInteger(digits) || digits < 0 || digits > 6 || (digits > 0 && digits < String(end).length)) {
        err.textContent = `Số chữ số phải là 0 (tự động) hoặc từ ${String(end).length} đến 6.`;
        return false;
      }
      Object.assign(patch, { start, end, digits });
    }
    err.textContent = '';
    store.updateConfig(patch);
    this.hooks.onSaved();
    return true;
  }

  private async reset(): Promise<void> {
    const ok = await confirmDialog({
      title: 'Xoá toàn bộ kết quả?',
      body: `Bảng vinh danh (${store.winners.length} vé) và danh sách vắng mặt sẽ bị xoá. Nên <b>Xuất CSV</b> trước. Gõ <b>RESET</b> để xác nhận.`,
      confirm: 'Xoá kết quả',
      danger: true,
      requireText: 'RESET',
    });
    if (!ok) return;
    store.resetResults();
    this.hooks.onReset();
    this.render();
  }
}

export function exportCsv(): void {
  const digits = store.digits;
  let seq = 0;
  const rows: (string | number)[][] = [['Lượt', 'Số vé', 'Mã vé', 'Giờ', 'Trạng thái']];
  for (const r of store.results) {
    if (r.status === 'win') seq++;
    rows.push([
      r.status === 'win' ? seq : '',
      padNumber(r.number, digits),
      ticketCode(store.config.prefix, r.number, digits),
      formatTime(r.time),
      r.status === 'win' ? 'Trúng' : 'Vắng mặt',
    ]);
  }
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(
    d.getHours(),
  ).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  downloadCsv(`ket-qua-quay-so-${stamp}.csv`, rows);
}
