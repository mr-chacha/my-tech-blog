import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import { mediaId } from "../common/util/media-refs.mjs";
import { isPublicPost } from "../common/util/post-data.mjs";
import { InputError } from "./post-input.mjs";

export function resourceMediaUrls(data) {
  const urls = [data.image, data.bestImage, ...(data.file || []).map((file) => file.url)].filter(Boolean);
  if (data.content) {
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw);
    const tree = processor.runSync(processor.parse(data.content));
    const walk = (node) => {
      if (node.type === "element" && ["img", "source", "video", "audio"].includes(node.tagName)) {
        if (node.properties?.src) urls.push(String(node.properties.src));
        if (node.properties?.poster) urls.push(String(node.properties.poster));
      }
      if (node.type === "element" && node.tagName === "a" && mediaId(node.properties?.href)) urls.push(String(node.properties.href));
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  }
  return [...new Set(urls)];
}
export function resourceMedia(data, type = "posts") {
  const urls = resourceMediaUrls(data);
  if (type === "posts" && !isPublicPost(data) && urls.some((url) => !mediaId(url))) {
    throw new InputError("비공개 글의 첨부는 파일 업로드로 등록해주세요. 기존 외부 이미지는 먼저 이전해야 합니다.");
  }
  return [...new Set(urls.map(mediaId).filter(Boolean))];
}

// user must be a verified administrator from verifyMediaUser, never arbitrary client state.
export function canReadMedia(record, resource, user) {
  if (!record || record.deleting) return false;
  if (!record.resourceId) return Boolean(user?.uid && record.ownerUid === user.uid);
  if (!resource) return false;
  if (record.resourceType === "portfolio") return true;
  return record.resourceType === "posts" && (isPublicPost(resource) || Boolean(user?.uid));
}
