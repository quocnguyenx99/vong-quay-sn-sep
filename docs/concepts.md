# Ý tưởng vòng quay — "Chuyến tàu trở về những ký ức"

Bốn hướng ý tưởng, mỗi hướng đều có con tàu là nhân vật chính. Bạn đã chọn **A + B**; phần cuối là storyboard chi tiết cho concept này.

---

## A. Đoàn tàu ký ức (reel ngang)

**Ý tưởng:** Mỗi toa tàu là một "hành khách". Đoàn tàu dài vô tận chạy ngang qua sân ga, trên cửa sổ mỗi toa in một số vé. Tàu giảm tốc, toa trúng dừng đúng dưới biển "SÂN GA KÝ ỨC".

- **Điểm mạnh:** trực quan như vòng quay slot nhưng là tàu thật; khán giả thấy các số lướt qua → hồi hộp.
- **Điểm yếu:** 200 toa → phải tái sử dụng toa (virtual list), số lướt nhanh khó đọc.
- **Độ nặng:** nhẹ (5–7 toa DOM/canvas tái dùng).

## B. Bảng ga lật chữ (split-flap Solari)

**Ý tưởng:** Bảng giờ tàu cơ khí trong nhà ga xưa. Khi tàu đến, các ô số lật lạch cạch rồi khoá từng chữ số.

- **Điểm mạnh:** số **cực rõ** trên máy chiếu; âm thanh lạch cạch rất "đã"; kiểm soát hồi hộp theo từng chữ số.
- **Điểm yếu:** riêng nó thiếu con tàu → cần ghép với A/D.
- **Độ nặng:** rất nhẹ (CSS 3D transform).

## C. Bánh xe đầu máy

**Ý tưởng:** Vòng quay truyền thống, nhưng chính là bánh dẫn động khổng lồ của đầu máy hơi nước: nan hoa đồng, thanh truyền nối piston đẩy bánh quay; số in quanh vành; kim chỉ là cột tín hiệu semaphore hạ cờ khi dừng.

- **Điểm mạnh:** quen thuộc với khán giả "vòng quay may mắn".
- **Điểm yếu:** 200 ô trên vành → chữ rất nhỏ, không đọc được trên máy chiếu; phải dùng vòng quay nhiều tầng (trăm/chục/đơn vị) → kém tự nhiên.
- **Độ nặng:** nhẹ.

## D. Đường hầm thời gian + máy in vé

**Ý tưởng:** Tàu lao vào đường hầm, hai bên là khung ảnh Sài Gòn xưa và ảnh kỷ niệm thật lướt qua (parallax). Ra khỏi hầm, máy bấm vé đồng hồ (odometer 3 trống) quay rồi dừng, "in" ra cuống vé `ILOVEMRTHIET 087` bị bấm lỗ.

- **Điểm mạnh:** giàu cảm xúc nhất — đưa ảnh kỷ niệm thật vào rất tự nhiên.
- **Điểm yếu:** nhiều asset hơn; odometer kém kịch tính hơn bảng lật.
- **Độ nặng:** trung bình (parallax nhiều lớp ảnh).

## So sánh nhanh

| | A Reel toa | B Split-flap | C Bánh xe | D Hầm + in vé |
|---|---|---|---|---|
| Độ rõ số trên máy chiếu | ★★★ | ★★★★★ | ★★ | ★★★★ |
| Hồi hộp | ★★★★ | ★★★★ | ★★★ | ★★★ |
| Cảm xúc hoài niệm | ★★★ | ★★★ | ★★ | ★★★★★ |
| Độ khác lạ | ★★★★ | ★★★ | ★★ | ★★★★ |
| Nhẹ / dễ làm | ★★★★ | ★★★★★ | ★★★★ | ★★★ |

---

## ✅ Concept đã chọn: A + B — "Tàu về Sân Ga Ký Ức"

Kết hợp con tàu chạy (A) + bảng lật số (B), mượn thêm từ D: **cảnh nền là các khung ảnh kỷ niệm lướt qua** và **vé trúng được bấm lỗ**.

### Bố cục sân khấu
- Trên: **bảng ga split-flap** treo dưới mái vòm nhà ga (CHUYẾN #n · VÉ SỐ [_][_][_]).
- Giữa: **đường ray ngang** chiếm 1/3 dưới màn hình; tàu chạy từ trái sang phải.
- Nền: 3 lớp parallax — (xa) bầu trời/phố Sài Gòn xưa nét khắc, (giữa) cột đèn, cột điện, khung ảnh kỷ niệm dạng tem/biển quảng cáo, (gần) hàng rào, cỏ, cột km.
- Phải: bảng vinh danh.

### Storyboard (thời lượng mặc định: chạy 8s + quay số 5s ≈ 15s/lượt)

| # | Giai đoạn | Thời lượng | Hình ảnh | Âm thanh |
|---|---|---|---|---|
| 0 | **Chờ** | ∞ | Tàu đỗ bên trái, khói bốc lững lờ, đèn ga nhấp nháy nhẹ, bảng hiện `- - -`, nút KHỞI HÀNH thở nhẹ | Tiếng gió ga, chim (rất nhỏ) |
| 1 | **Khởi hành** | ~1.2s | Cần gạt kéo, chuông ga, xả hơi trắng phụt dưới bánh, bánh xe quay trượt rồi bám ray, tàu nhích đi | "cạch" + chuông + "xì" + xình xịch bắt đầu |
| 2 | **Chạy qua ký ức** | `T_run` (cấu hình) | Camera theo tàu: tàu giữ gần giữa màn hình, nền parallax trượt ngược; ảnh kỷ niệm lướt qua; khói dày theo tốc độ; thân tàu rung; **bảng ga lật hỗn loạn liên tục** (số ngẫu nhiên) | Xình xịch + ray "cạch-cạch" tăng tốc, nhạc hồi hộp nhỏ |
| 3 | **Phanh & hồi hộp** | `T_draw` (cấu hình) | Nền chậm dần, tia lửa nhỏ ở bánh, khói tạt ra trước. Bảng ga **khoá chữ số hàng trăm** (40% `T_draw`) → **hàng chục** (70%) → **hàng đơn vị** lật chậm dần, nhảy qua 2–3 số "suýt trúng" rồi dừng (100%) | Phanh rít, nhịp trống tăng; mỗi flap 1 tick |
| 4 | **Cập ga** | ~1s | Tàu khựng lại đúng vị trí, giật nhẹ; toa hành khách dừng ngay dưới bảng ga; đèn ga chuyển đỏ → vàng | **Còi tàu dài** + xả hơi lớn |
| 5 | **Chúc mừng** | đến khi bấm | Màn tối nhẹ; **vé trúng** bay ra từ cửa toa, xoay vào giữa, phóng to: `CHUYẾN TÀU · SỐ VÉ 087 · ILOVEMRTHIET 087`; máy bấm lỗ "bấm" dấu đỏ; confetti vàng–kem + khói; lời chúc chạy chữ | Tiếng bấm vé, vỗ tay/kèn nhẹ |
| 5b | **Vắng mặt** (nếu MC bấm) | ~0.8s | Vé bị gạch xám, xé đôi rơi xuống; không ghi vào bảng, số bị loại; tàu rời ga, về màn chờ | Tiếng xé giấy nhẹ |
| 6 | **Ghi sổ** | ~0.6s | Vé thu nhỏ bay vào bảng vinh danh thành hàng mới (highlight); tàu chạy ra khỏi màn hình bên phải, một đoàn tàu mới lùi về vị trí chờ | Tiếng tàu đi xa |

**Co giãn theo cấu hình:** tốc độ tối đa và độ dài parallax ∝ `T_run`; số lần lật flap ∝ `T_draw`; nếu `T_run` ngắn (<4s) bỏ bớt ảnh kỷ niệm; nếu dài (>15s) thêm "cảnh" (cầu sắt, đường hầm tối 1.5s rồi bừng sáng).

**Chế độ phanh tay (tuỳ chọn):** giai đoạn 2 lặp vô hạn cho tới khi MC bấm Space → vào giai đoạn 3.

### Những chi tiết tạo "độc lạ"
- **Hiệu ứng đường hầm** giữa giai đoạn 2: màn tối, chỉ còn đèn pha tàu + bảng ga phát sáng → ra khỏi hầm, ảnh kỷ niệm hiện ra như hồi ức.
- **Chuyển màu thời gian:** cảnh nền ngả dần từ sepia → màu phim cũ khi tàu càng "đi về quá khứ".
- **Hơi thở của tàu ở trạng thái chờ:** khói bốc nhịp chậm như đang chờ hành khách.
- **Số "suýt trúng"** ở chữ số cuối tạo tiếng "ồ" từ khán giả.
- **Mã vé xuất hiện đúng font và layout vé mời** — khách cầm vé so được ngay.
