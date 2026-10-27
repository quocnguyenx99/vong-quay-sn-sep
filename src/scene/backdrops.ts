/** Stand-in tiles for the parallax layers, seamless horizontally. */
const B = '#D6B47E';
const BD = '#B8925A';
const BL = '#E8D3AC';
const PS = '#EDE4DA';

function uri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Deterministic pseudo-random so the skyline is the same every load. */
function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function skyTile(w: number, h: number): string {
  const r = rand(7);
  let clouds = '';
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * (w / 4) + r() * 120;
    const y = 300 + r() * 160;
    const sc = 0.7 + r() * 0.6;
    clouds += `<g transform="translate(${x} ${y}) scale(${sc})" fill="none" stroke="${BL}" stroke-width="2">
      <path d="M0 40 Q10 10 40 18 Q55 -6 85 12 Q115 0 125 28 Q150 30 145 46 H0 Z"/>
      <path d="M20 36 Q40 30 60 36 M70 30 Q90 24 110 32" stroke-width="1.2"/></g>`;
  }
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${clouds}</svg>`);
}

export function cityTile(w: number, h: number): string {
  const r = rand(42);
  let out = '';
  let x = 0;
  while (x < w) {
    const bw = 70 + Math.floor(r() * 90);
    const bh = 110 + Math.floor(r() * 190);
    const top = h - bh;
    const kind = r();
    const width = Math.min(bw, w - x);
    out += `<rect x="${x}" y="${top}" width="${width}" height="${bh}" fill="#F3EFE8" stroke="${BL}" stroke-width="1.8"/>`;
    if (kind < 0.35) {
      out += `<path d="M${x - 4} ${top} L${x + width / 2} ${top - 34} L${x + width + 4} ${top} Z" fill="#F3EFE8" stroke="${BL}" stroke-width="1.8"/>`;
    } else if (kind < 0.45 && width > 60) {
      // bell tower
      const tx = x + width / 2 - 14;
      out += `<rect x="${tx}" y="${top - 90}" width="28" height="90" fill="#F3EFE8" stroke="${BL}" stroke-width="1.8"/>
        <path d="M${tx - 4} ${top - 90} L${tx + 14} ${top - 130} L${tx + 32} ${top - 90} Z" fill="#F3EFE8" stroke="${BL}" stroke-width="1.8"/>
        <line x1="${tx + 14}" y1="${top - 130}" x2="${tx + 14}" y2="${top - 146}" stroke="${BL}" stroke-width="1.8"/>`;
    } else {
      out += `<line x1="${x}" y1="${top + 10}" x2="${x + width}" y2="${top + 10}" stroke="${BL}" stroke-width="1.2"/>`;
    }
    for (let wy = top + 26; wy < h - 30; wy += 34) {
      for (let wx = x + 12; wx < x + width - 18; wx += 24) {
        out += `<rect x="${wx}" y="${wy}" width="10" height="16" fill="none" stroke="${BL}" stroke-width="1"/>`;
      }
    }
    x += width;
    if (r() < 0.3 && x < w - 60) {
      // tree between buildings
      out += `<line x1="${x + 20}" y1="${h}" x2="${x + 20}" y2="${h - 160}" stroke="${BL}" stroke-width="2"/>
        <ellipse cx="${x + 20}" cy="${h - 180}" rx="30" ry="42" fill="none" stroke="${BL}" stroke-width="1.6"/>`;
      x += 40;
    }
  }
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${out}</svg>`);
}

export function midTile(w: number, h: number): string {
  const pole = (px: number) => `
    <rect x="${px - 4}" y="40" width="8" height="${h - 40}" fill="#F3EFE8" stroke="${BD}" stroke-width="1.8"/>
    <rect x="${px - 34}" y="58" width="68" height="7" fill="${BL}" stroke="${BD}" stroke-width="1.5"/>
    ${[-28, -10, 10, 28].map((d) => `<circle cx="${px + d}" cy="55" r="3.5" fill="${BL}" stroke="${BD}"/>`).join('')}`;
  const wires = [-28, 28]
    .map((d) => `<path d="M${d} 55 Q${w / 2} 100 ${w + d} 55" fill="none" stroke="${B}" stroke-width="1.2"/>`)
    .join('');
  const lamp = `<line x1="${w / 2}" y1="120" x2="${w / 2}" y2="${h}" stroke="${BD}" stroke-width="4"/>
    <path d="M${w / 2} 122 Q${w / 2 + 30} 110 ${w / 2 + 40} 130" fill="none" stroke="${BD}" stroke-width="3"/>
    <path d="M${w / 2 + 30} 130 H${w / 2 + 50} L${w / 2 + 46} 154 H${w / 2 + 34} Z" fill="${BL}" stroke="${BD}" stroke-width="1.6"/>`;
  return uri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${wires}${pole(0)}${pole(w)}${lamp}</svg>`,
  );
}

export function fenceTile(w: number, h: number): string {
  let posts = '';
  for (let x = 0; x < w; x += 60) {
    posts += `<rect x="${x + 2}" y="18" width="8" height="${h - 24}" fill="#F3EFE8" stroke="${BD}" stroke-width="1.6"/>`;
  }
  let grass = '';
  for (let x = 4; x < w; x += 9) {
    const g = 6 + ((x * 7) % 11);
    grass += `<path d="M${x} ${h} q2 -${g} ${4 + (x % 3)} -${g + 3}" fill="none" stroke="${B}" stroke-width="1.2"/>`;
  }
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="0" y="30" width="${w}" height="6" fill="${BL}" stroke="${BD}" stroke-width="1.2"/>
    <rect x="0" y="50" width="${w}" height="6" fill="${BL}" stroke="${BD}" stroke-width="1.2"/>
    ${posts}${grass}</svg>`);
}

export function trackTile(w: number, h: number): string {
  let sleepers = '';
  for (let x = 0; x < w; x += 40) {
    sleepers += `<rect x="${x + 7}" y="13" width="26" height="10" fill="${BL}" stroke="${BD}" stroke-width="1.4"/>`;
  }
  let ballast = '';
  for (let x = 3; x < w; x += 7) {
    ballast += `<circle cx="${x}" cy="${26 + ((x * 13) % 14)}" r="1.6" fill="${B}"/>`;
  }
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <path d="M0 22 H${w} V44 H0 Z" fill="${PS}"/>
    ${ballast}${sleepers}
    <rect x="0" y="7" width="${w}" height="6" fill="${BD}"/>
    <line x1="0" y1="10" x2="${w}" y2="10" stroke="${BL}" stroke-width="1"/>
    <rect x="${w - 3}" y="6" width="3" height="8" fill="#2B2520" opacity=".5"/></svg>`);
}

export function groundTile(w: number, h: number): string {
  let marks = '';
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % w;
    const y = 20 + ((i * 53) % (h - 30));
    marks += `<path d="M${x} ${y} h10 M${x + 4} ${y + 6} h12" stroke="${BL}" stroke-width="1.2"/>`;
  }
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${PS}"/>${marks}</svg>`);
}
