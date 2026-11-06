import { timestampToDate, isPublicPost } from "../common/util/post-data.mjs";
import { InputError } from "./post-input.mjs";

export const INDEX_VERSION = 1;
export function indexFields(post, fallback) {
  const date = timestampToDate(post.updatedAt) || timestampToDate(post.createdAt) || timestampToDate(fallback);
  if (!date) throw new InputError("게시물 정렬 날짜가 없습니다.");
  return { listVersion: INDEX_VERSION, visibility: isPublicPost(post) ? "public" : "private", sortAt: date, categoryKey: String(post.category || "기타").trim() || "기타" };
}
export function changeCatalog(catalog, before, after) {
  const next = { version: INDEX_VERSION, total: catalog?.total || 0, public: catalog?.public || 0, categories: { ...catalog?.categories } };
  for (const [post, delta] of [[before, -1], [after, 1]]) {
    if (!post) continue;
    const category = post.categoryKey || String(post.category || "기타").trim() || "기타";
    const key = Buffer.from(category).toString("base64url");
    const entry = { label: category, total: 0, public: 0, ...next.categories[key] };
    entry.total += delta; next.total += delta;
    if (isPublicPost(post)) { entry.public += delta; next.public += delta; }
    if (entry.total <= 0) delete next.categories[key]; else next.categories[key] = entry;
  }
  return next;
}
export function publicCatalog(catalog, includePrivate) {
  const field = includePrivate ? "total" : "public";
  return { total: catalog?.[field] || 0, categories: Object.values(catalog?.categories || {})
    .filter((entry) => entry[field] > 0).map((entry) => ({ name: entry.label, key: entry.label, count: entry[field] }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko")) };
}
export function readPageOptions(params, includePrivate) {
  const size = params.get("limit") || "20";
  if (!/^\d+$/.test(size) || Number(size) < 1 || Number(size) > 50) throw new InputError("목록 크기는 1~50이어야 합니다.");
  const category = params.get("category") || "";
  if (category.length > 80) throw new InputError("잘못된 카테고리입니다.");
  let cursor = null;
  const encoded = params.get("cursor");
  if (encoded) {
    if (encoded.length > 4096) throw new InputError("잘못된 커서입니다.");
    try { cursor = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); } catch { throw new InputError("잘못된 커서입니다."); }
    if (encoded.length > 4096 || cursor?.v !== INDEX_VERSION || cursor.category !== category || cursor.scope !== (includePrivate ? "admin" : "public") || typeof cursor.id !== "string" || !cursor.id || cursor.id.includes("/") || cursor.id.length > 1500 || !Number.isSafeInteger(cursor.seconds) || !Number.isInteger(cursor.nanos) || cursor.nanos < 0 || cursor.nanos > 999999999 || cursor.seconds < -62135596800 || cursor.seconds > 253402300799) throw new InputError("잘못된 커서입니다.");
  }
  return { limit: Number(size), category, cursor, includePrivate };
}
export function encodeCursor(doc, category, includePrivate) {
  const timestamp = doc.data().sortAt;
  return Buffer.from(JSON.stringify({ v: INDEX_VERSION, id: doc.id, seconds: timestamp.seconds ?? timestamp._seconds, nanos: timestamp.nanoseconds ?? timestamp._nanoseconds ?? 0, category, scope: includePrivate ? "admin" : "public" })).toString("base64url");
}
