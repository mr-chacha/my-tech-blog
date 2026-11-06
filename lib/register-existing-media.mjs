import { randomUUID } from "node:crypto";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { validateUpload } from "./upload-validation.mjs";
import { MAX_UPLOAD_BYTES, MEDIA_TYPES } from "../common/util/media.mjs";
import { mediaUrl, isAllowedMediaKey } from "../common/util/media-refs.mjs";

export async function inspectExistingMedia(s3, bucket, key) {
  if (!isAllowedMediaKey(key)) throw new Error("Unsupported legacy media key");
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  if (!head.ContentLength || head.ContentLength > MAX_UPLOAD_BYTES || !MEDIA_TYPES.includes(head.ContentType)) throw new Error("Media requires manual review");
  return head;
}

// Register existing bytes in place: never copy, overwrite or delete S3 objects.
export async function registerExistingMedia({ s3, db, bucket, key, ownerUid }) {
  const head = await inspectExistingMedia(s3, bucket, key);
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key, IfMatch: head.ETag }));
  const bytes = await object.Body.transformToByteArray();
  const { type } = await validateUpload({ fileType: object.ContentType, fileData: Buffer.from(bytes).toString("base64") });
  const id = randomUUID();
  await db.collection("media").doc(id).create({ bucket, key, type, size: bytes.length, ownerUid, preserveObject: true, resourceType: null, resourceId: null, createdAt: new Date() });
  return { id, url: mediaUrl(id), key };
}
