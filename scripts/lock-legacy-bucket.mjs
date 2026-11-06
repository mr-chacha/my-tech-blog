import { S3Client, PutPublicAccessBlockCommand } from "@aws-sdk/client-s3";
import { FieldPath } from "firebase-admin/firestore";
import { migrationClient } from "./migration-client.mjs";
import { legacyRefs } from "../lib/legacy-media.mjs";
const { db, apply, flags, value, backup } = await migrationClient();
const bucket = flags.has("--source-bucket") && value("--source-bucket"), region = process.env.S3_REGION || "ap-northeast-2";
if (!bucket) throw new Error("--source-bucket is required");
let remaining = 0;
for (const type of ["posts", "portfolio"]) {
  let cursor;
  while (true) {
    let query = db.collection(type).orderBy(FieldPath.documentId()).limit(200);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get(); if (snapshot.empty) break;
    for (const doc of snapshot.docs) remaining += legacyRefs(doc.data(), bucket, region).length;
    cursor = snapshot.docs.at(-1).id;
  }
}
if (remaining) throw new Error(`${remaining} source references remain; migrate them before blocking the source bucket`);
if (apply) {
  if (!flags.has("--confirm-dedicated-bucket") || value("--confirm-dedicated-bucket") !== bucket) throw new Error("Confirm the bucket belongs only to this blog with --confirm-dedicated-bucket <bucket>");
  const { GetPublicAccessBlockCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({ region, ...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? { credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } } : {}) });
  const previous = await client.send(new GetPublicAccessBlockCommand({ Bucket: bucket })).catch((error) => { if (error.name === "NoSuchPublicAccessBlockConfiguration") return {}; throw error; });
  backup({ bucket, before: previous.PublicAccessBlockConfiguration || null });
  await client.send(new PutPublicAccessBlockCommand({ Bucket: bucket, PublicAccessBlockConfiguration: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true } }));
}
console.log(JSON.stringify({ mode: apply ? "applied" : "dry-run", remainingReferences: remaining, sourceObjectsDeleted: 0 }));
