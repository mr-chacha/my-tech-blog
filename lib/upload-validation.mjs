import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { MAX_UPLOAD_BYTES, MEDIA_TYPES } from "../common/util/media.mjs";
import { InputError } from "./post-input.mjs";

// JSON + base64 must fit within the hosting request limit as well as decoded media limits.
export const MAX_UPLOAD_BODY_BYTES = 4 * 1024 * 1024 + 4096;

export async function validateUpload(data) {
  if (!data || !MEDIA_TYPES.includes(data.fileType) || typeof data.fileData !== "string") {
    throw new InputError("지원하지 않는 파일 형식입니다.");
  }
  if (data.fileData.length > Math.ceil(MAX_UPLOAD_BYTES / 3) * 4) throw new InputError("파일은 3MB 이하여야 합니다.", 413);
  if (data.fileData.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(data.fileData)) throw new InputError("잘못된 파일 데이터입니다.");
  const buffer = Buffer.from(data.fileData, "base64");
  if (buffer.toString("base64") !== data.fileData) throw new InputError("잘못된 파일 데이터입니다.");
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) throw new InputError("파일은 3MB 이하여야 합니다.", 413);
  let detected;
  try { detected = await fileTypeFromBuffer(buffer); }
  catch { throw new InputError("손상된 파일입니다."); }
  if (!detected || !MEDIA_TYPES.includes(detected.mime) || detected.mime !== data.fileType) {
    throw new InputError("파일 내용과 형식이 일치하지 않습니다.");
  }
  const folder = detected.mime.startsWith("video/") ? "videos" : "images";
  return { buffer, type: detected.mime, key: `${folder}/${randomUUID()}.${detected.ext}` };
}

export async function readUploadJson(request) {
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_UPLOAD_BODY_BYTES) throw new InputError("업로드 요청이 너무 큽니다.", 413);
  if (!request.body) throw new InputError("파일 데이터가 없습니다.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_UPLOAD_BODY_BYTES) {
        await reader.cancel();
        throw new InputError("업로드 요청이 너무 큽니다.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
