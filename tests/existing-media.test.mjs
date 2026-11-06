import test from 'node:test';
import assert from 'node:assert/strict';
import { registerExistingMedia } from '../lib/register-existing-media.mjs';
import { isAllowedMediaKey } from '../common/util/media-refs.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
test('existing media registration reads original bytes without copying, uploading or deleting objects',async()=>{
  const commands=[];let record;
  const s3={send:async(command)=>{
    commands.push(command.constructor.name);
    assert.equal(command.input.Bucket,'existing-bucket');assert.equal(command.input.Key,'portfolio/기존 이미지.png');
    if(command.constructor.name==='HeadObjectCommand')return {ContentLength:png.length,ContentType:'image/png',ETag:'etag'};
    if(command.constructor.name==='GetObjectCommand'){assert.equal(command.input.IfMatch,'etag');return {ContentType:'image/png',Body:{transformToByteArray:async()=>png}};}
    throw new Error('Unexpected S3 write');
  }};
  const result=await registerExistingMedia({s3,db:{collection:()=>({doc:()=>({create:async(value)=>{record=value;}})})},bucket:'existing-bucket',key:'portfolio/기존 이미지.png',ownerUid:'admin'});
  assert.deepEqual(commands,['HeadObjectCommand','GetObjectCommand']);
  assert.equal(record.preserveObject,true);assert.equal(record.key,'portfolio/기존 이미지.png');assert.equal(result.key,record.key);assert.match(result.url,/^\/api\/media\//);
});
test('legacy media keys allow existing filenames but reject traversal, controls and unrelated prefixes',()=>{
  assert.equal(isAllowedMediaKey('images/old_image.png'),true);assert.equal(isAllowedMediaKey('portfolio/기존 이미지.png'),true);
  for(const key of ['../private','images/../private','images/','images/a\0b.png','credentials.json'])assert.equal(isAllowedMediaKey(key),false);
});

test('orphan cleanup never deletes an original S3 object reused by migrated media',async()=>{
  const {loadModule}=await import('./helpers.mjs');
  const {MEDIA_ID}=await import('../common/util/media-refs.mjs');
  let removed=false,s3Deletes=0;
  const record={ownerUid:'admin',resourceId:null,bucket:'existing-bucket',key:'images/original.png',preserveObject:true};
  const reference={delete:async()=>{removed=true;}};
  const source=await loadModule('../app/api/aws/delete/route.js',{
    '@aws-sdk/client-s3':{DeleteObjectCommand:class{}},
    'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
    '@/lib/auth':{verifyToken:async()=>({uid:'admin'}),isAdmin:()=>true},
    '@/lib/firebase-admin':{getDb:async()=>({collection:()=>({doc:()=>reference}),runTransaction:async(fn)=>fn({get:async()=>({data:()=>record}),update:()=>{}})})},
    '@/lib/s3':{getS3Bucket:()=> 'existing-bucket',getS3Client:()=>({send:async()=>{s3Deletes++;}})},
    '@/common/util/media-refs.mjs':{MEDIA_ID},
  });
  const response=await source.DELETE(new Request('https://example.com/api/aws/delete',{method:'DELETE',body:JSON.stringify({id:'3dd98aac-731d-4210-8db7-16b62f6897a1'})}));
  assert.equal(response.status,200);assert.equal(removed,true);assert.equal(s3Deletes,0);
});
