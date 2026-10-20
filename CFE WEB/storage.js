
// =========================================================
// FOREST LETTER — BỘ ĐỌC DỮ LIỆU THƯ
// Phiên bản website tĩnh: dữ liệu nằm trong config.js.
// Không cho phép website tự ghi đè hoặc sửa thư của đơn khác.
// =========================================================

import { LETTERS, SETTINGS } from "./config.js";

const VALID_KEY_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Kiểm tra mã NFC trước khi tra cứu.
 * Mã không hợp lệ hoặc không tồn tại sẽ trả về null.
 */
export function getLetter(key) {
  if (typeof key !== "string") {
    return null;
  }

  const normalizedKey = key.trim();

  if (!VALID_KEY_PATTERN.test(normalizedKey)) {
    return null;
  }

  const source = LETTERS[normalizedKey];

  if (!source || typeof source !== "object") {
    return null;
  }

  return normalizeLetter(normalizedKey, source);
}

/**
 * Chỉ nhận dữ liệu có kiểu hợp lệ và cắt độ dài trường.
 * Nội dung được hiển thị bằng textContent ở app.js,
 * không đưa trực tiếp vào HTML.
 */
function normalizeLetter(key, source) {
  const to = normalizeText(
    source.to,
    SETTINGS.maxNameLength
  );

  const from = normalizeText(
    source.from,
    SETTINGS.maxNameLength
  );

  const body = normalizeText(
    source.body,
    SETTINGS.maxBodyLength,
    true
  );

  const rawPlaylists = Array.isArray(source.playlists)
    ? source.playlists
    : [];

  const playlists = rawPlaylists
    .slice(0, SETTINGS.maxPlaylists)
    .filter((url) => typeof url === "string")
    .map((url) => url.trim().slice(0, 2048))
    .filter(Boolean);

  return Object.freeze({
    key,
    to,
    from,
    body,
    playlists: Object.freeze(playlists)
  });
}

/**
 * Chuẩn hóa chuỗi, loại bỏ ký tự điều khiển không cần thiết.
 * Không loại bỏ xuống dòng của nội dung thư.
 */
function normalizeText(value, maxLength, allowNewlines = false) {
  if (typeof value !== "string") {
    return "";
  }

  let result = value
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "");

  if (allowNewlines) {
    result = result.replace(/[^\S\n]+/g, " ");
  } else {
    result = result.replace(/[\r\n\t]+/g, " ");
  }

  return result.trim().slice(0, maxLength);
}
