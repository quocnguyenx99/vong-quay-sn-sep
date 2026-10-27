# Phương án kỹ thuật — Con tàu & hiệu ứng

Mục tiêu: **chân thật, mượt (60fps), nhẹ, chạy offline** trên laptop nối máy chiếu. Stack đã chốt: **Vite + vanilla TypeScript**.

---

## 1. So sánh phương án dựng con tàu

| # | Phương án | Chân thật | Mượt | Nhẹ | Công sức | Nhận xét |
|---|---|---|---|---|---|---|
| 1 | **Ảnh tách layer (WebP) + SVG thanh truyền + GSAP** | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ | Nét khắc AI giữ nguyên chất vé mời; bánh xe xoay thật, thanh truyền tính bằng hình học → rất "cơ khí" |
| 2 | Lottie (After Effects → JSON) | ★★★★ | ★★★★ | ★★★ | ★★ | Cần người làm AE; khó đồng bộ tốc độ với thời lượng cấu hình |
| 3 | Sprite sheet (nhiều frame AI) | ★★ | ★★★ | ★★ | ★★★ | AI khó vẽ các frame nhất quán → giật, nặng |
| 4 | PixiJS (WebGL 2D) | ★★★★ | ★★★★★ | ★★★ | ★★★ | Rất mượt với nhiều hạt; thêm ~450KB; hợp nếu cần > 500 hạt khói |
| 5 | Three.js 3D | ★★★★★ | ★★★ | ★ | ★ | Lệch style nét khắc 2D, nặng, rủi ro iGPU |

### ✅ Đề xuất: Phương án 1 (DOM/CSS transform + Canvas 2D cho hạt)

- Tàu = nhóm `<div>` chứa các `<img>` WebP; chỉ animate `transform`/`opacity` → GPU compositing, không layout/paint lại.
- **Bánh xe**: `rotate(θ)`, với `θ = quãng đường / bán kính` → bánh lăn đúng tốc độ, không trượt.
- **Thanh truyền & piston**: 1 SVG `<line>`/`<path>`; mỗi frame tính vị trí chốt khuỷu `(r·cosθ, r·sinθ)` → piston trượt ngang, thanh truyền nối 2 điểm. Đây là chi tiết tạo cảm giác "thật" nhất.
- **Khói / hơi nước / tia lửa**: 1 `<canvas>` 2D với particle pool (≤ 200 hạt, tái sử dụng object, sprite khói từ image-prompts nhóm 2). Tần suất nhả khói ∝ tốc độ.
- **Parallax**: mỗi lớp nền là `div` với `background-repeat: repeat-x`, dịch `translate3d(-x·k, 0, 0)` với hệ số `k` = 0.1 / 0.3 / 0.6 / 1.0.
- **Camera**: tàu giữ gần giữa màn hình, thế giới chạy ngược → không bao giờ "hết đường".
- Nếu đo thực tế < 55fps khi nhiều hạt → chỉ chuyển lớp khói sang **PixiJS** (giữ nguyên phần còn lại).

---

## 2. Mô hình chuyển động (deterministic)

Toàn bộ animation điều khiển bởi **một hàm vận tốc theo thời gian** `v(t)` và một timeline GSAP — nên co giãn theo cấu hình và luôn dừng đúng chỗ.

```
v(t):  0 ──(khởi hành, power2.in, 1.2s)──▶ Vmax ──(giữ, T_run)──▶ ──(phanh, power3.out, T_draw)──▶ 0
x(t) = ∫ v(t) dt  → dùng cho parallax, góc bánh xe, nhịp khói, nhịp âm thanh
```

- Vmax tỉ lệ với `T_run` (chạy lâu → nhanh hơn, cảm giác hành trình dài).
- Giai đoạn phanh: vị trí dừng được tính trước để **toa khách dừng đúng dưới bảng ga**.
- Bảng lật: timeline riêng, khoá chữ số tại 40% / 70% / 100% `T_draw`; chữ số cuối dùng chuỗi số "suýt trúng" sinh trước (VD 5 → 6 → 8 → 7).
- Chỉ dùng **1 vòng `requestAnimationFrame`** (`gsap.ticker`) cho tàu + hạt + âm thanh.

### State machine
```
IDLE → DEPARTING → RUNNING → (BRAKING) → ARRIVED → CELEBRATING → LOGGING → IDLE
                      └─ chế độ phanh tay: chờ Space ─┘
```
Phím chỉ có tác dụng ở trạng thái hợp lệ → chống bấm đúp.

---

## 3. Thư viện

| Thư viện | Dùng cho | Kích thước (gzip, ước lượng) |
|---|---|---|
| **gsap** (core) | Timeline, easing, ticker | ~25KB |
| **howler** | Âm thanh: loop, rate theo tốc độ, sprite âm, unlock autoplay | ~10KB |
| **canvas-confetti** | Confetti màu `--brass`, `--paper`, `--brass-light` + hình tròn/vé nhỏ | ~6KB |
| **@fontsource/be-vietnam-pro** (+ font display) | Font offline | theo subset |
| (tuỳ chọn) **pixi.js** | Chỉ khi cần hạt khói nặng | ~150KB+ |

Không dùng framework UI. Tổng JS mục tiêu < 80KB gzip.

Tự viết (nhỏ, không cần thư viện): split-flap (CSS 3D `rotateX` 2 nửa), particle khói, grain overlay, RNG `crypto.getRandomValues`, lưu `localStorage`, xuất CSV.

---

## 4. Danh mục hiệu ứng

| Hiệu ứng | Kỹ thuật | Thời điểm |
|---|---|---|
| Khói ống khói | Canvas particles, sprite khói, scale + fade + trôi ngược chiều chạy | Liên tục, dày theo tốc độ |
| Hơi nước xả dưới bánh | Sprite `steam-burst` + scaleX | Khởi hành, cập ga |
| Bánh xe lăn + thanh truyền | rotate + SVG tính hình học | Khi chạy |
| Rung thân tàu | `translateY` sin nhỏ ∝ tốc độ | Khi chạy |
| Parallax 4 lớp | translate3d | Khi chạy |
| Đường hầm | Lớp tối + headlight-glow + bảng ga phát sáng | Giữa `T_run` (nếu ≥ 6s) |
| Chuyển tông sepia | CSS `filter: sepia()` animate trên lớp nền | Dọc hành trình |
| Tia lửa phanh | Canvas hạt cam nhỏ ở bánh | Phanh |
| Lật bảng split-flap | CSS 3D, tick âm | Chạy + phanh |
| Đèn ga đổi màu | opacity 2 lớp sáng | Cập ga |
| Semaphore hạ cờ | rotate cánh tay | Cập ga |
| Vé trúng bay ra + lật | GSAP 3D (rotateY, scale) | Chúc mừng |
| Bấm lỗ vé | Scale-in `punch-mark` + rung nhẹ | Chúc mừng |
| Confetti | canvas-confetti 2 đợt từ 2 bên | Chúc mừng |
| Lời chúc chạy chữ | Gõ từng ký tự | Chúc mừng |
| Hàng mới vào bảng vinh danh | FLIP slide + highlight | Ghi sổ |
| Grain + vignette phim cũ | Canvas noise 12fps / CSS | Luôn có |

`prefers-reduced-motion`: tắt rung, giảm hạt 70%, bỏ chuyển cảnh hầm.

---

## 5. Âm thanh — nguồn miễn phí

Tải từ các trang cho phép dùng miễn phí. **Kiểm tra giấy phép từng file** khi tải (Pixabay Content License: dùng tự do không cần ghi nguồn; Freesound: ưu tiên lọc **CC0**).

| File đích (`public/audio/`) | Từ khoá tìm | Nguồn tìm |
|---|---|---|
| `whistle.ogg` | steam train whistle | pixabay.com/sound-effects → tìm "steam train whistle"; freesound.org → "steam whistle" (lọc CC0) |
| `chug-loop.ogg` | steam locomotive chugging loop | như trên |
| `rail-clack-loop.ogg` | train on tracks clickety clack | như trên |
| `steam-release.ogg` | steam hiss release | như trên |
| `brake-squeal.ogg` | train brake squeal | như trên |
| `station-bell.ogg` | station bell / train bell | như trên |
| `lever-clunk.ogg` | lever pull metal clunk | như trên |
| `flap-tick.ogg` | split flap display / solari board | như trên |
| `ticket-punch.ogg` | ticket punch / hole punch | như trên |
| `drumroll.ogg` | drum roll suspense | như trên |
| `paper-tear.ogg` | paper tear | như trên (dùng cho "Vắng mặt") |
| `applause.ogg` (tuỳ chọn) | small crowd applause | như trên |

Sau khi tải: cắt gọn, chuẩn hoá âm lượng (-14 LUFS), xuất **OGG + MP3** (Howler tự chọn), loop phải cắt điểm nối mượt. Tôi có thể làm bước này bằng `ffmpeg` khi bạn đưa file.

---

## 6. Cấu trúc dự án dự kiến (giai đoạn code)

```
quay-so-sn-sep/
├─ docs/                      # tài liệu này
├─ public/
│  ├─ assets/{train,fx,bg,station,ui}/   # ảnh theo image-prompts.md
│  ├─ memories/               # ảnh kỷ niệm thật + mặc định
│  ├─ audio/
│  └─ fonts/
├─ src/
│  ├─ main.ts                 # khởi tạo, preload, unlock audio
│  ├─ state/store.ts          # cấu hình + kết quả + localStorage
│  ├─ core/rng.ts             # crypto RNG không bias
│  ├─ core/machine.ts         # state machine
│  ├─ scene/train.ts          # tàu, bánh, thanh truyền
│  ├─ scene/parallax.ts
│  ├─ scene/particles.ts      # khói, hơi, tia lửa
│  ├─ ui/flapBoard.ts
│  ├─ ui/winnerTicket.ts
│  ├─ ui/leaderboard.ts
│  ├─ ui/settings.ts
│  ├─ audio/sound.ts
│  └─ styles/{tokens,base,components}.css
└─ index.html
```

Chạy tại sự kiện: `npm run build` → mở `dist/` bằng `npx vite preview` (hoặc file `start.bat` tôi sẽ tạo sẵn) → Chrome toàn màn hình.

---

## 7. Rủi ro & cách giảm

| Rủi ro | Giảm thiểu |
|---|---|
| Ảnh AI tàu không cùng tỉ lệ/baseline | Checklist trong image-prompts; tôi viết file `train.config.ts` chỉnh offset từng layer |
| Laptop yếu giật | Bộ đo FPS ẩn (phím `P`); tự giảm hạt khi FPS < 50 |
| Autoplay âm thanh bị chặn | Màn "Lên tàu" bắt buộc bấm 1 lần |
| Máy chiếu làm nhạt màu | Số luôn trên nền `--night`; kiểm thử trên máy chiếu thật trước sự kiện |
| Mất kết quả | Lưu localStorage mỗi bước + xuất CSV |
