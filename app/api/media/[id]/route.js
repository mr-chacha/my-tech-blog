import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getDb } from "@/lib/firebase-admin";
import { getS3Bucket, getS3Client } from "@/lib/s3";
import { verifyMediaUser } from "@/lib/auth";
import { MEDIA_ID, isAllowedMediaKey } from "@/common/util/media-refs.mjs";
import { MEDIA_TYPES } from "@/common/util/media.mjs";
import { canReadMedia } from "@/lib/media-policy.mjs";
export const dynamic = "force-dynamic";
const notFound = () => new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
async function serve(request, { params }, head) {
  const { id } = await params;
  if (!MEDIA_ID.test(id)) return notFound();
  try {
    const db = await getDb();
    const record = (await db.collection("media").doc(id).get()).data();
    if (!record || !MEDIA_TYPES.includes(record.type)) return notFound();
    const resource = record.resourceId && ["posts", "portfolio"].includes(record.resourceType) ? (await db.collection(record.resourceType).doc(record.resourceId).get()).data() : null;
    if (resource && !resource.mediaIds?.includes(id)) return notFound();
    const user = await verifyMediaUser(request);
    if (!canReadMedia(record, resource, user)) return notFound();
    // Never allow a registry record to choose an arbitrary bucket or executable file.
    if (record.bucket !== getS3Bucket() || !isAllowedMediaKey(record.key)) return notFound();
    const range = request.headers.get("range");
    if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return new Response(null, { status: 416 });
    const Command = head ? HeadObjectCommand : GetObjectCommand;
    const result = await getS3Client().send(new Command({ Bucket: record.bucket, Key: record.key, ...(range ? { Range: range } : {}) }));
    const headers = { "Content-Type": record.type, "Content-Disposition": "inline", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes", "Referrer-Policy": "no-referrer", "Vary": "Cookie, Authorization" };
    if (result.ContentLength != null) headers["Content-Length"] = String(result.ContentLength);
    if (result.ContentRange) headers["Content-Range"] = result.ContentRange;
    return new Response(head ? null : result.Body.transformToWebStream(), { status: result.ContentRange ? 206 : 200, headers });
  } catch (error) {
    if (error.name === "InvalidRange") return new Response(null, { status: 416 });
    if (["NoSuchKey", "NotFound"].includes(error.name)) return notFound();
    console.error("Media request failed:", error.name);
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
export const GET = (request, context) => serve(request, context, false);
export const HEAD = (request, context) => serve(request, context, true);
