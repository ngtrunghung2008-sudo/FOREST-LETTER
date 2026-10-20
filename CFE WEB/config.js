// =========================================================
// FOREST LETTER — CẤU HÌNH VÀ DỮ LIỆU ĐƠN HÀNG
//
// Khi có đơn mới:
// 1. Tạo mã riêng, ví dụ ELF003.
// 2. Thêm một mục mới vào LETTERS.
// 3. Giữ nguyên toàn bộ các đơn cũ.
// 4. Lưu và deploy lại website.
// =========================================================

export const SETTINGS = {
  // Chế độ website tĩnh, không cần backend.
  storageMode: "static",

  // Số link Spotify tối đa cho mỗi lá thư.
  maxPlaylists: 3,

  // Giới hạn nội dung thư.
  maxBodyLength: 1500,
  maxNameLength: 100,

  // Bật âm thanh tự tạo sau khi khách chủ động chạm.
  soundEnabledByDefault: false,

  // Mã này chỉ dùng để kiểm tra giao diện.
  demoKey: "demo"
};

// =========================================================
// DANH SÁCH THƯ
//
// Mỗi key là mã được đặt trong link NFC.
// Ví dụ: https://tenmiencuaban.com/?k=ELF001
//
// LƯU Ý:
// - Không dùng lại mã của đơn cũ.
// - Không xóa đơn cũ nếu thẻ NFC vẫn đang lưu hành.
// - Đây là dữ liệu phía trình duyệt, KHÔNG phải dữ liệu bí mật.
// =========================================================

export const LETTERS = {
  demo: {
    to: "Gửi người đang đọc những dòng này,",

    body: `Có lẽ trên thế giới rộng lớn này,
điều dịu dàng nhất là biết rằng
ở đâu đó, có một người đang nghĩ về mình.

Mong những ngày phía trước của bạn
luôn có đủ ánh nắng để mỉm cười,
đủ bình yên để nghỉ ngơi,
và đủ yêu thương để tin vào những điều đẹp đẽ.

Nếu một ngày thấy mỏi mệt,
hãy nhớ rằng bạn luôn xứng đáng
với những điều tử tế nhất.`,

    from: "Một người muốn bạn hạnh phúc",

    playlists: []
  },

  ELF001: {
    to: "Gửi em yêu,",

    body: `Cảm ơn em vì đã xuất hiện
và làm những ngày bình thường
của anh trở nên đặc biệt.

Anh mong rằng khi nghe những giai điệu này,
em sẽ nhớ rằng có một người
luôn mong em được vui vẻ,
bình yên và hạnh phúc.

Dù ngày mai có thế nào,
anh vẫn trân trọng những điều
chúng ta đã cùng nhau đi qua.`,

    from: "Người luôn thương em",

    playlists: [
      "https://open.spotify.com/intl-vi/album/1AaxmI2e1HRhbwe9XJGPnT?si=326ed539eae24568"
    ]
  },

  ELF002: {
    to: "Gửi cậu,",

    body: `Tớ không giỏi nói ra những điều
mình thực sự nghĩ trong lòng.

Vậy nên tớ chọn một lá thư,
một khu rừng nhỏ
và vài giai điệu dành riêng cho cậu.

Mong rằng mỗi lần nghe lại,
cậu sẽ nhớ đến những ngày
chúng ta đã cười thật nhiều.

Cảm ơn cậu vì đã ở đây.`,

    from: "Người bạn của cậu",

    playlists: []
  }

  // THÊM ĐƠN MỚI NGAY BÊN DƯỚI:
  //
  // ,
  // ELF003: {
  //   to: "Gửi ...",
  //   body: Nội dung thư của khách...,
  //   from: "...",
  //   playlists: [
  //     "https://open.spotify.com/playlist/ID_PLAYLIST"
  //   ]
  // }
};