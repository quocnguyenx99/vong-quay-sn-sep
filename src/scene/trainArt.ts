/**
 * Stand-in engraving-style art drawn in SVG, used until the generated images exist.
 * Single brass ink on cream paper, with hatching patterns for shading.
 */
const P = '#F3EFE8';
const B = '#D6B47E';
const BD = '#B8925A';
const BL = '#E8D3AC';

/** Shared hatch patterns, injected once into the document. */
export function hatchDefs(): string {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="${B}" stroke-width="1.3"/></pattern>
    <pattern id="hatch-dense" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="${BD}" stroke-width="1.2"/></pattern>
    <pattern id="hatch-h" width="6" height="5" patternUnits="userSpaceOnUse">
      <line x1="0" y1="2.5" x2="6" y2="2.5" stroke="${B}" stroke-width="1.1"/></pattern>
  </defs></svg>`;
}

const S = `stroke="${BD}" stroke-width="2.2" stroke-linejoin="round"`;
const s = `stroke="${B}" stroke-width="1.4"`;

function rivets(x0: number, x1: number, y: number, step = 16): string {
  let out = '';
  for (let x = x0; x <= x1; x += step) out += `<circle cx="${x}" cy="${y}" r="1.7" fill="${BD}"/>`;
  return out;
}

export function locoSvg(): string {
  return `<svg width="520" height="300" viewBox="0 0 520 300">
  <rect x="0" y="198" width="34" height="8" fill="${BL}" ${S}/>
  <rect x="100" y="200" width="335" height="22" fill="url(#hatch-dense)" ${S}/>
  <!-- cab -->
  <rect x="30" y="52" width="132" height="140" fill="${P}" ${S}/>
  <rect x="30" y="140" width="132" height="52" fill="url(#hatch)"/>
  <rect x="20" y="40" width="152" height="14" rx="3" fill="${BL}" ${S}/>
  <rect x="50" y="74" width="48" height="48" fill="#EDE4DA" ${S}/>
  <rect x="108" y="74" width="36" height="48" fill="#EDE4DA" ${S}/>
  <line x1="74" y1="74" x2="74" y2="122" ${s}/>
  <!-- boiler -->
  <rect x="160" y="96" width="252" height="92" fill="${P}" ${S}/>
  <rect x="160" y="150" width="252" height="38" fill="url(#hatch)"/>
  <rect x="160" y="96" width="252" height="14" fill="url(#hatch-h)" opacity=".6"/>
  ${[205, 255, 305, 355].map((x) => `<line x1="${x}" y1="96" x2="${x}" y2="188" ${s}/>`).join('')}
  <line x1="166" y1="124" x2="408" y2="124" stroke="${BD}" stroke-width="2"/>
  <circle cx="166" cy="124" r="3" fill="${BD}"/>
  ${rivets(170, 404, 182)}
  <!-- smokebox -->
  <rect x="410" y="90" width="72" height="100" fill="${P}" ${S}/>
  <rect x="410" y="140" width="72" height="50" fill="url(#hatch-dense)"/>
  <ellipse cx="484" cy="140" rx="10" ry="50" fill="${BL}" ${S}/>
  ${rivets(416, 476, 96, 12)}
  <!-- domes, bell, whistle -->
  <path d="M300 96 C300 64 342 64 342 96 Z" fill="${P}" ${S}/>
  <path d="M302 96 C304 80 338 80 340 96 Z" fill="url(#hatch)"/>
  <path d="M232 96 C232 76 264 76 264 96 Z" fill="${P}" ${S}/>
  <path d="M366 96 C366 82 384 82 384 96 Z" fill="${BL}" ${S}/>
  <line x1="375" y1="82" x2="375" y2="72" ${S}/>
  <rect x="186" y="78" width="8" height="18" fill="${BL}" ${S}/>
  <!-- stack -->
  <path d="M434 90 L438 52 L428 38 H468 L458 52 L462 90 Z" fill="${P}" ${S}/>
  <path d="M438 60 H458 L461 90 H435 Z" fill="url(#hatch-dense)"/>
  <!-- headlamp -->
  <rect x="468" y="64" width="28" height="26" rx="3" fill="${P}" ${S}/>
  <circle cx="496" cy="77" r="9" fill="${BL}" ${S}/>
  <!-- running board -->
  <rect x="36" y="188" width="468" height="12" fill="${BL}" ${S}/>
  <!-- cylinder + guides -->
  <line x1="352" y1="205" x2="440" y2="205" stroke="${BD}" stroke-width="3"/>
  <line x1="352" y1="219" x2="440" y2="219" stroke="${BD}" stroke-width="3"/>
  <rect x="438" y="194" width="62" height="36" rx="6" fill="${P}" ${S}/>
  <rect x="438" y="212" width="62" height="18" rx="4" fill="url(#hatch-dense)"/>
  <!-- cowcatcher -->
  <path d="M476 232 H502 L520 289 H476 Z" fill="${P}" ${S}/>
  ${[484, 494, 504].map((x) => `<line x1="${x}" y1="232" x2="${x + (x - 470) * 0.35}" y2="289" ${s}/>`).join('')}
</svg>`;
}

export function tenderSvg(): string {
  return `<svg width="230" height="300" viewBox="0 0 230 300">
  <rect x="0" y="198" width="16" height="8" fill="${BL}" ${S}/>
  <rect x="214" y="198" width="16" height="8" fill="${BL}" ${S}/>
  <path d="M26 114 Q60 66 112 92 Q152 60 210 114 Z" fill="url(#hatch-dense)" ${S}/>
  <rect x="10" y="110" width="210" height="10" fill="${BL}" ${S}/>
  <rect x="14" y="120" width="202" height="112" fill="${P}" ${S}/>
  <rect x="14" y="190" width="202" height="42" fill="url(#hatch)"/>
  <rect x="34" y="134" width="162" height="48" fill="none" ${s}/>
  ${rivets(22, 210, 126, 14)}
  <rect x="18" y="232" width="194" height="12" fill="url(#hatch-dense)" ${S}/>
</svg>`;
}

export function carriageSvg(): string {
  const windows = [30, 92, 154, 236, 298, 360]
    .map((x) => `<path d="M${x} 158 V128 Q${x + 20} 108 ${x + 40} 128 V158 Z" fill="#EDE4DA" ${S}/>`)
    .join('');
  return `<svg width="430" height="300" viewBox="0 0 430 300">
  <rect x="0" y="198" width="14" height="8" fill="${BL}" ${S}/>
  <rect x="416" y="198" width="14" height="8" fill="${BL}" ${S}/>
  <path d="M6 96 Q215 46 424 96 V104 H6 Z" fill="${BL}" ${S}/>
  <path d="M60 78 Q215 52 370 78" fill="none" ${s}/>
  <rect x="12" y="102" width="406" height="138" fill="${P}" ${S}/>
  <rect x="12" y="214" width="406" height="26" fill="url(#hatch)"/>
  <line x1="12" y1="164" x2="418" y2="164" ${s}/>
  ${windows}
  ${rivets(20, 412, 108, 14)}
  <rect x="20" y="240" width="390" height="10" fill="${BL}" ${S}/>
  <rect x="30" y="248" width="100" height="10" fill="url(#hatch-dense)" ${S}/>
  <rect x="300" y="248" width="100" height="10" fill="url(#hatch-dense)" ${S}/>
</svg>`;
}

export function wheelSvg(r: number, kind: 'driver' | 'small' | 'car', crank = 0): string {
  const size = r * 2 + 4;
  const c = r + 2;
  const spokes = kind === 'driver' ? 16 : kind === 'small' ? 10 : 8;
  let lines = '';
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    const x1 = c + Math.cos(a) * r * 0.2;
    const y1 = c + Math.sin(a) * r * 0.2;
    const x2 = c + Math.cos(a) * (r - 6);
    const y2 = c + Math.sin(a) * (r - 6);
    lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${BD}" stroke-width="${kind === 'driver' ? 2.2 : 1.6}"/>`;
  }
  // Counterweight opposite the crank pin, which sits on the +x axis.
  const cw =
    kind === 'driver'
      ? `<path d="M${c - r * 0.82} ${c - r * 0.42} A${r * 0.92} ${r * 0.92} 0 0 0 ${c - r * 0.82} ${c + r * 0.42} Q${c - r * 0.45} ${c} ${c - r * 0.82} ${c - r * 0.42} Z" fill="url(#hatch-dense)" stroke="${BD}" stroke-width="1.5"/>`
      : '';
  const pin = crank ? `<circle cx="${c + crank}" cy="${c}" r="5" fill="${BL}" stroke="${BD}" stroke-width="2"/>` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${c}" cy="${c}" r="${r}" fill="${P}" stroke="${BD}" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${r - 6}" fill="none" stroke="${B}" stroke-width="1.6"/>
  ${lines}${cw}
  <circle cx="${c}" cy="${c}" r="${Math.max(r * 0.18, 4)}" fill="${BL}" stroke="${BD}" stroke-width="2"/>
  ${pin}
</svg>`;
}
