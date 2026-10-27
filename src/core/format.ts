export function padNumber(n: number, digits: number): string {
  return String(n).padStart(digits, '0');
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((v) => String(v).padStart(2, '0')).join(':');
}

export function ticketCode(prefix: string, n: number, digits: number): string {
  const p = prefix.trim();
  return p ? `${p} ${padNumber(n, digits)}` : padNumber(n, digits);
}

/** Excel-friendly CSV: UTF-8 BOM so Vietnamese renders correctly. */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
