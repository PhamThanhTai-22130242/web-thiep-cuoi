/**
 * Mã hóa tên khách mời sang định dạng URL-safe Base64 rút gọn (bỏ padding =).
 */
export function encodeGuestName(name: string): string {
    if (!name) return '';
    try {
        // Encode UTF-8 sang Base64 chuẩn
        const base64 = btoa(unescape(encodeURIComponent(name.trim())));
        // Chuyển sang URL-safe: thay + thành -, / thành _, xóa dấu = ở cuối
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        return name;
    }
}

/**
 * Giải mã chuỗi URL-safe Base64 trở lại tên khách mời UTF-8 gốc.
 * Nếu không phải Base64 hợp lệ, trả về chuỗi gốc (tương thích ngược với link cũ).
 */
export function decodeGuestName(encoded: string): string {
    if (!encoded) return '';
    try {
        // Thay đổi ký tự URL-safe về Base64 chuẩn
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // Thêm lại padding = nếu chiều dài không chia hết cho 4
        while (base64.length % 4) {
            base64 += '=';
        }
        // Decode Base64 về UTF-8
        return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
        // Tương thích ngược: Trả về chuỗi giải mã URI thông thường nếu lỗi
        try {
            return decodeURIComponent(encoded);
        } catch {
            return encoded;
        }
    }
}
