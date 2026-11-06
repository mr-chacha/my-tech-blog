import { FieldPath } from "firebase-admin/firestore";
import { migrationClient } from "./migration-client.mjs";
import { timestampToDate } from "../common/util/post-data.mjs";
import { indexFields, changeCatalog } from "../lib/post-index.mjs";

const { db, apply, backup } = await migrationClient();
const state = db.doc("_system/postIndex"), catalogRef = db.doc("_system/postCatalog");
if (apply) {
  backup({ path: state.path, before: (await state.get()).data() || null });
  backup({ path: catalogRef.path, before: (await catalogRef.get()).data() || null });
  await state.set({ version: 1, status: "migrating", startedAt: new Date() });
}
let cursor, scanned = 0, fallbackDates = 0, catalog;
while (true) {
  let query = db.collection("posts").orderBy(FieldPath.documentId()).limit(200);
  if (cursor) query = query.startAfter(cursor);
  const snapshot = await query.get();
  if (snapshot.empty) break;
  const batch = db.batch();
  for (const doc of snapshot.docs) {
    const data = doc.data(), fields = indexFields(data, doc.createTime);
    if (!timestampToDate(data.createdAt) || !timestampToDate(data.updatedAt)) fallbackDates++;
    catalog = changeCatalog(catalog, null, { ...data, ...fields });
    if (apply) {
      backup({ path: doc.ref.path, updateTime: doc.updateTime, before: Object.fromEntries(["listVersion", "visibility", "sortAt", "categoryKey"].map((key) => [key, data[key] ?? null])) });
      batch.update(doc.ref, fields, { lastUpdateTime: doc.updateTime });
    }
    scanned++;
  }
  if (apply) await batch.commit();
  cursor = snapshot.docs.at(-1).id;
}
if (apply) {
  const batch = db.batch();
  batch.set(catalogRef, catalog || { version: 1, total: 0, public: 0, categories: {} });
  batch.set(state, { version: 1, status: "ready", completedAt: new Date() });
  await batch.commit();
}
console.log(JSON.stringify({ mode: apply ? "applied" : "dry-run", scanned, datesNeedingReview: fallbackDates, total: catalog?.total || 0, public: catalog?.public || 0 }));
