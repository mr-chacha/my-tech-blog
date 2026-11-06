import { mediaId } from "../common/util/media-refs.mjs";
import { safeHttpUrl } from "../common/util/security.mjs";

export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

function text(value, name, max, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new InputError(`${name} 값을 확인해주세요. (최대 ${max}자)`);
  }
  return value.trim();
}

export function optionalUrl(value, name, allowMedia = false) {
  if (value == null || value === "") return "";
  const url = allowMedia && mediaId(value) ? value : safeHttpUrl(value);
  if (!url || url.length > 2048) throw new InputError(`${name}에는 http/https URL을 입력해주세요.`);
  return url;
}

export function validatePostInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new InputError("잘못된 요청입니다.");
  text(data.content, "본문", 500000, true);
  const payload = {
    title: text(data.title, "제목", 200, true),
    content: data.content,
    category: text(data.category, "카테고리", 80, true),
    image: optionalUrl(data.image, "대표 이미지", true),
    bestImage: optionalUrl(data.bestImage, "선택 이미지", true),
  };
  if (typeof data.published !== "boolean" || typeof data.isPrivate !== "boolean" || data.published === data.isPrivate) {
    throw new InputError("공개 설정이 올바르지 않습니다.");
  }
  payload.published = data.published;
  payload.isPrivate = data.isPrivate;
  if (!Array.isArray(data.tags) || data.tags.length > 20) throw new InputError("태그는 최대 20개입니다.");
  payload.tags = [...new Set(data.tags.map((tag) => text(tag, "태그", 50, true)))];
  if (!Array.isArray(data.file) || data.file.length > 100) throw new InputError("첨부파일은 최대 100개입니다.");
  payload.file = data.file.map((file) => ({
    name: text(file.name, "파일명", 255, true),
    url: optionalUrl(file.url, "파일 URL", true),
    path: text(file.path, "파일 경로", 1024, true),
    type: text(file.type, "파일 형식", 100, true),
    size: Number.isSafeInteger(file.size) && file.size >= 0 ? file.size : 0,
    isVideo: file.isVideo === true,
  }));
  return payload;
}
