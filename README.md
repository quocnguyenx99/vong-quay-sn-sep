# Chuyến Tàu Ký Ức — Vòng quay may mắn

App quay số cho sinh nhật Mr. Thiết (30/10/2026). Tài liệu thiết kế nằm trong [docs/](docs/).

## Chạy

| Mục đích | Lệnh |
|---|---|
| Tại sự kiện (offline) | Nhấp đúp `start.bat` → trình duyệt mở `http://localhost:4173` → bấm **Lên tàu** |
| Phát triển | `npm run dev` |
| Chỉ build | `npm run build` (ra thư mục `dist/`) |

Cần Node.js 18 trở lên. Chạy `npm install` một lần khi còn mạng; sau đó app chạy offline hoàn toàn.

## Phím tắt

| Phím | Tác dụng |
|---|---|
| `Space` / `Enter` | Khởi hành · Kéo phanh (chế độ phanh tay) · Tiếp tục |
| `F` | Toàn màn hình |
| `B` | Bảng vinh danh toàn màn hình |
| `M` | Tắt/bật tiếng |
| `S` | Cài đặt (dải số, tiền tố, thời gian chạy/quay, lời chúc, xuất CSV, xoá kết quả) |
| `P` | Hiện FPS |
| `Esc` | Đóng |

## Sau khi clone về máy khác

Repo **không chứa** hai thứ sau (xem `.gitignore`); thiếu thì app vẫn chạy, chỉ khác hiển thị:

1. **Font mã vé Awesome Lathusca**: giấy phép bản demo chỉ cho dùng cá nhân, không được phân phối lại. Tải miễn phí tại [FontSpace](https://www.fontspace.com/awesome-lathusca-font-f83186), rồi đặt file thành `public/fonts/awesome-lathusca.ttf` (hoặc `.woff2`). Thiếu font này thì mã vé hiển thị bằng Cormorant Garamond.
2. **Ảnh kỷ niệm thật** `public/memories/real-*`: chép lại từ máy của bạn.

## Hình ảnh, font, âm thanh

Khi thả hoặc thay file trong `public/`, app tự dùng file đó, không cần sửa code. Sau khi thay file, chạy lại `start.bat`.

**Hình**: 24 file do Codex tạo, đã có trong `public/assets/` và `public/memories/default-*`. Muốn tạo lại thì dán prompt trong [docs/codex-prompt.md](docs/codex-prompt.md) vào Codex; tên và kích thước từng file nằm trong [docs/image-prompts.md](docs/image-prompts.md).
- Nếu ảnh tàu bị lệch so với bánh xe: chỉnh `body` trong [src/scene/train.config.ts](src/scene/train.config.ts).

**Nén ảnh**: toàn bộ ảnh đã được nén sang WebP ở khoảng 2× kích thước hiển thị (10.7MB còn 2.2MB, bằng mắt không thấy khác). Bản gốc nằm trong `output/originals/` (không đưa lên git). Mỗi khi thêm ảnh mới (ảnh kỷ niệm, hoặc Codex tạo lại) thì chạy:
```
python scripts/compress-images.py
```
Cần Pillow: `python -m pip install pillow`.

**Ảnh kỷ niệm thật**: chép vào `public/memories/` và đặt tên `real-01.jpg`, `real-02.jpg`, … `real-12.jpg` (đuôi `.jpg`, `.jpeg`, `.png` hoặc `.webp` đều được), rồi chạy lệnh nén ở trên. Ảnh điện thoại vài MB sẽ còn khoảng 100KB. App tự nhận, không cần khai báo gì thêm.
- Ảnh tên khác thì khai trong `public/memories/memories.json`: `{ "photos": ["anh-cu.jpg"] }`.
- Ít hơn 6 ảnh thật thì app bù bằng `default-01` … `default-06` (Codex tạo). Chưa có ảnh mặc định thì các khung tem lặp lại ảnh thật.

**Font**:
- Tiêu đề tiếng Việt dùng **Cormorant Garamond**, vì bản Awesome Lathusca miễn phí thiếu chữ có dấu tiếng Việt.
- Mã vé (`ILOVEMRTHIET 087`) dùng **Awesome Lathusca**, giống vé mời.
- Nếu có bản Lathusca Việt hoá đầy đủ (hỏi người thiết kế vé), đặt vào `public/fonts/` rồi đổi `--font-display` và `unicode-range` trong [src/styles/tokens.css](src/styles/tokens.css).

**Âm thanh**: đã có sẵn 9 file trong `public/audio/` (nguồn và giấy phép: [public/audio/CREDITS.md](public/audio/CREDITS.md)). Muốn thay file nào thì ghi đè đúng tên `.ogg`. `flap-tick`, `rail-clack-loop`, `paper-tear` đang dùng âm tổng hợp; thêm file cùng tên thì app dùng file đó.

## Dữ liệu

- Kết quả lưu trong trình duyệt (localStorage) sau mỗi lượt; tải lại trang không mất. Số được chọn **ngay khi bấm Khởi hành**, nên reload giữa lượt vẫn ra đúng số đó.
- **Vắng mặt**: số bị loại khỏi các lượt sau, không lên bảng vinh danh, chỉ có trong file CSV với trạng thái "Vắng mặt".
- Dùng cùng một trình duyệt và cùng địa chỉ (`localhost:4173`) để giữ kết quả. Xuất CSV trong Cài đặt để lưu dự phòng.

## Kiểm tra trước giờ G

1. Mở trên đúng laptop và máy chiếu sẽ dùng, bấm `P` khi tàu chạy: nên ≥ 55 fps.
2. Vào Cài đặt → **Xem trước 1 lượt** để thử âm lượng và thời gian (lượt xem trước không được ghi).
3. Kiểm tra dải số và tiền tố vé.
4. Nếu đã chạy thử nhiều lượt thật: Xuất CSV rồi **Xoá kết quả** trước khi bắt đầu.
