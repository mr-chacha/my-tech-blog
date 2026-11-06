export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"];

export function validateMediaFile(file) {
  if (!MEDIA_TYPES.includes(file.type)) throw new Error("JPG, PNG, GIF, WebP, AVIF, MP4, WebM, MOV 파일만 업로드할 수 있습니다.");
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new Error("파일은 3MB 이하여야 합니다.");
}
