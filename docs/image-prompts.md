# Image Prompts — "Chuyến tàu trở về những ký ức"

Danh sách **24 hình** app đang dùng. Kích thước và bố cục dưới đây khớp với code: file đặt đúng tên là app tự dùng, không cần sửa code. Style theo [design.md](design.md). Prompt giao việc cho Codex: [codex-prompt.md](codex-prompt.md).

## Tài liệu tham chiếu

| File | Dùng để |
|---|---|
| `ve-tau-sn/2.png` | Style chuẩn: nét khắc đồng trên giấy kem, đặc biệt là hình đầu máy |
| `docs/reference/layout-loco.png` | Khung bố cục đầu máy (2080×1200) |
| `docs/reference/layout-tender.png` | Khung bố cục toa than (920×1200) |
| `docs/reference/layout-carriage.png` | Khung bố cục toa khách (1720×1200) |

Trong khung bố cục: nét đồng là **gợi ý hình khối** (vẽ lại đẹp hơn, giữ vị trí và tỉ lệ). **Vùng tròn đỏ** là chỗ bánh xe: để **trống / trong suốt** vì code tự vẽ bánh quay. **Vạch đỏ** dưới cùng là mặt ray. Hình xuất ra **không được còn nét đỏ nào**.

### STYLE BASE (dán vào đầu mọi prompt)

```
Vintage engraving / etching illustration, single-color line art in warm brass-gold (#D6B47E)
with darker brass (#B8925A) for deep hatching, on warm cream paper (#F3EFE8).
Fine parallel hatching and cross-hatching for shading, no gradients, no color fills other than
the cream paper and brass ink. 1960s Saigon nostalgia, antique travel ticket aesthetic,
hand-drawn, elegant, clean silhouette. Consistent line weight across the set.
```

### NEGATIVE (dán vào cuối mọi prompt)

```
no text, no letters, no numbers, no watermark, no signature, no photorealism, no 3D render,
no neon, no saturated colors, no modern objects, no blur, no drop shadow, no red guide marks.
```

### Quy ước chung

- Đường dẫn tính từ `public/assets/`. Đuôi `.png` (cần alpha) hoặc `.webp`; ảnh chụp/texture dùng `.jpg`. Sau khi tạo xong, chạy `python scripts/compress-images.py` để nén sang WebP cho app.
- **Kích thước phải đúng tuyệt đối** (app ghép theo pixel). Tạo ở kích thước model hỗ trợ rồi resize/crop/pad bằng script.
- "Trong suốt" = PNG alpha thật, mép sạch, không viền trắng. Nếu model không ra alpha: vẽ trên nền trắng/kem phẳng rồi tách nền.
- Phần thân tàu được tô **màu giấy kem `#F3EFE8` đặc** bên trong viền (không trong suốt), để cảnh nền phía sau không xuyên qua thân tàu.

---

## Nhóm 1 — Con tàu (6 hình)

Tất cả **nhìn ngang thuần (orthographic side elevation), đầu tàu quay sang PHẢI**, cùng tỉ lệ, cùng độ dày nét. Vé mời vẽ góc 3/4, nhưng app cần góc ngang để tàu chạy trên ray.

| # | File | Kích thước | Ghi chú |
|---|---|---|---|
| 1.1 | `train/loco-body.png` | **2080×1200** | Vẽ đè lên `layout-loco.png`. Không vẽ bánh, thanh truyền, khói |
| 1.2 | `train/loco-wheel-big.png` | **512×512** | Bánh dẫn động lớn |
| 1.3 | `train/loco-wheel-small.png` | **512×512** | Bánh dẫn hướng nhỏ |
| 1.4 | `train/tender.png` | **920×1200** | Vẽ đè lên `layout-tender.png` |
| 1.5 | `train/carriage.png` | **1720×1200** | Vẽ đè lên `layout-carriage.png` |
| 1.6 | `train/carriage-wheel.png` | **512×512** | Bánh toa |

**1.1 — loco-body** (đính kèm `layout-loco.png` + `ve-tau-sn/2.png`)
```
[STYLE BASE]
Redraw the attached layout as a beautiful engraving of an early-20th-century steam locomotive,
strict side elevation, facing RIGHT. Keep every part exactly where the layout puts it, at the
same size: cab on the left, boiler with bands and rivets, steam dome, sand dome, bell, whistle,
tall flared smokestack, headlamp and cowcatcher on the right, running board, cylinder block
with guide bars in front of the third red circle. Same canvas size (2080x1200).
The red dashed circles are wheel slots: leave them EMPTY and transparent (the app adds rotating
wheels and rods there). Nothing below the red rail line. Interior of the body filled with
solid cream #F3EFE8; everything outside the locomotive transparent. No smoke, no rails.
[NEGATIVE]
```

**1.2 — loco-wheel-big**
```
[STYLE BASE]
A single steam-locomotive driving wheel seen perfectly flat (not tilted, not in perspective),
16 straight spokes, thick tyre, hub, crescent counterweight on the LEFT side (9 o'clock),
crank pin boss on the RIGHT side (3 o'clock) at about half the radius. The wheel is perfectly
centered and its outer tyre touches the canvas edges (diameter = 98% of 512px). Spokes and
gaps between them transparent where the background would show; tyre and hub filled cream.
Transparent outside the circle.
[NEGATIVE]
```
> Chốt tay quay **phải nằm ở hướng 3 giờ**: code nối thanh truyền vào đúng vị trí này khi bánh quay.

**1.3 — loco-wheel-small**: như 1.2 nhưng `small leading wheel, 10 spokes, no counterweight, no crank pin`.

**1.4 — tender** (đính kèm `layout-tender.png`)
```
[STYLE BASE]
Redraw the attached layout as an engraving of a steam locomotive coal tender, strict side
elevation, matching the locomotive (same scale and line weight): heaped coal on top, riveted
panels, couplings at both ends. Keep positions and size from the layout (920x1200). Red circles
= wheel slots, leave EMPTY and transparent. Body filled cream #F3EFE8, outside transparent.
[NEGATIVE]
```

**1.5 — carriage** (đính kèm `layout-carriage.png`)
```
[STYLE BASE]
Redraw the attached layout as an engraving of a vintage wooden passenger carriage, strict
side elevation: curved roof with vents, 6 arched windows (glass area plain light cream),
panelled sides with rivets, two bogies, couplings at both ends. Keep positions and size from
the layout (1720x1200). Keep the band below the windows, between x=560 and x=1160 and
y=672 to y=856, as a PLAIN flat panel: the app places the ticket-number plate there.
Red circles = wheel slots, leave EMPTY and transparent. Body filled cream #F3EFE8,
outside transparent.
[NEGATIVE]
```

**1.6 — carriage-wheel**: như 1.2 nhưng `railway carriage wheel, 8 spokes, no counterweight, no crank pin`.

---

## Nhóm 2 — Khói (4 hình)

| # | File | Kích thước |
|---|---|---|
| 2.1 | `fx/smoke-puff-1.png` … `fx/smoke-puff-4.png` | 512×512 |

```
[STYLE BASE]
One isolated puff of locomotive smoke in engraving style, like the smoke on the attached
invitation ticket: billowing rounded cloud outlined with curly brass strokes, inside filled
cream #F3EFE8 with a few curl hatch lines. Centered, cloud fills about 80% of the canvas,
transparent background. Variation {1: round | 2: elongated horizontally | 3: small and dense |
4: wispy and loose}.
[NEGATIVE]
```

---

## Nhóm 3 — Cảnh nền chạy ngang (6 hình)

Mỗi lớp được **lặp ngang liên tục** khi tàu chạy, nên **mép trái phải nối khớp với mép phải** (seamless horizontal tile). Kích thước là 2× độ phân giải hiển thị.

| # | File | Kích thước | Nội dung · Nền |
|---|---|---|---|
| 3.1 | `bg/sky.png` | 3840×1760 | Vài cụm mây nét khắc mảnh, nằm trong dải 35–60% chiều cao (phía trên bị bảng ga che) · **trong suốt** |
| 3.2 | `bg/city-far.png` | 3200×880 | Phố Sài Gòn xưa ở xa: nhà phố mái ngói, tháp chuông nhà thờ, cây dầu, dây điện; nét **rất mảnh, nhạt** (`#E8D3AC`); chân nhà chạm đáy ảnh · trên các mái nhà **trong suốt** |
| 3.3 | `bg/mid-props.png` | 1800×640 | 2 cột điện gỗ có xà sứ + dây điện võng giữa, 1 cột đèn đường cổ, 1 cây me; chân cột chạm đáy ảnh · **trong suốt**. **Không** vẽ biển quảng cáo/khung ảnh (app tự vẽ khung tem ảnh kỷ niệm) |
| 3.4 | `bg/near-ground.png` | 960×160 | Hàng rào gỗ thấp 2 thanh ngang + cỏ dại ở chân · **trong suốt** phía trên |
| 3.5 | `bg/track.png` | 960×100 | Ray sắt nhìn ngang: **mặt ray nằm ở đúng y=20** (20% chiều cao), tà vẹt gỗ và đá dăm bên dưới · trên mặt ray **trong suốt** |
| 3.6 | `bg/ground.png` | 960×320 | Mặt đất bên dưới đường ray: nền be `#EDE4DA` **đặc**, rải rác vài nét cỏ, đá nhỏ |

Prompt mẫu (3.2, các lớp khác thay phần mô tả theo bảng):
```
[STYLE BASE]
Seamless horizontally tileable strip (left edge continues perfectly into right edge) of a
1960s Saigon street skyline seen from far away, side view: colonial shophouses with shutters,
tiled roofs, a church bell tower, tall dipterocarp trees, electric wires. Very thin and light
lines (#E8D3AC), low detail density because this is a distant background layer.
Building bases touch the bottom edge. Transparent background above the roofs.
[NEGATIVE]
```

---

## Nhóm 4 — Giấy & con mộc NKC (2 hình)

| # | File | Kích thước | Ghi chú |
|---|---|---|---|
| 4.1 | `ui/paper-texture.jpg` | 1024×1024 | Texture giấy kem cũ `#F3EFE8`, **tileable cả 4 cạnh**, sợi giấy mịn, vết ố rất nhạt, không gấp, không rách, không chữ; độ tương phản thấp (nền cho toàn app) |
| 4.2 | `ui/stamp-nkc.png` | 600×600 | Con mộc cao su tròn màu đỏ với chữ **NKC** ở giữa, đóng trên vé trúng (hiển thị khoảng 230px, app tự xoay nghiêng 12°). Prompt riêng: [codex-prompt-stamp.md](codex-prompt-stamp.md) |

> `ui/punch-mark` (lỗ bấm vé) không còn được dùng, đã thay bằng con mộc NKC.

---

## Nhóm 5 — Ảnh kỷ niệm mặc định (6 hình)

Chỉ dùng để **bù chỗ trống** khi chưa đủ 6 ảnh thật.

| # | File | Kích thước |
|---|---|---|
| 5.1–5.6 | `../memories/default-01.jpg` … `default-06.jpg` (tức `public/memories/`) | 1200×900 |

```
Faded 1960s-70s color film photograph, Kodachrome look, warm yellowed tones, soft grain,
slight vignette. Subject {1: a quiet Saigon street with old cars and scooters |
2: children playing marbles in an alley | 3: a street-side coffee stall with small stools |
4: an old cinema facade | 5: a bicycle leaning on a yellow colonial wall |
6: a riverside with wooden boats at sunset}. No text, no recognizable faces up close.
```

---

## Không cần tạo

App tự vẽ bằng code: thanh truyền, tia lửa, đèn pha trong hầm, đường hầm, bảng ga split-flap, khung tem ảnh, vé trúng, nút bấm, grain phim. Ảnh kỷ niệm thật do bạn cung cấp, **không** tạo bằng AI.

## Checklist nghiệm thu

- [ ] Đủ 24 file, đúng tên, đúng kích thước pixel.
- [ ] Thân tàu: ghép thử lên khung bố cục, vùng bánh xe trống, không còn nét đỏ.
- [ ] Bánh xe: tròn đều, đúng tâm, chốt tay quay của bánh lớn ở hướng 3 giờ.
- [ ] Nhóm 3: đặt 2 bản cạnh nhau không thấy đường nối; mặt ray của `track` ở y=20.
- [ ] Nền trong suốt sạch, không viền trắng; không có chữ do AI tự sinh.
