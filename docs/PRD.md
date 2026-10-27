# PRD — Vòng quay may mắn "Chuyến tàu trở về những ký ức"

| Mục | Nội dung |
|---|---|
| Sự kiện | Sinh nhật Mr. Thiết — 30/10/2026 — Diamond Palace, 15A Hồ Văn Huê, P. Đức Nhuận, TP.HCM |
| Sản phẩm | Web app quay số chạy offline, trình chiếu toàn màn hình |
| Phiên bản | v1.0 (draft) |
| Tài liệu liên quan | [design.md](design.md) · [concepts.md](concepts.md) · [tech-train.md](tech-train.md) · [image-prompts.md](image-prompts.md) |

---

## 1. Bối cảnh & mục tiêu

Mỗi khách mời nhận một vé mời dạng vé tàu mang mã `ILOVEMRTHIET 001`, `002`, … Trong tiệc, MC quay số để chọn các vé may mắn.

**Mục tiêu**
1. Chọn ngẫu nhiên, công bằng, **không trùng** một số vé trong dải cấu hình.
2. Tạo khoảnh khắc hồi hộp, cảm xúc, đồng bộ hoàn toàn với chủ đề vé mời.
3. Vận hành an toàn tại sự kiện: offline, không mất kết quả khi lỡ tải lại trang.

**Không thuộc phạm vi v1**
- Phân hạng giải / cấu hình số lượng giải.
- Nhập danh sách tên khách (bảng chỉ hiện số vé).
- Điều khiển từ điện thoại, online multi-user, backend.

---

## 2. Người dùng

| Vai trò | Nhu cầu |
|---|---|
| **Người điều khiển (MC / trưởng tàu)** | Cấu hình nhanh trước giờ G, bấm 1 phím để quay, không lo lỗi |
| **Khách mời (khán giả)** | Nhìn rõ số từ xa trên máy chiếu, cảm thấy hồi hộp và vui |

---

## 3. Môi trường chạy

- Laptop (Windows/macOS) nối máy chiếu/TV, tỉ lệ **16:9**, độ phân giải mục tiêu 1920×1080 (tối thiểu 1280×720).
- Trình duyệt Chrome/Edge bản mới, chế độ toàn màn hình (F11 hoặc nút trong app).
- **Không cần Internet**: toàn bộ font, ảnh, âm thanh, thư viện đóng gói trong bản build.

---

## 4. Luồng người dùng

```
[Mở app] → (lần đầu) [Cài đặt: dải số, prefix, thời lượng, tiêu đề, lời chúc]
        → [Màn chờ: tàu đỗ ở ga, khói nhẹ, nút KHỞI HÀNH]
        → Bấm KHỞI HÀNH / Space
        → [Quay: tàu chạy qua ký ức → giảm tốc hồi hộp → vào ga → bảng lật khoá số]
        → [Chúc mừng: còi tàu, vé trúng bay ra, confetti, lời chúc]
        → Bấm Tiếp tục / Space → số được ghi vào bảng vinh danh → [Màn chờ]
```

Chi tiết storyboard: xem [concepts.md §Concept đã chọn](concepts.md).

---

## 5. Yêu cầu chức năng

### F1. Cấu hình dải số
- F1.1 Nhập **số bắt đầu** và **số kết thúc** (số nguyên ≥ 0, bắt đầu ≤ kết thúc). Mặc định **001** → 200; số kết thúc cấu hình theo số vé đã phát.
- F1.4 Vé đặc biệt `ILOVENKC` (vé của chủ tiệc, `ve-tau-sn/1.png`) **không tham gia quay**.
- F1.2 Hiển thị **zero-pad** theo độ dài số kết thúc (200 → 3 chữ số: `001`). Cho phép ghi đè số chữ số (VD luôn 3).
- F1.3 Không cho đổi dải khi đã có kết quả, trừ khi reset (có cảnh báo).

### F2. Quay số
- F2.1 Mỗi lượt chọn **1 số** ngẫu nhiên đều trong tập *còn lại* (dải trừ số đã trúng).
- F2.2 Dùng `crypto.getRandomValues` (không dùng `Math.random`), loại bỏ modulo bias.
- F2.3 **Kết quả được quyết định ngay khi bấm** và lưu vào trạng thái "đang quay"; animation chỉ trình diễn để dừng đúng số đó.
- F2.4 Kích hoạt bằng nút KHỞI HÀNH, phím `Space` hoặc `Enter`. Chống bấm đúp trong khi đang quay.
- F2.5 Khi hết số: nút bị khoá, hiện thông báo *"Tất cả hành khách đã lên tàu"*.

### F3. Thời lượng & hồi hộp (cấu hình được)
- F3.1 **Thời gian tàu chạy** (giai đoạn chạy qua ký ức): 3–30s, mặc định 8s.
- F3.2 **Thời gian quay số** (giai đoạn bảng lật + giảm tốc): 2–15s, mặc định 5s.
- F3.3 Animation, âm thanh, tốc độ lật, mật độ khói **co giãn theo thời lượng** đã đặt.
- F3.4 Hồi hộp tăng dần ở cuối: lật từng chữ số khoá lần lượt (trăm → chục → đơn vị), chữ số cuối lật chậm dần, nhịp trống/tim tăng.
- F3.5 Tuỳ chọn **chế độ phanh tay**: bấm lần 2 (Space) để bắt đầu giai đoạn giảm tốc; nếu không bấm, tự phanh sau thời gian chạy tối đa.
- F3.6 Nút **"Xem trước"** trong cài đặt để chạy thử 1 lượt **không ghi kết quả**.

### F4. Công bố kết quả
- F4.1 Bảng ga hiển thị số trúng cỡ cực lớn (≥ 180px ở 1080p).
- F4.2 Còi tàu + vé trúng (layout như vé mời) bay ra giữa màn hình với mã `{prefix} {số}`, ví dụ `ILOVEMRTHIET 087`. Con số là phần nổi bật nhất.
- F4.3 Confetti tông vàng–kem, hạt khói, lời chúc (sửa được).
- F4.4 Nút **"Tiếp tục"** (Space) → đóng màn chúc mừng, ghi vào bảng.
- F4.5 Nút **"Vắng mặt"** trên màn chúc mừng (cần xác nhận 1 lần): số đó **không được ghi lên bảng vinh danh** và **bị loại hẳn khỏi tập còn lại** (không bao giờ quay ra lại). Sau đó app về màn chờ để MC quay lượt mới. Số vắng mặt chỉ được lưu trong nhật ký nội bộ (xuất CSV với trạng thái "Vắng mặt"), không hiển thị trên màn chiếu.

### F5. Bảng vinh danh
- F5.1 Cột: **Lượt (#)** · **Số vé** · **Giờ trúng (HH:mm:ss)**. Chỉ gồm vé trúng hợp lệ; số lượt đánh liên tục, không tính các lượt vắng mặt.
- F5.2 Mới nhất ở trên, hàng mới có hiệu ứng trượt vào + highlight.
- F5.3 Hiển thị bên phải màn chính; có chế độ **toàn màn hình** (phím `B`) để chiếu tổng kết cuối tiệc.
- F5.4 Thanh thông tin: Dải số · Đã trúng · Còn lại (Còn lại = dải − đã trúng − vắng mặt).

### F6. Lưu trữ
- F6.1 Lưu cấu hình + kết quả vào `localStorage` sau mỗi thay đổi.
- F6.2 Tải lại trang → khôi phục đầy đủ. Nếu đang quay dở khi reload: số đã quyết định (F2.3) được ghi nhận, không quay lại.
- F6.3 **Xuất CSV** (Lượt, Số vé, Mã vé, Giờ, Trạng thái: Trúng / Vắng mặt).
- F6.4 **Reset** toàn bộ kết quả: cần xác nhận 2 bước (gõ "RESET").

### F7. Nội dung tuỳ biến
- F7.1 Prefix mã vé (mặc định `ILOVEMRTHIET`).
- F7.2 Tiêu đề chính / phụ (mặc định "TRỞ VỀ NHỮNG KÝ ỨC" / "Tuổi thơ của Mr. Thiết").
- F7.3 Lời chúc mừng (1 câu cố định hoặc danh sách để xoay vòng ngẫu nhiên).
- F7.4 **Ảnh kỷ niệm thật** (dự kiến 6–12 ảnh; app chạy được với bất kỳ số lượng nào, thiếu thì bù bằng ảnh mặc định): đặt file vào `public/memories/` (jpg/webp); app tự đọc từ file `memories.json` hoặc danh sách cố định khi build. Ảnh hiện trong khung tem / các khung cảnh tàu chạy qua, tự phủ tông sepia. *(Upload ảnh trong giao diện: không có ở v1.)*

### F8. Âm thanh
- F8.1 Âm lượng tổng + bật/tắt từng nhóm (tàu, còi, flap, nhạc hồi hộp).
- F8.2 Phím `M` tắt/bật tiếng.
- F8.3 Trình duyệt chặn autoplay → âm thanh được "mở khoá" ở lần bấm đầu tiên (màn bắt đầu có nút "Lên tàu").

### F9. Phím tắt
| Phím | Hành động |
|---|---|
| `Space` / `Enter` | Khởi hành / Phanh / Tiếp tục |
| `F` | Toàn màn hình |
| `B` | Bảng vinh danh toàn màn hình |
| `M` | Tắt tiếng |
| `S` | Mở cài đặt (chỉ khi không quay) |
| `Esc` | Đóng panel / modal |

---

## 6. Yêu cầu phi chức năng

| Mã | Yêu cầu |
|---|---|
| N1 | 60fps ổn định trên laptop phổ thông (iGPU) ở 1080p; không giật khi tàu chạy |
| N2 | Tổng dung lượng bản build ≤ 15MB (ảnh WebP/AVIF, âm thanh OGG/MP3 nén) |
| N3 | Khởi động < 2s từ ổ đĩa local; preload toàn bộ asset trước màn "Lên tàu" |
| N4 | Hoạt động hoàn toàn offline (mở `dist/` qua `npx vite preview` hoặc file server nhỏ; có hướng dẫn) |
| N5 | Tiếng Việt hiển thị đúng dấu ở mọi font |
| N6 | Chữ số trúng đọc rõ từ 15m trên máy chiếu |
| N7 | Không mất dữ liệu khi crash/reload (F6) |

---

## 7. Edge cases

| Tình huống | Xử lý |
|---|---|
| Dải chỉ có 1 số | Vẫn quay, animation rút gọn |
| Bắt đầu > kết thúc / không phải số | Báo lỗi inline, không lưu |
| Dải rất lớn (> 9999) | Bảng lật tự thêm ô chữ số; cảnh báo nếu > 6 chữ số |
| Bấm Space liên tục | Chỉ nhận theo trạng thái máy (state machine), bỏ qua phím thừa |
| Reload giữa lúc quay | Khôi phục, hiển thị thẳng kết quả của lượt đó |
| Tab mất focus khi quay | Animation tiếp tục theo thời gian thực, kết quả không đổi |
| Hết số | Khoá nút, hiện thông báo, gợi ý xem bảng tổng kết |
| Bấm nhầm "Vắng mặt" | Có hộp xác nhận; sau khi xác nhận thì không hoàn tác (tránh thao tác lén sửa kết quả) |
| Ảnh kỷ niệm thiếu/hỏng | Dùng ảnh mặc định do AI tạo |

---

## 8. Tiêu chí nghiệm thu

- [ ] Quay 200 lượt trong dải 001–200: đủ 200 số, không trùng, lượt 201 bị khoá.
- [ ] Reload ở bất kỳ thời điểm nào không làm mất/đổi kết quả.
- [ ] Thay đổi thời lượng 3s và 30s đều cho animation hợp lý, dừng đúng số.
- [ ] Rút dây mạng: app vẫn chạy đầy đủ font, ảnh, âm thanh.
- [ ] Đo DevTools Performance: ≥ 55fps trung bình khi tàu chạy trên laptop chiếu thực tế.
- [ ] Xuất CSV đúng dữ liệu, mở được bằng Excel (UTF-8 BOM, tiếng Việt không lỗi).
- [ ] Bạn duyệt giao diện khớp [design.md](design.md).

---

## 9. Quyết định đã chốt

1. Font: **Roboto** cho chữ thường/nhãn, **Awesome Lathusca** cho tiêu đề & mã vé (chờ bạn gửi file font bản Việt hoá).
2. Nút **Vắng mặt**: có — không lên bảng, loại hẳn khỏi tập quay (F4.5).
3. Ảnh kỷ niệm thật: **6–12 ảnh** (F7.4).
4. Vé `ILOVENKC` **không tham gia quay**; dải quay từ **001** tới số kết thúc cấu hình (F1.1, F1.4).
