/** Animated film grain: a small noise canvas stretched over the stage, refreshed at 12fps. */
export function startGrain(canvas: HTMLCanvasElement): void {
  const w = 384;
  const h = 216;
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  const frames: ImageData[] = [];
  for (let f = 0; f < 6; f++) {
    const img = g.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    frames.push(img);
  }
  let i = 0;
  setInterval(() => {
    g.putImageData(frames[i], 0, 0);
    i = (i + 1) % frames.length;
  }, 1000 / 12);
}
