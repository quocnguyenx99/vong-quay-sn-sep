# Prompt giao việc cho Codex: tạo hình ảnh

**Cách dùng:** mở Codex ngay tại thư mục dự án `quay-so-sn-sep`, rồi dán nguyên khối prompt bên dưới. Codex tự đọc các file tham chiếu trong repo, nên bạn không cần đính kèm gì thêm. Nếu Codex hỏi hoặc dừng giữa chừng, nhắn "continue with the next group".

Làm xong, chạy lại `start.bat` để xem trong app. Nếu tàu bị lệch, chụp màn hình gửi Claude để chỉnh `src/scene/train.config.ts`.

---

```text
You are producing the image assets for a lucky-draw web app themed "Chuyến tàu trở về những ký ức"
(a nostalgic train journey). The code is already finished and loads images by exact file name;
your only job is to create the image files. Do not modify anything under src/ or docs/.

READ FIRST
1. docs/image-prompts.md  -> the authoritative list: 24 files, exact paths, exact pixel sizes,
   the STYLE BASE and NEGATIVE text, and a prompt for every file.
2. docs/design.md         -> palette and visual rules.
3. ve-tau-sn/2.png        -> the style reference (brass engraving on cream paper). Look at it.
4. docs/reference/layout-loco.png, layout-tender.png, layout-carriage.png
   -> composition guides for the three train bodies, already at the final pixel size.

HOW TO WORK
- Work group by group in this order: 1 (train), 2 (smoke), 3 (scenery), 4 (paper + punch),
  5 (default memory photos). Finish and verify a group before starting the next.
- For every image: STYLE BASE + the file's prompt + NEGATIVE, exactly as written in
  docs/image-prompts.md. Pass ve-tau-sn/2.png as the style reference image.
- Train bodies (1.1, 1.4, 1.5): use the matching layout PNG as the input/reference image and
  redraw on top of it. Keep the composition: same part positions, same proportions. The red
  dashed circles are wheel slots and must end up EMPTY and transparent. The red line is the rail.
  The final image must contain no red at all.
- Generate at whatever size the image model supports, then post-process with a script
  (Python + Pillow is fine; install it if missing) to reach the EXACT size in the table:
  resize, crop or pad. Never distort the aspect ratio of the drawing itself.
- "Transparent" means a real PNG alpha channel with clean edges and no white halo. If the model
  cannot output alpha, generate on a flat plain background and remove it with a script.
- Train bodies: the inside of the body is solid cream #F3EFE8 (opaque); everything outside the
  silhouette, and the wheel slots, are transparent.
- Wheels (1.2, 1.3, 1.6): flat, perfectly centered circles touching the canvas edges. On the big
  driving wheel the crank pin is at 3 o'clock and the counterweight at 9 o'clock.
- Scenery (group 3): each strip must tile seamlessly left-to-right. After generating, make the
  tile seamless with a script if needed (e.g. offset by half the width and blend the seam).
  In bg/track.png the top surface of the rail must sit at exactly y = 20 px.
- Keep one consistent line weight and the same brass colors across all files.
- File locations: everything goes under public/assets/ except the six default memory photos,
  which go to public/memories/default-01.jpg ... default-06.jpg.

VERIFY (write and run a small script, then show me its output)
- All 24 files exist at the exact paths with the exact pixel sizes.
- PNGs that must be transparent really have alpha (corners fully transparent).
- Train bodies: no pixel with strong red (R > 180, G < 90, B < 90) remains; the wheel-slot
  circles from the layout guides are transparent in the output.
- Group 3: place each tile next to a copy of itself and save the pair to
  docs/reference/check-seams/<name>.png so the seam can be inspected; fix any visible seam.
- Save a contact sheet of all 24 images to docs/reference/asset-contact-sheet.png.

WHEN DONE
Report a table: file, size, transparent yes/no, notes. Report any file you could not get right
and why. Do not claim a file passes a check you did not run.
```
