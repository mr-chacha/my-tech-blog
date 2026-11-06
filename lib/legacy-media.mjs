import { resourceMediaUrls } from "./media-policy.mjs";
export function legacyKey(value, bucket, region = "ap-northeast-2") {
  if (typeof value !== "string" || /(?:^|\/)(?:\.|%2e){1,2}(?:\/|%2f|$)/i.test(value.split(/[?#]/, 1)[0])) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    let key;
    if ([`${bucket}.s3.${region}.amazonaws.com`, `${bucket}.s3-${region}.amazonaws.com`, `${bucket}.s3.amazonaws.com`].includes(url.hostname)) key = decodeURIComponent(url.pathname.slice(1));
    else if ([`s3.${region}.amazonaws.com`, `s3-${region}.amazonaws.com`, "s3.amazonaws.com"].includes(url.hostname) && url.pathname.startsWith(`/${bucket}/`)) key = decodeURIComponent(url.pathname.slice(bucket.length + 2));
    if (!key || key.split("/").some((part) => part === ".." || part === ".") || /[\x00-\x1f]/.test(key)) return null;
    return key;
  } catch { return null; }
}
export function legacyRefs(data, bucket, region) {
  const urls = [...resourceMediaUrls(data), ...(data.content?.match(/https?:\/\/[^\s"'<>)[\]]+/g) || [])];
  return [...new Set(urls)].map((url) => ({ url, key: legacyKey(url, bucket, region) })).filter((item) => item.key);
}
export function rewriteMedia(data, replacements) {
  const fields = {};
  for (const key of ["content", "image", "bestImage"]) {
    if (typeof data[key] === "string") fields[key] = [...replacements].reduce((text, [from, item]) => text.split(from).join(item.url), data[key]);
  }
  if (Array.isArray(data.file)) fields.file = data.file.map((file) => replacements.has(file.url) ? { ...file, url: replacements.get(file.url).url, path: replacements.get(file.url).key } : file);
  return fields;
}
