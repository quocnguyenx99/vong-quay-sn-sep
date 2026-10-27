# Prompt giao việc cho Codex: con mộc NKC

**Cách dùng:** mở Codex tại thư mục dự án `quay-so-sn-sep`, rồi dán nguyên khối prompt bên dưới. Codex làm xong thì chạy:
```
python scripts/compress-images.py
```
Sau đó tải lại app. Ảnh mới tự thay cho con mộc tạm đang vẽ bằng code, không cần sửa gì.

Trong lúc chờ, app vẫn hiển thị con mộc tạm. Muốn xem trước kiểu mộc mong muốn thì bấm "Xem trước 1 lượt" trong Cài đặt.

---

```text
Create ONE image asset for a lucky-draw web app themed "Chuyến tàu trở về những ký ức"
(nostalgic 1960s Saigon train journey, brass-and-cream vintage ticket style).
Do not modify anything under src/ or docs/.

WHAT IT IS
A red rubber-stamp seal reading "NKC". In the app it is stamped onto the winner's train ticket
(cream paper) at about 230 px wide, slightly rotated by the app. It must read clearly from the
back of a room on a projector.

OUTPUT
- File: public/assets/ui/stamp-nkc.png
- Exactly 600 x 600 px, PNG with a real alpha channel. Everything that is not ink is fully
  transparent (no paper, no white or cream background, no halo around the ink).
- The seal is centered and its outer ring fills about 94% of the canvas width.
- Draw it upright (not rotated); the app rotates it.

DESIGN
- Round seal, single ink color: vintage stamp red #A8473A (opaque ink, no gradients).
- Outer ring: one thick ring (about 4% of the diameter) with a thin second ring just inside it.
- Between the outer rings and an inner thin ring: a band of small evenly spaced dots or tiny
  stars, like a postal / railway cancellation stamp.
- Center: the letters "NKC" exactly, in capitals, in an elegant high-contrast classic serif
  (Didone / old-style), large and bold: the word spans about 60% of the seal's width.
  Spelling must be exactly N, K, C. No other letters, words, numbers or dates anywhere.
- One small five-pointed star centered above "NKC" and one centered below it.
- Hand-stamped feel: slightly uneven ink density and a few tiny worn specks, edges a little
  rough. Keep it subtle: at least 90% of the ink is solid, and "NKC" stays fully legible.
  No smudges outside the seal.
- Style reference for the overall vintage mood: ve-tau-sn/2.png. The ink color must match
  #A8473A, not the brass of the ticket.

NEGATIVE
no extra text, no misspelling, no Vietnamese text, no dates, no background paper, no white
background, no drop shadow, no 3D, no blur, no gradient, no second color, no rotation.

VERIFY (write and run a small script, then show me its output)
- File exists, size is exactly 600x600, mode RGBA.
- The four corners and the area just outside the outer ring are fully transparent (alpha = 0).
- Opaque pixels are close to #A8473A (report the average color of pixels with alpha > 200).
- Save a preview of the stamp composited on cream #F3EFE8 at 230 px, rotated -12 degrees, to
  docs/reference/stamp-nkc-preview.png so the legibility of "NKC" can be checked by eye.

WHEN DONE
Report the checks and attach the preview. If the letters are not exactly "NKC" or not clearly
legible, regenerate before reporting.
```
