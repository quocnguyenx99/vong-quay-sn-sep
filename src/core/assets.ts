/**
 * Asset slots from docs/image-prompts.md. Each slot resolves to the first file that
 * exists under public/assets; when none does, callers fall back to drawn art.
 */
const BASE = 'assets/';
const EXTS = ['webp', 'png', 'jpg'];

const cache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** `slot` is a path without extension, e.g. "train/loco-body". */
export function asset(slot: string): Promise<HTMLImageElement | null> {
  let p = cache.get(slot);
  if (!p) {
    p = (async () => {
      for (const ext of EXTS) {
        const img = await loadImage(`${BASE}${slot}.${ext}`);
        if (img) return img;
      }
      return null;
    })();
    cache.set(slot, p);
  }
  return p;
}

const PHOTO_EXTS = ['webp', 'jpg', 'jpeg', 'png'];
const numbered = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);

async function firstExisting(name: string): Promise<HTMLImageElement | null> {
  for (const ext of PHOTO_EXTS) {
    const img = await loadImage(`memories/${name}.${ext}`);
    if (img) return img;
  }
  return null;
}

/**
 * Real photos: public/memories/real-01.jpg … real-12.jpg are picked up automatically.
 * Files with other names can be listed in public/memories/memories.json as {"photos": ["anh-cu.jpg"]}.
 * With fewer than 6 real photos, the AI defaults (default-01 … default-06) fill the gap.
 */
export async function loadMemories(): Promise<HTMLImageElement[]> {
  let listed: string[] = [];
  try {
    const res = await fetch('memories/memories.json', { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as { photos?: unknown };
      if (Array.isArray(json.photos)) listed = json.photos.filter((p): p is string => typeof p === 'string');
    }
  } catch {
    // No manifest: numbered files only.
  }
  const keep = (imgs: (HTMLImageElement | null)[]) => imgs.filter((i): i is HTMLImageElement => i !== null);
  const real = keep([
    ...(await Promise.all(numbered('real', 12).map(firstExisting))),
    ...(await Promise.all(listed.map((f) => loadImage(`memories/${f}`)))),
  ]);
  if (real.length >= 6) return real;
  const defaults = keep(await Promise.all(numbered('default', 6).map(firstExisting)));
  return [...real, ...defaults];
}
