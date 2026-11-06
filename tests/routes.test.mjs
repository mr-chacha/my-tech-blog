import test from "node:test";
import assert from "node:assert/strict";
import { loadModule } from "./helpers.mjs";
import * as postIndex from "../lib/post-index.mjs";
import { mediaId } from "../common/util/media-refs.mjs";
import { isPublicPost } from "../common/util/post-data.mjs";
import { InputError, validatePostInput } from "../lib/post-input.mjs";

const post = { title: 'title', content: 'body', category: 'React', tags: [], file: [], published: true, isPrivate: false };
async function route({ user = null, data = post, exists = true } = {}) {
  const updates = [], invalidations = [];
  const doc = { exists, id: 'post-id', data: () => data };
  const document = { get: async () => doc, update: async (value) => updates.push(value), delete: async () => {} };
  const routeModule = await loadModule('../app/api/firebase/posts/[id]/route.js', {
    'next/server': { NextResponse: { json: (value, init) => Response.json(value, init) } },
    'next/cache': { revalidatePath: (path) => invalidations.push(path) },
    '@/lib/firebase-admin': { getDb: () => ({ collection: () => ({ doc: () => document }) }) },
    '@/lib/auth': { verifyToken: async () => user, isAdmin: (value) => value?.admin === true },
    '@/lib/resource-store': { saveResource: async (type, id, value) => updates.push(value), deleteResource: async () => {} },
    '@/lib/posts': { isPublicPost, serializePost: (value) => value },
    '@/lib/post-input.mjs': { InputError, validatePostInput },
  });
  return { routeModule, updates, invalidations };
}
const params = { params: Promise.resolve({ id: 'post-id' }) };
const request = () => new Request('https://example.com/api/firebase/posts/post-id');

test('private post API hides content from anonymous and non-admin users', async () => {
  for (const user of [null, { admin: false }]) {
    for (const data of [{ ...post, published: false }, { ...post, isPrivate: true }]) {
      const { routeModule } = await route({ user, data });
      const response = await routeModule.GET(request(), params);
      assert.equal(response.status, 404);
      assert.doesNotMatch(await response.text(), /body/);
      assert.match(response.headers.get('cache-control'), /no-store/);
    }
  }
});

test('public posts remain readable and administrator may read private posts without shared caching', async () => {
  for (const input of [{}, { user: { admin: true }, data: { ...post, published: false } }]) {
    const { routeModule } = await route(input);
    const response = await routeModule.GET(request(), params);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).content, 'body');
    assert.match(response.headers.get('cache-control'), /private, no-store/);
  }
});

test('mutations reject anonymous users before writing', async () => {
  const { routeModule, updates } = await route();
  assert.equal((await routeModule.PUT(request(), params)).status, 403);
  assert.equal((await routeModule.DELETE(request(), params)).status, 403);
  assert.equal(updates.length, 0);
});

test('post update preserves ownership, created date, recommendation and counters; invalidates cached pages', async () => {
  const { routeModule, updates, invalidations } = await route({ user: { admin: true } });
  const response = await routeModule.PUT(new Request('https://example.com', { method: 'PUT', body: JSON.stringify({ ...post, createdAt: { _methodName: 'serverTimestamp' }, authorId: 'forged', viewCount: 0, isRecommended: false }) }), params);
  assert.equal(response.status, 200);
  assert.equal(updates.length, 1);
  for (const key of ['createdAt', 'authorId', 'viewCount', 'isRecommended']) assert.equal(key in updates[0], false);

  assert.deepEqual(invalidations, ['/', '/post/post-id', '/sitemap.xml']);
});

test('malformed writes return 400 and missing posts return 404', async () => {
  const { routeModule, updates } = await route({ user: { admin: true } });
  const response = await routeModule.PUT(new Request('https://example.com', { method: 'PUT', body: JSON.stringify({ ...post, title: null }) }), params);
  assert.equal(response.status, 400); assert.equal(updates.length, 0);
  const missing = await route({ exists: false });
  assert.equal((await missing.routeModule.GET(request(), params)).status, 404);
});

test('server-rendered post helper never returns private post content', async () => {
  for (const data of [post, { ...post, published: false }, { ...post, isPrivate: true }]) {
    const routeModule = await loadModule('../lib/posts.js', {
      'server-only': {}, 'react': { cache: (fn) => fn },
      './post-input.mjs': { InputError }, './post-index.mjs': postIndex,
      'firebase-admin/firestore': { FieldPath: { documentId: () => '__name__' }, Timestamp: class { constructor(seconds, nanoseconds) { this.seconds = seconds; this.nanoseconds = nanoseconds; } } },
      '@/common/util/media-refs.mjs': { mediaId },
      '@/common/util/security.mjs': { safeHttpUrl: (value) => value || '' },
      '@/common/util/post-data.mjs': { isPublicPost, sortPostsByRecent: (p) => p, timestampToDate: () => null },
      '@/lib/firebase-admin': { getDb: () => ({ collection: () => ({ doc: () => ({ get: async () => ({ exists: true, id: 'post-id', data: () => data }) }) }) }) },
    });
    const result = await routeModule.getPostById('post-id');
    assert.equal(result?.content || null, isPublicPost(data) ? 'body' : null);
  }
});

test('administrator check fails closed for absent configuration and unverified email', async () => {
  const routeModule = await loadModule('../lib/auth.js', { 'server-only': {}, './firebase-admin': { getAuth: () => ({}) } });
  assert.equal(routeModule.isAdmin({ email: 'admin@example.com', email_verified: true }), true);
  assert.equal(routeModule.isAdmin({ email: 'admin@example.com', email_verified: false }), false);
  assert.equal(routeModule.isAdmin(null), false);
});

test('missing administrator configuration cannot grant admin rights', async () => {
  const auth = await loadModule('../lib/auth.js', { 'server-only': {}, './firebase-admin': { getAuth: () => ({}) } }, { process: { env: {} } });
  assert.equal(auth.isAdmin({ email_verified: true }), false);
});
