export const MEDIA_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function mediaId(value) {
  if (typeof value !== "string") return null;
  let path = value;
  if (/^https?:/i.test(value)) {
    try { const url = new URL(value); if (url.origin !== "https://chacha-dev.com") return null; path = url.pathname + url.search + url.hash; } catch { return null; }
  }
  const id = path.startsWith("/api/media/") ? path.slice(11) : "";
  return MEDIA_ID.test(id) ? id : null;
}
export function mediaUrl(id) { if (!MEDIA_ID.test(id)) throw new Error("Invalid media ID"); return `/api/media/${id}`; }

export function isAllowedMediaKey(key) {
  return typeof key === "string" && key.length <= 1024 && /^(images|videos|portfolio)\//.test(key)
    && !/[\x00-\x1f\x7f]/.test(key) && key.split("/").every((part) => part && part !== "." && part !== "..");
}
