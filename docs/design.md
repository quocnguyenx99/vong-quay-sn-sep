# Design System — "Chuyến tàu trở về những ký ức"

> Vòng quay may mắn sinh nhật Mr. Thiết · 30/10/2026 · Diamond Palace
> Nguồn style: vé mời trong `ve-tau-sn/1.png`, `2.png`, `3.png`

---

## 1. Tinh thần thiết kế

| Từ khoá | Diễn giải |
|---|---|
| **Hoài niệm** | Sài Gòn những năm 60–70, phim màu bạc, giấy cũ ngả vàng |
| **Ấm áp, nhẹ nhàng** | Không chói, không neon. Tông kem – vàng đồng – nâu |
| **Cơ khí cổ điển** | Bánh răng, cần gạt, bảng lật chữ, máy bấm vé — mọi chuyển động có "trọng lượng" |
| **Chân thành** | Giọng văn thân mật, như một lá thư gửi bản thân ngày ấy |

Nguyên tắc: **ít màu, nhiều chất liệu**. Cảm giác "cổ" đến từ texture giấy, nét khắc, grain phim và chuyển động chậm có quán tính — không đến từ việc thêm nhiều màu.

---

## 2. Bảng màu (Design tokens)

Lấy mẫu trực tiếp từ vé mời.

| Token | Hex | Dùng cho | Nguồn trên vé |
|---|---|---|---|
| `--paper` | `#F3EFE8` | Nền chính, mặt vé | Nền vé |
| `--paper-shade` | `#EDE4DA` | Ô nhãn, hàng bảng, card phụ | Ô "Địa điểm" |
| `--brass` | `#D6B47E` | Viền, khung, minh hoạ đầu máy, đường chấm | Viền vé, hình tàu |
| `--brass-deep` | `#B8925A` | Hover/active, viền đậm, bóng | (suy ra, tối hơn brass ~15%) |
| `--brass-light` | `#E8D3AC` | Highlight, ánh kim | (suy ra) |
| `--ink` | `#6B5A45` | Chữ chính, tiêu đề | Chữ "CHUYẾN TÀU" |
| `--ink-soft` | `#8A7A66` | Chữ phụ, nhãn TO/FROM | Nhãn nhỏ |
| `--ink-faint` | `#B5A893` | Placeholder, disabled | (suy ra) |
| `--night` | `#2B2520` | Nền bảng ga split-flap, đường hầm | (thêm mới — để số nổi bật trên máy chiếu) |
| `--flap-text` | `#F3E6C8` | Chữ số trên bảng lật | (thêm mới) |
| `--signal-red` | `#A8473A` | Điểm nhấn hiếm: dấu bấm lỗ, đèn tín hiệu, tem "ĐÃ TRÚNG" | (thêm mới, dùng < 3% diện tích) |
| `--photo-tint` | `#C9B48A` @ 25% multiply | Phủ lên ảnh kỷ niệm để đồng tông | Ảnh tem Sài Gòn |

```css
:root {
  --paper: #F3EFE8;  --paper-shade: #EDE4DA;
  --brass: #D6B47E;  --brass-deep: #B8925A;  --brass-light: #E8D3AC;
  --ink: #6B5A45;    --ink-soft: #8A7A66;    --ink-faint: #B5A893;
  --night: #2B2520;  --flap-text: #F3E6C8;   --signal-red: #A8473A;
}
```

**Quy tắc tương phản cho máy chiếu:** máy chiếu làm nhạt màu. Con số trúng **luôn** hiển thị ở một trong hai cặp có tương phản cao: `--flap-text` trên `--night` (bảng lật) hoặc `--ink` đậm trên `--paper` ở cỡ rất lớn. Không đặt số trên `--brass`.

---

## 3. Typography

Vé dùng 3 vai trò chữ:

| Vai trò | Trên vé | Đặc điểm | Dùng trong app |
|---|---|---|---|
| **Display** | "TRỞ VỀ NHỮNG KÝ ỨC", "ILOVEMRTHIET 001" | Serif/deco mảnh, cao, nét tương phản nhẹ, in hoa | Tiêu đề, mã vé trúng, tên ga |
| **Label** | "CHUYẾN TÀU", "TO / FROM / DATE" | Sans in hoa, letter-spacing rộng | Nhãn, nút, tiêu đề cột bảng |
| **Body** | Đoạn lời nhắn | Sans nghiêng, nhẹ | Lời chúc, chú thích |

Đã chốt: dùng đúng các font của vé.

| Vai trò | Font | Ghi chú |
|---|---|---|
| Display | **Cormorant Garamond** 500, in hoa | Bản Awesome Lathusca miễn phí (demo) thiếu 88/134 chữ có dấu tiếng Việt và thay một số ký tự bằng ô giữ chỗ, nên tiêu đề dùng font serif mảnh gần nhất có đủ tiếng Việt. Khi có bản Lathusca Việt hoá đầy đủ thì đổi lại `--font-display`. |
| Label | **Roboto** 500–700, uppercase, `letter-spacing: .12em` | "CHUYẾN TÀU", TO/FROM/DATE |
| Body | **Roboto** 400 italic | Lời chúc, chú thích |
| Mã vé trúng | **Awesome Lathusca** (demo, chỉ chữ cái và số không dấu) | Giống "ILOVEMRTHIET 001" trên vé |
| Số bảng lật | **Roboto Condensed** 700 (fallback Roboto 700) | Số cao, đều nét, đọc xa tốt trên máy chiếu |

Font **đóng gói local** (`@fontsource/roboto`, `@fontsource/roboto-condensed`, `@fontsource/cormorant-garamond` + `public/fonts/awesome-lathusca.woff2`) để chạy offline. Thiếu file Lathusca thì mã vé dùng Cormorant Garamond.

**Thang cỡ chữ** (màn 1920×1080, dùng `clamp()` theo `vw`):

| Token | Cỡ | Dùng |
|---|---|---|
| `--fs-hero` | 220px | Số trúng trên bảng lật |
| `--fs-display` | 72px | Tiêu đề màn chính |
| `--fs-title` | 40px | Mã vé trên vé trúng, tên ga |
| `--fs-label` | 20px | Nhãn, nút |
| `--fs-body` | 22px | Lời chúc |
| `--fs-table` | 28px | Hàng bảng vinh danh (đọc được từ cuối phòng) |

---

## 4. Hoạ tiết & chất liệu (motif)

Lấy từ vé — đây là "chữ ký" thị giác của app:

1. **Viền răng cưa bán nguyệt** — mép ngoài vé có các vết khuyết tròn đều. Dùng cho: khung vé trúng, card bảng vinh danh. Thực hiện bằng CSS `mask` với `radial-gradient` lặp.
2. **Lỗ bấm vé** — hai nửa hình tròn lớn ở trên/dưới đường xé. Dùng khi tách cuống vé trúng.
3. **Đường chấm bi dọc** — chấm tròn màu `--brass`, khoảng cách đều. Dùng làm vạch phân cách, đường xé.
4. **Tem bưu chính răng cưa** — khung ảnh có mép răng cưa tròn. Dùng cho ảnh kỷ niệm thật.
5. **Nét khắc (engraving)** — minh hoạ đầu máy hơi nước một màu `--brass`, nét gạch song song tạo khối. Mọi minh hoạ trong app theo đúng kỹ thuật này.
6. **Ô nhãn nền be** — chữ nhãn trái + nội dung đậm phải, nền `--paper-shade`. Dùng cho thanh thông tin (Dải số, Lượt, Còn lại).

**Chất liệu toàn màn hình:**
- Texture giấy (overlay `multiply`, opacity 0.35).
- Grain phim động (canvas/noise nhỏ, opacity 0.06, đổi frame 12fps).
- Vignette nâu ở góc (`radial-gradient` → `#2B2520` 25%).
- Không dùng bóng đổ hiện đại mềm lớn; bóng ngắn, ấm (`0 2px 0 var(--brass-deep)`) như in ấn.

---

## 5. Bố cục màn hình chính (16:9)

```
┌──────────────────────────────────────────────────────────────────────┐
│  CHUYẾN TÀU                                       [⚙]  [⛶]           │
│  TRỞ VỀ NHỮNG KÝ ỨC          ┌───────── BẢNG GA ─────────┐ ┌───────┐ │
│  Tuổi thơ của Mr. Thiết      │ CHUYẾN   VÉ SỐ           │ │VINH   │ │
│                              │  #07    [0][8][7]        │ │DANH   │ │
│                              └──────────────────────────┘ │#1 087 │ │
│  ░░ cảnh nền ga / ký ức (parallax) ░░░░░░░░░░░░░░░░░░░░░░ │#2 142 │ │
│     ~~☁☁☁                                                 │ ...   │ │
│   ▄████▄▄[toa][toa][toa]                                  │       │ │
│  ═╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══╪══  └───────┘ │
│  [Địa điểm: Dải số 001–200 · Còn lại 186]      ( KHỞI HÀNH ▶ )        │
└──────────────────────────────────────────────────────────────────────┘
```

- Vùng an toàn: 5% mỗi cạnh (máy chiếu có thể cắt viền).
- Bảng vinh danh có thể thu gọn khi đang quay để sân khấu cho tàu.

---

## 6. Component

| Component | Mô tả |
|---|---|
| **Bảng ga split-flap** | Nền `--night`, khung viền đồng có đinh tán; mỗi chữ số là 1 ô flap 2 nửa, khe giữa tối; chữ `--flap-text`. Đèn tròn nhỏ báo trạng thái (vàng: đang chạy, đỏ: dừng). |
| **Nút KHỞI HÀNH** | Hình bầu dục như biển đồng, viền `--brass-deep`, chữ label; khi bấm lún xuống 2px + tiếng "cạch". Phím tắt `Space`/`Enter`. |
| **Cần phanh** (tuỳ chế độ) | Cần gạt đồng xoay 30° khi bấm. |
| **Vé trúng** | Tái hiện đúng layout vé mời: bên trái "CHUYẾN TÀU – SỐ VÉ", bên phải cuống có mã `ILOVEMRTHIET 087`; được "bấm lỗ" (dấu đỏ `--signal-red`) khi xác nhận. |
| **Bảng vinh danh** | Card viền răng cưa, tiêu đề "HÀNH KHÁCH MAY MẮN"; cột: Lượt · Số vé · Giờ trúng; hàng mới trượt vào từ trên + highlight `--brass-light` 2s. |
| **Thanh thông tin** | Ô nhãn nền be: Dải số · Đã quay · Còn lại. |
| **Tem ảnh kỷ niệm** | Khung tem răng cưa, ảnh phủ `--photo-tint`. |
| **Panel Cài đặt** | Trượt từ phải, phong cách "sổ ghi chép của trưởng tàu": dải số, prefix, thời lượng, tiêu đề, lời chúc, âm lượng, reset. |

---

## 7. Chuyển động (Motion)

| Nguyên tắc | Giá trị |
|---|---|
| Quán tính cơ khí | Khởi hành: `power2.in`; phanh: `power3.out` / `expo.out`; không dùng `elastic` lố |
| Nhịp | Chuyển cảnh UI 400–600ms; vé bay ra 900ms; hàng bảng trượt 500ms |
| Rung | Khi tàu chạy: thân tàu nảy ±1.5px tần số theo tốc độ; khi dừng có 1 cú giật nhẹ ra trước rồi về |
| Lật flap | 60–90ms/flap khi nhanh → giãn dần 300–500ms ở cuối |
| Giảm chuyển động | Tôn trọng `prefers-reduced-motion`: bỏ rung, giảm hạt khói |

---

## 8. Âm thanh (sound design)

| Sự kiện | Âm thanh | Ghi chú |
|---|---|---|
| Bấm KHỞI HÀNH | "cạch" cần gạt + chuông ga | Ngắn |
| Khởi hành | Xả hơi "xì" + "xình xịch" tăng dần | Loop, `rate` tăng theo tốc độ tàu |
| Đang chạy | Bánh xe lăn ray "cạch-cạch" | Loop, đồng bộ tốc độ |
| Giảm tốc | Tiếng phanh rít + nhịp tim/trống hồi hộp | Tăng dần |
| Lật số | "lạch cạch" flap | Mỗi lần lật 1 tick nhỏ (pool âm thanh) |
| Ra số | **Còi tàu dài** + xả hơi | Khoảnh khắc chính |
| Chúc mừng | Tiếng vỗ tay/kèn nhẹ (tuỳ chọn) | Có thể tắt |

Âm lượng tổng chỉnh được; có nút tắt tiếng nhanh (`M`).

---

## 9. Giọng văn (copywriting)

- Xưng hô thân mật, giàu hình ảnh tàu – ga – vé: *"Chuyến tàu số 7 đã cập ga"*, *"Xin chúc mừng hành khách mang vé số 087"*.
- Từ vựng: Khởi hành, Sân ga Ký Ức, Hành khách may mắn, Cuống vé, Trưởng tàu (người điều khiển).
- Lời chúc mặc định (sửa được): *"Bạn hãy cứ cất kỹ tấm vé của tháng năm này nhé, vì không có người soát vé trên chuyến đi đặc biệt này."* (trích từ vé).

---

## 10. Không làm

- Không gradient neon, không glassmorphism, không bo góc tròn hiện đại lớn.
- Không quá 1 điểm nhấn đỏ trên một màn hình.
- Không dùng ảnh màu rực chưa qua phủ tông.
- Không chữ số nhỏ hơn 180px cho số trúng trên màn chiếu.
