import "server-only";
import { mediaId } from "@/common/util/media-refs.mjs";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { InputError } from "./post-input.mjs";
import { publicCatalog, readPageOptions, encodeCursor } from "./post-index.mjs";
import { safeHttpUrl } from "@/common/util/security.mjs";
import { cache } from "react";
import { sortPostsByRecent, timestampToDate } from "@/common/util/post-data.mjs";
export { sortPostsByRecent, timestampToDate } from "@/common/util/post-data.mjs";
import { isPublicPost } from "@/common/util/post-data.mjs";
export { isPublicPost } from "@/common/util/post-data.mjs";
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

function sanitizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("data:")) return "";
  return mediaId(url) ? url : safeHttpUrl(url);
}

export function serializePost(post, { includeContent = true } = {}) {
  const image = sanitizeImageUrl(post.image) || sanitizeImageUrl(post.bestImage) || "";
  const serialized = {
    id: post.id,
    title: post.title || "",
    category: post.category || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    published: isPublicPost(post),
    isPrivate: !isPublicPost(post),
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

const SUMMARY_FIELDS = [
  "title", "category", "tags", "published", "isPrivate", "isRecommended", "image", "bestImage",
  "sortAt", "visibility", "categoryKey", "author", "authorId", "createdAt", "updatedAt", "viewCount", "likeCount", "commentCount",
];

export async function getPostPage(params = new URLSearchParams(), includePrivate = false) {
  const options = readPageOptions(params, includePrivate);
  const db = await getDb();
  const state = await db.doc("_system/postIndex").get();
  if (state.data()?.version !== 1 || state.data()?.status !== "ready") throw new InputError("게시물 목록을 준비 중입니다. 잠시 후 다시 시도해주세요.", 503);
  let query = db.collection("posts");
  if (!includePrivate) query = query.where("visibility", "==", "public");
  if (options.category) query = query.where("categoryKey", "==", options.category);
  query = query.orderBy("sortAt", "desc").orderBy(FieldPath.documentId(), "desc");
  if (options.cursor) query = query.startAfter(new Timestamp(options.cursor.seconds, options.cursor.nanos), options.cursor.id);
  const snapshot = await query.select(...SUMMARY_FIELDS).limit(options.limit + 1).get();
  const documents = snapshot.docs.slice(0, options.limit);
  // Defense in depth if an old index field is inconsistent with privacy flags.
  const posts = documents.map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((post) => includePrivate || isPublicPost(post)).map((post) => serializePost(post, { includeContent: false }));
  const catalog = options.cursor ? null : publicCatalog((await db.doc("_system/postCatalog").get()).data(), includePrivate);
  return { posts, nextCursor: snapshot.docs.length > options.limit ? encodeCursor(documents.at(-1), options.category, includePrivate) : null, ...(catalog || {}) };
}

// Full enumeration is reserved for the sitemap; UI requests always use getPostPage.
export async function getPublicPosts() {
  const posts = [];
  const params = new URLSearchParams({ limit: "50" });
  do {
    const page = await getPostPage(params);
    posts.push(...page.posts);
    if (!page.nextCursor) break;
    params.set("cursor", page.nextCursor);
  } while (posts.length < 49000);
  return posts;
}

export const getPostById = cache(async (detailId) => {
  const doc = await (await getDb()).collection("posts").doc(detailId).get();
  if (!doc.exists || !isPublicPost(doc.data())) return null;
  return serializePost({ id: doc.id, ...doc.data() }, { includeContent: true });
});

export async function getPortfolioItems() {
  const snapshot = await (await getDb()).collection("portfolio").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      image: sanitizeImageUrl(data.image) || "",
      type: data.type || "web",
      url: safeHttpUrl(data.url),
      downloadUrl: safeHttpUrl(data.downloadUrl),
      githubUrl: safeHttpUrl(data.githubUrl),
      createdAt: serializeTimestamp(data.createdAt),
      updatedAt: serializeTimestamp(data.updatedAt),
    };
  });
}
