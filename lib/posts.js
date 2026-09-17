import { getDb } from "@/lib/firebase-admin";

export const BASE_URL = "https://chacha-dev.com";
export const DEFAULT_IMAGE = `${BASE_URL}/chacha-dev.png`;

export function serializeTimestamp(ts) {
  if (!ts) return null;
  if (typeof ts === "object" && ts._seconds != null) {
    return { _seconds: ts._seconds, _nanoseconds: ts._nanoseconds || 0 };
  }
  if (typeof ts === "object" && ts.seconds != null) {
    return { _seconds: ts.seconds, _nanoseconds: ts.nanoseconds || 0 };
  }
  if (typeof ts?.toDate === "function") {
    const date = ts.toDate();
    return { _seconds: Math.floor(date.getTime() / 1000), _nanoseconds: 0 };
  }
  if (ts instanceof Date) {
    return { _seconds: Math.floor(ts.getTime() / 1000), _nanoseconds: 0 };
  }
  if (typeof ts === "string" || typeof ts === "number") {
    const date = new Date(ts);
    if (!Number.isNaN(date.getTime())) {
      return { _seconds: Math.floor(date.getTime() / 1000), _nanoseconds: 0 };
    }
  }
  return null;
}

export function timestampToDate(ts) {
  const serialized = serializeTimestamp(ts);
  if (!serialized) return null;
  return new Date(serialized._seconds * 1000);
}

export function getPostSortTime(post) {
  const updated = timestampToDate(post.updatedAt);
  if (updated) return updated.getTime();
  const created = timestampToDate(post.createdAt);
  if (created) return created.getTime();
  return 0;
}

export function sortPostsByRecent(posts) {
  return [...posts].sort((a, b) => getPostSortTime(b) - getPostSortTime(a));
}

function sanitizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("data:")) return "";
  return url;
}

export function serializePost(post, { includeContent = true } = {}) {
  const image = sanitizeImageUrl(post.image) || sanitizeImageUrl(post.bestImage) || "";
  const serialized = {
    id: post.id,
    title: post.title || "",
    category: post.category || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    published: post.published !== false,
    isPrivate: !!post.isPrivate,
    isRecommended: !!post.isRecommended,
    image,
    bestImage: sanitizeImageUrl(post.bestImage) || image,
    author: post.author || "",
    authorId: post.authorId || "",
    createdAt: serializeTimestamp(post.createdAt),
    updatedAt: serializeTimestamp(post.updatedAt),
    viewCount: post.viewCount || 0,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
  };

  if (includeContent) {
    serialized.content = post.content || "";
    serialized.file = Array.isArray(post.file) ? post.file : [];
  }

  return serialized;
}

export function truncateDescription(text, max = 160) {
  if (!text) return "";
  const plain = String(text)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*`_~>|-]/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 3)}...`;
}

export function isPublicPost(post) {
  return post?.published !== false;
}

export async function getPublicPosts({ includeContent = false } = {}) {
  const snapshot = await getDb().collection("posts").orderBy("createdAt", "desc").get();
  const posts = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter(isPublicPost)
    .map((post) => serializePost(post, { includeContent }));

  return sortPostsByRecent(posts);
}

export async function getPostById(detailId) {
  const doc = await getDb().collection("posts").doc(detailId).get();
  if (!doc.exists) return null;
  return serializePost({ id: doc.id, ...doc.data() }, { includeContent: true });
}

export async function getPortfolioItems() {
  const snapshot = await getDb().collection("portfolio").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      image: sanitizeImageUrl(data.image) || "",
      type: data.type || "web",
      url: data.url || "",
      downloadUrl: data.downloadUrl || "",
      githubUrl: data.githubUrl || "",
      createdAt: serializeTimestamp(data.createdAt),
      updatedAt: serializeTimestamp(data.updatedAt),
    };
  });
}
