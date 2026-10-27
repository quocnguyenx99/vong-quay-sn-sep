let root: HTMLElement;
let active: ((ok: boolean) => void) | null = null;

export function initDialog(el: HTMLElement): void {
  root = el;
}

export function dialogOpen(): boolean {
  return active !== null;
}

export function closeDialog(): void {
  active?.(false);
}

interface ConfirmOptions {
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  /** User must type this exact text to enable the confirm button. */
  requireText?: string;
}

export function confirmDialog(o: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="dialog-card scalloped"><div class="inner">
        <h3 class="display">${o.title}</h3>
        <p>${o.body}</p>
        ${o.requireText ? `<input type="text" autocomplete="off" placeholder="${o.requireText}" />` : ''}
        <div class="dialog-actions">
          <button class="btn-small" data-act="cancel" type="button">Huỷ</button>
          <button class="btn-small ${o.danger ? 'danger' : 'solid'}" data-act="ok" type="button">${o.confirm}</button>
        </div>
      </div></div>`;
    root.classList.add('open');
    const ok = root.querySelector<HTMLButtonElement>('[data-act="ok"]')!;
    const input = root.querySelector<HTMLInputElement>('input');
    if (input) {
      ok.disabled = true;
      input.addEventListener('input', () => (ok.disabled = input.value.trim().toUpperCase() !== o.requireText));
      setTimeout(() => input.focus(), 30);
    } else {
      setTimeout(() => root.querySelector<HTMLButtonElement>('[data-act="cancel"]')!.focus(), 30);
    }
    const finish = (v: boolean) => {
      active = null;
      root.classList.remove('open');
      root.innerHTML = '';
      resolve(v);
    };
    active = finish;
    ok.addEventListener('click', () => finish(true));
    root.querySelector('[data-act="cancel"]')!.addEventListener('click', () => finish(false));
  });
}
