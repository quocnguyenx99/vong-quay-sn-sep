import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/400-italic.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/500.css';
import '@fontsource/roboto-condensed/700.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { sound } from './audio/sound';
import { asset, loadMemories } from './core/assets';
import { padNumber } from './core/format';
import { Director, type Phase } from './director';
import { startGrain } from './scene/grain';
import { Particles } from './scene/particles';
import { Train } from './scene/train';
import { hatchDefs } from './scene/trainArt';
import { World } from './scene/world';
import { store } from './state/store';
import { closeDialog, dialogOpen, initDialog } from './ui/dialog';
import { FlapBoard } from './ui/flapBoard';
import { Leaderboard } from './ui/leaderboard';
import { Settings } from './ui/settings';
import { Celebration } from './ui/winnerTicket';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

// ---------- Stage scaling: the 1920x1080 canvas letterboxes into any screen ----------
const stage = $('#stage');
function fit(): void {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit);
fit();

store.load();
document.body.insertAdjacentHTML('afterbegin', hatchDefs());
initDialog($('#dialog'));
startGrain($<HTMLCanvasElement>('#grain'));

// ---------- Boarding screen ----------
const boarding = $('#boarding');
boarding.innerHTML = `
  <div class="boarding-card scalloped"><div class="inner">
    <div class="bite" style="width:90px;height:90px;left:-45px;top:-45px"></div>
    <div class="bite" style="width:90px;height:90px;right:-45px;top:-45px"></div>
    <div class="bite" style="width:90px;height:90px;left:-45px;bottom:-45px"></div>
    <div class="bite" style="width:90px;height:90px;right:-45px;bottom:-45px"></div>
    <div class="label">Chuyến tàu</div>
    <h1 class="display"></h1>
    <div class="sub"></div>
    <div class="row">
      <button class="btn-primary" type="button" disabled>Lên tàu</button>
      <span class="status">Đang chuẩn bị toa tàu…</span>
    </div>
  </div></div>`;
boarding.querySelector('h1')!.textContent = store.config.title;
boarding.querySelector('.sub')!.textContent = store.config.subtitle;
const boardBtn = boarding.querySelector<HTMLButtonElement>('button')!;
const boardStatus = boarding.querySelector<HTMLElement>('.status')!;

// ---------- Scene ----------
const world = new World($('#world'));
const train = new Train($('#train-layer'));
const particles = new Particles($<HTMLCanvasElement>('#fx'));
const board = new FlapBoard($('#board-slot'), store.digits);
const leaderboard = new Leaderboard($('#leaderboard'), $('#board-full'));
let celebration: Celebration;
let director: Director;

const departBtn = $<HTMLButtonElement>('#depart');
const muteBtn = $<HTMLButtonElement>('#btn-mute');

function renderHud(): void {
  const c = store.config;
  $('#title').textContent = c.title;
  $('#subtitle').textContent = c.subtitle;
  const d = store.digits;
  const left = store.remaining().length;
  $('#info').innerHTML =
    `<span>Dải vé<b>${padNumber(c.start, d)}–${padNumber(c.end, d)}</b></span>` +
    `<span>Đã trúng<b>${store.winners.length}</b></span>` +
    `<span>Còn lại<b>${left}</b></span>`;
  const idle = director?.phase === 'idle';
  departBtn.disabled = !idle || left === 0;
  departBtn.classList.toggle('breathe', idle && left > 0);
  departBtn.querySelector('.depart-label')!.textContent =
    left === 0 ? 'Tất cả hành khách đã lên tàu' : director?.phase === 'running' && c.brakeMode === 'manual' ? 'Kéo phanh' : 'Khởi hành';
  if (director?.phase === 'running' && c.brakeMode === 'manual') departBtn.disabled = false;
  muteBtn.classList.toggle('off', c.muted);
}

const settings = new Settings($('#settings'), {
  onSaved: () => {
    sound.setVolume(store.config.volume);
    if (director.phase === 'idle') {
      board.setDigits(store.digits);
      board.clear();
    }
    leaderboard.render();
    renderHud();
  },
  onPreview: () => director.depart(true),
  onReset: () => {
    board.setDigits(store.digits);
    board.clear();
    board.setTrip(null);
    leaderboard.render();
    renderHud();
  },
});

function onPhase(p: Phase): void {
  renderHud();
  if (p === 'idle' && store.remaining().length === 0) board.setLamp('stop');
}

// ---------- Controls ----------
function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen().catch(() => {});
}

function toggleMute(): void {
  store.updateConfig({ muted: !store.config.muted });
  sound.setMuted(store.config.muted);
}

departBtn.addEventListener('click', () => director.primary());
$('#btn-full').addEventListener('click', toggleFullscreen);
muteBtn.addEventListener('click', toggleMute);
$('#btn-board').addEventListener('click', () => director.phase === 'idle' && leaderboard.toggleFull());
$('#btn-settings').addEventListener('click', () => director.phase === 'idle' && settings.open());
$('#board-full').addEventListener('click', () => leaderboard.toggleFull(false));

let fpsOn = false;
addEventListener('keydown', (e) => {
  if (dialogOpen()) {
    if (e.key === 'Escape') closeDialog();
    return;
  }
  if (settings.isOpen) {
    if (e.key === 'Escape') settings.close();
    return;
  }
  if (!boarding.classList.contains('gone')) {
    if ((e.key === ' ' || e.key === 'Enter') && !boardBtn.disabled) {
      e.preventDefault();
      boardBtn.click();
    }
    return;
  }
  if (e.repeat) return;
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault();
      if (leaderboard.fullOpen) leaderboard.toggleFull(false);
      else director.primary();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    case 'b':
    case 'B':
      if (director.phase === 'idle') leaderboard.toggleFull();
      break;
    case 'm':
    case 'M':
      toggleMute();
      break;
    case 's':
    case 'S':
      if (director.phase === 'idle') settings.open();
      break;
    case 'p':
    case 'P':
      fpsOn = !fpsOn;
      $('#fps').style.display = fpsOn ? 'block' : 'none';
      break;
    case 'Escape':
      leaderboard.toggleFull(false);
      break;
  }
});

// ---------- FPS meter and automatic quality drop ----------
let frames = 0;
let lowSeconds = 0;
let last = performance.now();
function measure(now: number): void {
  frames++;
  if (now - last >= 1000) {
    const fps = Math.round((frames * 1000) / (now - last));
    $('#fps').textContent = `${fps} fps`;
    if (director?.phase === 'running') {
      lowSeconds = fps < 48 ? lowSeconds + 1 : 0;
      if (lowSeconds >= 2) particles.setDensity(0.5);
    }
    frames = 0;
    last = now;
  }
  requestAnimationFrame(measure);
}
requestAnimationFrame(measure);

// ---------- Boot ----------
async function boot(): Promise<void> {
  const paper = await asset('ui/paper-texture');
  if (paper) stage.style.setProperty('--paper-texture', `url("${paper.src}")`);
  const photos = await loadMemories();
  await Promise.all([world.init(photos), train.init(), particles.init(), sound.init()]);
  celebration = new Celebration($('#celebrate'), photos);
  director = new Director({
    world,
    train,
    particles,
    board,
    celebration,
    leaderboard,
    leaderboardEl: $('#leaderboard'),
    tunnel: $('#tunnel'),
    headlight: $('#tunnel .headlight'),
    tint: $('#time-tint'),
    onPhase,
  });
  sound.setVolume(store.config.volume);
  sound.setMuted(store.config.muted);
  leaderboard.render();
  store.subscribe(renderHud);
  renderHud();

  boardStatus.textContent = store.pending
    ? 'Có một lượt quay đang dở — lên tàu để xem kết quả.'
    : `Sẵn sàng · ${store.remaining().length} vé đang chờ`;
  boardBtn.disabled = false;
  boardBtn.focus();
  boardBtn.addEventListener('click', () => {
    sound.unlock();
    void document.documentElement.requestFullscreen?.().catch(() => {});
    boarding.classList.add('gone');
    director.begin();
  });
}

void boot();
