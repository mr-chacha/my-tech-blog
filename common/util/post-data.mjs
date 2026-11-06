export function isPublicPost(post) {
  return Boolean(post && post.published !== false && post.isPrivate !== true);
}

export function timestampToDate(value) {
  if (value == null) return null;
  let date;
  if (typeof value.toDate === "function") date = value.toDate();
  else if (typeof value === "object" && (value._seconds ?? value.seconds) != null) {
    date = new Date((value._seconds ?? value.seconds) * 1000);
  } else if (value instanceof Date || typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  }
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function sortPostsByRecent(posts) {
  const time = (post) => (timestampToDate(post.updatedAt) || timestampToDate(post.createdAt))?.getTime() || 0;
  return [...posts].sort((a, b) => time(b) - time(a));
}

export function formatPostDate(value, compact = false) {
  const date = timestampToDate(value);
  if (!date) return "날짜 없음";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type).value;
  return compact ? `${part("year")}-${part("month")}-${part("day")}`
    : `${part("year")}년 ${part("month")}월 ${part("day")}일`;
}
