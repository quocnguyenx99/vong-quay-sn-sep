/** Uniform integer in [0, n) from crypto, rejecting values that would cause modulo bias. */
export function randomIndex(n: number): number {
  if (n <= 0) throw new Error('randomIndex: n must be > 0');
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % n;
}

export function pickOne<T>(items: readonly T[]): T {
  return items[randomIndex(items.length)];
}
