import "server-only";
import { getDb } from "./firebase-admin";
import { InputError } from "./post-input.mjs";
import { indexFields, changeCatalog } from "./post-index.mjs";
import { resourceMedia } from "./media-policy.mjs";

// Binding media and changing visibility must commit atomically.
export async function saveResource(type, id, payload, user, mode = "update") {
  const db = await getDb();
  const ref = id ? db.collection(type).doc(id) : db.collection(type).doc();
  const mediaIds = resourceMedia(payload, type);
  if (mediaIds.length > 100) throw new InputError("첨부는 최대 100개입니다.");
  await db.runTransaction(async (tx) => {
    const maintenance = await tx.get(db.doc("_system/mediaMigration"));
    if (maintenance.data()?.status === "migrating") throw new InputError("첨부파일을 정리 중입니다. 잠시 후 다시 시도해주세요.", 503);
    const existing = await tx.get(ref);
    if (mode === "update" && !existing.exists) throw new InputError("항목을 찾을 수 없습니다.", 404);
    const before = existing.exists ? existing.data() : null;
    const indexRef = db.doc("_system/postIndex"), catalogRef = db.doc("_system/postCatalog");
    let catalog;
    if (type === "posts") {
      const index = await tx.get(indexRef);
      if (index.data()?.status !== "ready" || index.data()?.version !== 1) throw new InputError("게시물 목록을 준비 중입니다. 잠시 후 다시 시도해주세요.", 503);
      catalog = (await tx.get(catalogRef)).data();
    }
    const allIds = [...new Set([...(before?.mediaIds || []), ...mediaIds])];
    const documents = allIds.length ? await tx.getAll(...allIds.map((mediaId) => db.collection("media").doc(mediaId))) : [];
    for (const document of documents) {
      if (!mediaIds.includes(document.id)) continue;
      const media = document.data();
      if (!document.exists || media.deleting || (media.resourceId ? media.resourceId !== ref.id || media.resourceType !== type : media.ownerUid !== user.uid)) throw new InputError("사용할 수 없는 첨부파일입니다.");
    }
    const now = new Date();
    const after = { ...before, ...payload, mediaIds, updatedAt: now };
    if (mode === "create") Object.assign(after, { createdAt: now, ...(type === "posts" ? { author: user.name || "차차", authorId: user.uid, viewCount: 0, likeCount: 0, commentCount: 0, isRecommended: false } : {}) });
    if (type === "posts") {
      Object.assign(after, indexFields(after, existing.createTime));
      tx.set(catalogRef, changeCatalog(catalog, before, after));
    }
    tx.set(ref, after);
    for (const document of documents) {
      if (mediaIds.includes(document.id)) tx.update(document.ref, { resourceType: type, resourceId: ref.id });
      else if (document.exists && document.data().resourceId === ref.id && document.data().resourceType === type) tx.update(document.ref, { resourceType: null, resourceId: null });
    }
  });
  return ref.id;
}

export async function deleteResource(type, id) {
  const db = await getDb();
  await db.runTransaction(async (tx) => {
    const maintenance = await tx.get(db.doc("_system/mediaMigration"));
    if (maintenance.data()?.status === "migrating") throw new InputError("첨부파일을 정리 중입니다.", 503);
    const ref = db.collection(type).doc(id);
    const document = await tx.get(ref);
    if (!document.exists) throw new InputError("항목을 찾을 수 없습니다.", 404);
    if (type === "posts") {
      const index = await tx.get(db.doc("_system/postIndex"));
      if (index.data()?.status !== "ready") throw new InputError("게시물 목록을 준비 중입니다.", 503);
      const catalogRef = db.doc("_system/postCatalog");
      const catalog = (await tx.get(catalogRef)).data();
      tx.set(catalogRef, changeCatalog(catalog, document.data(), null));
    }
    tx.delete(ref);
  });
  // Registry entries referencing a deleted resource are denied immediately by the media endpoint.
}
