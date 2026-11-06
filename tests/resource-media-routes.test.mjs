import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from './helpers.mjs';
import * as postIndex from '../lib/post-index.mjs';
import { InputError } from '../lib/post-input.mjs';
import { resourceMedia, canReadMedia } from '../lib/media-policy.mjs';
import { MEDIA_ID, mediaUrl, isAllowedMediaKey } from '../common/util/media-refs.mjs';
import { MEDIA_TYPES } from '../common/util/media.mjs';
const id='3dd98aac-731d-4210-8db7-16b62f6897a1';
function database(seed) {
  const records=new Map(Object.entries(seed));
  const ref=(path)=>({path,id:path.split('/').at(-1)});
  const snap=(r)=>({ref:r,id:r.id,exists:records.has(r.path),data:()=>records.get(r.path),createTime:new Date('2026-01-01')});
  const db={doc:ref,collection:(type)=>({doc:(key='new-post')=>ref(`${type}/${key}`)}),runTransaction:async(fn)=>{
    const writes=[];
    const tx={get:async(r)=>snap(r),getAll:async(...refs)=>refs.map(snap),set:(r,data)=>writes.push(()=>records.set(r.path,data)),update:(r,update)=>writes.push(()=>records.set(r.path,{...records.get(r.path),...update})),delete:(r)=>writes.push(()=>records.delete(r.path))};
    const result=await fn(tx);writes.forEach((write)=>write());return result;
  }};
  return {db,records};
}
async function store(seed) {
  const databaseState=database({'_system/postIndex':{version:1,status:'ready'},...seed});
  const source=await loadModule('../lib/resource-store.js',{'server-only':{},'./firebase-admin':{getDb:async()=>databaseState.db},'./post-input.mjs':{InputError},'./post-index.mjs':postIndex,'./media-policy.mjs':{resourceMedia}});
  return {...databaseState,...source};
}
const original={title:'title',category:'React',content:'old',published:true,isPrivate:false,createdAt:new Date('2026-01-01'),authorId:'owner',viewCount:12,isRecommended:true,mediaIds:[]};
test('transaction preserves server-owned fields, updates catalog and binds private attachments atomically',async()=>{
  const catalog=postIndex.changeCatalog(null,null,original);
  const state=await store({'posts/p':original,'_system/postCatalog':catalog,[`media/${id}`]:{ownerUid:'admin',resourceId:null}});
  await state.saveResource('posts','p',{title:'changed',category:'CSS',content:`![a](${mediaUrl(id)})`,published:false,isPrivate:true}, {uid:'admin'});
  const next=state.records.get('posts/p');
  assert.equal(next.authorId,'owner');assert.equal(next.viewCount,12);assert.equal(next.isRecommended,true);assert.equal(next.createdAt,original.createdAt);
  assert.equal(next.visibility,'private');assert.equal(next.categoryKey,'CSS');assert.equal(next.mediaIds[0],id);
  assert.equal(state.records.get(`media/${id}`).resourceId,'p');
  assert.equal(state.records.get('_system/postCatalog').public,0);
});
test('cannot claim another post media, a different uploader orphan or deleting media; transaction rolls back',async()=>{
  for(const media of [{resourceId:'other',resourceType:'posts',ownerUid:'admin'},{resourceId:null,ownerUid:'someone-else'},{resourceId:null,ownerUid:'admin',deleting:true}]) {
    const state=await store({'posts/p':original,[`media/${id}`]:media});
    await assert.rejects(state.saveResource('posts','p',{...original,content:`![a](${mediaUrl(id)})`},{uid:'admin'}));
    assert.equal(state.records.get('posts/p').content,'old');
  }
});
test('deleted posts decrement catalog and no longer authorize their media',async()=>{
  const state=await store({'posts/p':original,'_system/postCatalog':postIndex.changeCatalog(null,null,original)});
  await state.deleteResource('posts','p');assert.equal(state.records.has('posts/p'),false);assert.equal(state.records.get('_system/postCatalog').total,0);
});
async function mediaEndpoint({user=null,privatePost=false,exists=true,rangeResult=false}={}) {
  const resource={published:!privatePost,isPrivate:privatePost,mediaIds:[id]};
  const record={key:`images/${id}.png`,bucket:'private-bucket',type:'image/png',resourceId:'p',resourceType:'posts'};
  let s3Calls=0;
  class Command {constructor(input){this.input=input;}}
  const source=await loadModule('../app/api/media/[id]/route.js',{
    '@aws-sdk/client-s3':{GetObjectCommand:Command,HeadObjectCommand:Command},
    '@/lib/firebase-admin':{getDb:async()=>({collection:(type)=>({doc:()=>({get:async()=>({data:()=>type==='media'?record:exists?resource:undefined})})})})},
    '@/lib/s3':{getS3Bucket:()=> 'private-bucket',getS3Client:()=>({send:async()=>{s3Calls++;return {ContentLength:3,...(rangeResult?{ContentRange:'bytes 0-2/3'}:{}),Body:{transformToWebStream:()=>new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('png'));c.close();}})}};}})},
    '@/lib/auth':{verifyMediaUser:async()=>user},'@/common/util/media-refs.mjs':{MEDIA_ID,isAllowedMediaKey},'@/common/util/media.mjs':{MEDIA_TYPES},'@/lib/media-policy.mjs':{canReadMedia},
  });
  return {...source,s3Calls:()=>s3Calls};
}
test('private media route denies anonymous access before contacting S3',async()=>{
  const source=await mediaEndpoint({privatePost:true});
  const response=await source.GET(new Request('https://example.com'),{params:Promise.resolve({id})});
  assert.equal(response.status,404);assert.equal(source.s3Calls(),0);assert.match(response.headers.get('cache-control'),/no-store/);
});
test('media GET/HEAD preserve content type and video byte ranges without public caching',async()=>{
  const source=await mediaEndpoint({privatePost:true,user:{uid:'admin'},rangeResult:true});
  const params={params:Promise.resolve({id})};
  const response=await source.GET(new Request('https://example.com',{headers:{Range:'bytes=0-2'}}),params);
  assert.equal(response.status,206);assert.equal(await response.text(),'png');assert.equal(response.headers.get('content-range'),'bytes 0-2/3');assert.equal(response.headers.get('content-type'),'image/png');assert.match(response.headers.get('cache-control'),/no-store/);
  assert.equal(await (await source.HEAD(new Request('https://example.com'),params)).text(),'');
});
test('media route denies deleted resources and multipart ranges',async()=>{
  const gone=await mediaEndpoint({exists:false,user:{uid:'admin'}});
  assert.equal((await gone.GET(new Request('https://example.com'),{params:{id}})).status,404);
  const live=await mediaEndpoint();
  assert.equal((await live.GET(new Request('https://example.com',{headers:{Range:'bytes=0-1,3-4'}}),{params:{id}})).status,416);
});
