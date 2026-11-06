import { FieldPath } from "firebase-admin/firestore";
import { S3Client } from "@aws-sdk/client-s3";
import { inspectExistingMedia, registerExistingMedia } from "../lib/register-existing-media.mjs";
import { migrationClient } from "./migration-client.mjs";
import { legacyRefs, rewriteMedia } from "../lib/legacy-media.mjs";
import { resourceMedia } from "../lib/media-policy.mjs";
import { mediaUrl } from "../common/util/media-refs.mjs";

const { db, apply, backup, flags, value } = await migrationClient();
const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const source = flags.has("--source-bucket") ? value("--source-bucket") : bucket;
if (!source || source !== bucket) throw new Error("Use the configured existing S3_BUCKET_NAME; cross-bucket copies are disabled");
const region = process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2";
const s3 = new S3Client({ region, ...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? { credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } } : {}) });
const maintenance = db.doc("_system/mediaMigration");
if (apply) { backup({ path: maintenance.path, before: (await maintenance.get()).data() || null }); await maintenance.set({ status: "migrating", startedAt: new Date() }); }
let scanned = 0, changed = 0, registered = 0, unresolved = 0;
for (const type of ["posts", "portfolio"]) {
  let cursor;
  while (true) {
    let query = db.collection(type).orderBy(FieldPath.documentId()).limit(100);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    if (snapshot.empty) break;
    for (const doc of snapshot.docs) {
      scanned++;
      const data = doc.data(), refs = legacyRefs(data, source, region), replacements = new Map(), created = [];
      try {
        for (const { url, key } of refs) {
          if (!apply) {
            await inspectExistingMedia(s3, bucket, key);
            replacements.set(url, { url: mediaUrl("00000000-0000-4000-8000-000000000000"), key });
            continue;
          }
          const media = await registerExistingMedia({ s3, db, bucket, key, ownerUid: data.authorId || "migration" });
          created.push(media);
          replacements.set(url, media);
        }
        const preview = rewriteMedia(data, replacements);
        resourceMedia({ ...data, ...preview }, type);
        if (apply && refs.length) {
          const fields = rewriteMedia(data, replacements);
          const mediaIds = resourceMedia({ ...data, ...fields }, type);
          backup({ path: doc.ref.path, updateTime: doc.updateTime, before: Object.fromEntries(Object.keys(fields).map((key) => [key, data[key]])), mediaIds: data.mediaIds || [] });
          await db.runTransaction(async (tx) => {
            const current = await tx.get(doc.ref);
            if (!current.updateTime.isEqual(doc.updateTime)) throw new Error("Resource changed; rerun migration");
            tx.update(doc.ref, { ...fields, mediaIds });
            for (const media of created) tx.update(db.collection("media").doc(media.id), { resourceType: type, resourceId: doc.id });
          });
          registered += created.length;
        }
        if (refs.length) changed++;
      } catch (error) {
        unresolved++;
        // Log document identifiers only; do not print private content or credential errors.
        console.error(JSON.stringify({ resource: `${type}/${doc.id}`, reason: error.name || "MigrationError" }));
        for (const media of created) {
          const current = await db.collection("media").doc(media.id).get();
          if (current.data()?.resourceId) continue;
          await db.collection("media").doc(media.id).delete().catch(() => {});
        }
      }
    }
    cursor = snapshot.docs.at(-1).id;
  }
}
if (apply) await maintenance.set({ status: "ready", completedAt: new Date(), unresolved });
console.log(JSON.stringify({ mode: apply ? "applied" : "dry-run", scanned, resourcesToChange: changed, registered, unresolved, sourceObjectsCopied: 0, sourceObjectsDeleted: 0 }));
if (unresolved) process.exitCode = 1;
