import test from 'node:test';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadModule } from './helpers.mjs';

test('deployment env writer uses existing server variables, hides values and omits unmanaged variables',()=>{
  const dir=mkdtempSync(join(tmpdir(),'blog-env-'));
  try{
    const script=new URL('../scripts/write-server-env.mjs',import.meta.url);
    const key='-----BEGIN PRIVATE KEY-----\nEXISTING_KEY\n-----END PRIVATE KEY-----';
    const output=execFileSync(process.execPath,[fileURLToPath(script)],{cwd:dir,env:{PATH:process.env.PATH,FIREBASE_PROJECT_ID:'project',FIREBASE_CLIENT_EMAIL:'service@example.com',ADMIN_EMAIL:'admin@example.com',S3_BUCKET_NAME:'existing-bucket',FIREBASE_PRIVATE_KEY:key,S3_ACCESS_KEY_ID:'existing-access',S3_SECRET_ACCESS_KEY:'existing-secret',NEXT_PUBLIC_FIREBASE_PROJECT_ID:'public-id',UNRELATED_PRIVATE_VALUE:'do-not-copy'},encoding:'utf8'});
    const file=readFileSync(join(dir,'.env.production'),'utf8');
    assert.match(file,/S3_BUCKET_NAME="existing-bucket"/);assert.match(file,/NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
    assert.match(file,/S3_SECRET_ACCESS_KEY="existing-secret"/);assert.doesNotMatch(file,/FIREBASE_SECRET_ARN|UNRELATED_PRIVATE_VALUE|EXISTING_KEY/);
    const encoded=file.match(/^FIREBASE_PRIVATE_KEY_BASE64="([^"\n]+)"/m)[1];
    assert.equal(Buffer.from(encoded,'base64').toString('utf8'),key);
    assert.doesNotMatch(output,/EXISTING_KEY|existing-secret|existing-access|service@example/);
    assert.equal(statSync(join(dir,'.env.production')).mode&0o777,0o600);
  }finally{rmSync(dir,{recursive:true});}
});
test('existing bucket IAM policy neither provisions infrastructure nor requests secret-store access',()=>{
  const policy=JSON.parse(readFileSync(new URL('../infra/existing-bucket-policy.example.json',import.meta.url),'utf8'));
  assert.equal('Resources' in policy,false);
  assert.ok(policy.Statement.every((entry)=>entry.Effect==='Allow'));
  assert.ok(policy.Statement.flatMap((entry)=>entry.Action).every((action)=>action.startsWith('s3:')));
  assert.ok(policy.Statement.flatMap((entry)=>[].concat(entry.Resource)).every((resource)=>resource.includes('EXISTING_BLOG_BUCKET')));
});
async function session(user,origin='https://example.com'){
  let minted=0, cookie;
  const source=await loadModule('../app/api/auth/session/route.js',{
    'next/server':{NextResponse:{json:(value,init)=>{const response=Response.json(value,init);response.cookies={set:(...args)=>{cookie=args;}};return response;}}},
    '@/lib/firebase-admin':{getAuth:async()=>({createSessionCookie:async()=>{minted++;return 'signed-cookie';}})},
    '@/lib/auth':{verifyToken:async()=>user,isAdmin:(value)=>value?.admin===true,SESSION_COOKIE:'blog_admin_session'},
  });
  const request=new Request('https://example.com/api/auth/session',{method:'POST',headers:{origin,authorization:'Bearer signed-id-token'}});
  return {source,request,minted:()=>minted,cookie:()=>cookie};
}
test('session cookie requires a same-origin administrator token and is httpOnly/strict',async()=>{
  const denied=await session({admin:true},'https://evil.test');assert.equal((await denied.source.POST(denied.request)).status,403);assert.equal(denied.minted(),0);
  const anon=await session(null);assert.equal((await anon.source.POST(anon.request)).status,403);
  const admin=await session({admin:true});assert.equal((await admin.source.POST(admin.request)).status,200);assert.equal(admin.cookie()[2].httpOnly,true);assert.equal(admin.cookie()[2].sameSite,'strict');
  assert.equal((await admin.source.DELETE(admin.request)).status,200);assert.equal(admin.cookie()[2].maxAge,0);
});

test('media session identity requires a verified admin email and revocation checking',async()=>{
  let checkedRevocation;
  const verified={uid:'admin',email:'admin@example.com',email_verified:true};
  const auth=await loadModule('../lib/auth.js',{'server-only':{},'./firebase-admin':{getAuth:async()=>({verifySessionCookie:async(token,revoked)=>{checkedRevocation=revoked;if(token!=='valid')throw new Error('invalid');return verified;}})}});
  assert.equal((await auth.verifyMediaUser(new Request('https://example.com',{headers:{cookie:'blog_admin_session=valid'}}))).uid,'admin');
  assert.equal(checkedRevocation,true);
  assert.equal(await auth.verifyMediaUser(new Request('https://example.com',{headers:{cookie:'blog_admin_session=forged'}})),null);
});

test('same-origin check handles Next loopback hostname normalization without accepting unrelated origins',async()=>{
  const admin=await session({admin:true});
  const request=new Request('https://localhost:3197/api/auth/session',{method:'POST',headers:{origin:'https://127.0.0.1:3197',host:'127.0.0.1:3197',authorization:'Bearer valid'}});
  assert.equal((await admin.source.POST(request)).status,200);
  const bad=new Request('https://localhost:3197/api/auth/session',{method:'POST',headers:{origin:'https://evil.test',host:'127.0.0.1:3197',authorization:'Bearer valid'}});
  assert.equal((await admin.source.POST(bad)).status,403);
});
