import test from "node:test";
import assert from "node:assert/strict";
import { loadModule } from "./helpers.mjs";
import * as postIndex from "../lib/post-index.mjs";
import { InputError } from "../lib/post-input.mjs";
import { mediaId, mediaUrl } from "../common/util/media-refs.mjs";
import { isPublicPost } from "../common/util/post-data.mjs";
import { canReadMedia, resourceMedia } from "../lib/media-policy.mjs";
import { legacyKey, legacyRefs, rewriteMedia } from "../lib/legacy-media.mjs";
import { loadFirebaseCredential } from "../lib/firebase-credential.mjs";

const id = '3dd98aac-731d-4210-8db7-16b62f6897a1';
const post = { title: 'test', content: 'body', published: true, isPrivate: false, category: 'React', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-02-01') };
class Timestamp { constructor(seconds,nanoseconds) { this.seconds=seconds;this.nanoseconds=nanoseconds; } }
const firestore = { FieldPath: { documentId: () => '__name__' }, Timestamp };
async function postsSource(db) {
  return loadModule('../lib/posts.js', {
    'server-only': {}, 'react': { cache: (fn) => fn }, './post-input.mjs': { InputError }, './post-index.mjs': postIndex,
    'firebase-admin/firestore': firestore, '@/common/util/media-refs.mjs': { mediaId },
    '@/common/util/security.mjs': { safeHttpUrl: (value) => value || '' },
    '@/common/util/post-data.mjs': { isPublicPost, sortPostsByRecent: (p) => p, timestampToDate: () => null },
    '@/lib/firebase-admin': { getDb: async () => db },
  });
}
test('Firestore page applies scope/category filters, deterministic tie-breaker, limit+1 and timestamp cursor', async () => {
  const calls=[];
  const docs = ['c','b','a'].map((id) => ({ id, data: () => ({ ...post, sortAt: new Timestamp(500,42) }) }));
  const query = Object.fromEntries(['where','orderBy','select','limit','startAfter'].map((name) => [name,(...args) => { calls.push([name,...args]);return query; }]));
  query.get = async () => ({ docs });
  const db = { collection: () => query, doc: (path) => ({ get: async () => ({ data: () => path.endsWith('postIndex') ? { version:1,status:'ready' } : { total:3,public:2,categories:{r:{label:'React',total:3,public:2}} } }) }) };
  const source = await postsSource(db);
  const first = await source.getPostPage(new URLSearchParams({limit:'2',category:'React'}));
  assert.equal(first.posts.length,2); assert.equal(first.total,2);
  assert.deepEqual(calls.filter((c)=>c[0]==='where'),[['where','visibility','==','public'],['where','categoryKey','==','React']]);
  assert.ok(calls.some((c)=>c[0]==='orderBy' && c[1]==='__name__' && c[2]==='desc'));
  assert.ok(calls.some((c)=>c[0]==='limit' && c[1]===3));
  assert.equal(calls.find((c)=>c[0]==='select').includes('content'),false);
  await source.getPostPage(new URLSearchParams({limit:'2',category:'React',cursor:first.nextCursor}));
  const cursorCall=calls.find((c)=>c[0]==='startAfter');
  assert.equal(cursorCall[1].seconds,500); assert.equal(cursorCall[1].nanoseconds,42); assert.equal(cursorCall[2],'b');
});
test('cursor cannot cross category or auth scope and bad/massive cursors/limits fail', () => {
  const cursor=postIndex.encodeCursor({id:'test',data:()=>({sortAt:new Timestamp(0,0)})},'React',true);
  assert.throws(()=>postIndex.readPageOptions(new URLSearchParams({category:'React',cursor}),false));
  assert.throws(()=>postIndex.readPageOptions(new URLSearchParams({category:'CSS',cursor}),true));
  for(const limit of ['0','51','bad','-1']) assert.throws(()=>postIndex.readPageOptions(new URLSearchParams({limit}),false));
  assert.throws(()=>postIndex.readPageOptions(new URLSearchParams({cursor:'not-json'}),false));
});
test('unmigrated lists preserve pagination, category totals and private metadata boundaries', async () => {
  const docs = [
    { id: 'a', data: () => post },
    { id: 'b', data: () => post },
    { id: 'secret', data: () => ({ ...post, isPrivate: true, category: 'Secret' }) },
    { id: 'c', data: () => ({ ...post, category: 'CSS' }) },
  ];
  const db = { doc: () => ({ get: async () => ({ data: () => undefined }) }), collection: () => ({ select: (...fields) => {
    assert.equal(fields.includes('content'), false);
    return { get: async () => ({ docs }) };
  } }) };
  const source = await postsSource(db);
  const first = await source.getPostPage(new URLSearchParams({ limit: '1', category: 'React' }));
  assert.equal(first.posts[0].id, 'b');
  assert.equal(first.total, 3);
  assert.equal(first.categories.some((entry) => entry.name === 'Secret'), false);
  assert.equal('content' in first.posts[0], false);
  const second = await source.getPostPage(new URLSearchParams({ limit: '1', category: 'React', cursor: first.nextCursor }));
  assert.equal(second.posts[0].id, 'a');
  assert.equal(second.nextCursor, null);
  const admin = await source.getPostPage(new URLSearchParams(), true);
  assert.equal(admin.posts.length, 4);
  assert.equal(admin.total, 4);
});
test('catalog tracks visibility and category changes without revealing private counts', () => {
  let catalog=postIndex.changeCatalog(null,null,post);
  const hidden={...post,isPrivate:true,category:'Secret'};
  catalog=postIndex.changeCatalog(catalog,post,hidden);
  assert.deepEqual(postIndex.publicCatalog(catalog,false),{total:0,categories:[]});
  assert.equal(postIndex.publicCatalog(catalog,true).categories[0].name,'Secret');
  catalog=postIndex.changeCatalog(catalog,hidden,null);assert.equal(catalog.total,0);
  const indexed=postIndex.indexFields({...post,createdAt:{_methodName:'serverTimestamp'},updatedAt:null},new Date('2026-03-01'));
  assert.equal(indexed.sortAt.toISOString(),'2026-03-01T00:00:00.000Z');
});
test('media policy distinguishes public, private, orphan, deleted and deleting resources', () => {
  const record={resourceType:'posts',resourceId:'post',ownerUid:'owner'};
  assert.equal(canReadMedia(record,post,null),true);
  assert.equal(canReadMedia(record,{...post,isPrivate:true},null),false);
  assert.equal(canReadMedia(record,{...post,published:false},{uid:'admin'}),true);
  assert.equal(canReadMedia(record,null,{uid:'admin'}),false);
  assert.equal(canReadMedia({...record,resourceId:null},null,null),false);
  assert.equal(canReadMedia({...record,resourceId:null},null,{uid:'owner'}),true);
  assert.equal(canReadMedia({...record,deleting:true},post,{uid:'owner'}),false);
});
test('private media collection parses HTML/Markdown and rejects unmanaged files', () => {
  const url=mediaUrl(id);
  assert.deepEqual(resourceMedia({...post,content:`![image](${url})\n<video><source src="${url}"></video>`,image:url,isPrivate:true}),[id]);
  assert.throws(()=>resourceMedia({...post,isPrivate:true,content:'<img src="https://example.com/secret.jpg">'}));
  assert.throws(()=>resourceMedia({...post,isPrivate:true,image:'https://old.s3.amazonaws.com/images/a.jpg'}));
  assert.equal(mediaId(`https://evil.test${url}`),null);
  assert.equal(mediaId(url+'?token=abc'),null);
});
test('legacy migration never fetches arbitrary hosts or different buckets and rewrites all references', () => {
  const old='https://old.s3.ap-northeast-2.amazonaws.com/images/a.png';
  assert.equal(legacyKey(old,'old'),'images/a.png');
  assert.equal(legacyKey(old.replace('old.s3','other.s3'),'old'),null);
  assert.equal(legacyKey('https://169.254.169.254/latest/meta-data','old'),null);
  assert.equal(legacyKey(old.replace('/images/','/images/%2e%2e/'),'old'),null);
  const data={...post,content:`![a](${old})`,image:old,file:[{url:old,path:'images/a.png'}]};
  assert.equal(legacyRefs(data,'old').length,1);
  const next=rewriteMedia(data,new Map([[old,{url:mediaUrl(id),key:'images/new.png'}]]));
  assert.match(next.content,/\/api\/media\//);assert.equal(next.file[0].path,'images/new.png');
});
test('Firebase credentials load from existing environment variables, including base64 PEM', () => {
  const raw = { FIREBASE_PROJECT_ID: ' project ', FIREBASE_CLIENT_EMAIL: 'admin@example.com', FIREBASE_PRIVATE_KEY: 'existing-key', UNRELATED: 'omit' };
  assert.deepEqual(loadFirebaseCredential(raw), { projectId: 'project', clientEmail: 'admin@example.com', privateKey: 'existing-key' });
  const pem = '-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----';
  assert.equal(loadFirebaseCredential({ ...raw, FIREBASE_PRIVATE_KEY_BASE64: Buffer.from(pem).toString('base64') }).privateKey, pem);
  assert.equal(loadFirebaseCredential({ ...raw, FIREBASE_PRIVATE_KEY_BASE64: '  ' }).privateKey, 'existing-key');
});
