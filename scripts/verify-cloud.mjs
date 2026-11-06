import { S3Client, GetPublicAccessBlockCommand } from "@aws-sdk/client-s3";
import { getSecurityRules } from "firebase-admin/security-rules";
import { getApp } from "firebase-admin/app";
import { readFile } from "node:fs/promises";
import { migrationClient } from "./migration-client.mjs";
const {db}=await migrationClient();
const report={};
try {
  const config=(await new S3Client({region:process.env.S3_REGION||"ap-northeast-2",...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}}:{})}).send(new GetPublicAccessBlockCommand({Bucket:process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME}))).PublicAccessBlockConfiguration;
  report.privateBucket=["BlockPublicAcls","IgnorePublicAcls","BlockPublicPolicy","RestrictPublicBuckets"].every((key)=>config?.[key]===true);
} catch {report.privateBucket="unverified";}
try {
  const deployed=await getSecurityRules(getApp()).getFirestoreRuleset();
  const expected=await readFile(new URL("../firestore.rules",import.meta.url),'utf8');
  report.firestoreRules=deployed.source.some((file)=>file.content?.trim()===expected.trim());
} catch {report.firestoreRules="unverified";}
try {const index=(await db.doc('_system/postIndex').get()).data();report.postIndex=index?.status==='ready'&&index.version===1;} catch{report.postIndex="unverified";}
try {const migration=(await db.doc('_system/mediaMigration').get()).data();report.mediaMigration=migration?.status==='ready'&&migration.unresolved===0;}catch{report.mediaMigration="unverified";}
console.log(JSON.stringify(report));
if(Object.values(report).some((value)=>value!==true))process.exitCode=1;
