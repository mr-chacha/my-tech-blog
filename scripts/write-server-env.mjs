import { writeFileSync, chmodSync } from "node:fs";
const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "ADMIN_EMAIL"];
const missing = required.filter((key) => !process.env[key]?.trim());
if (!process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim() && !process.env.FIREBASE_PRIVATE_KEY?.trim()) missing.push("FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY");
if (!process.env.S3_BUCKET_NAME && !process.env.AWS_BUCKET_NAME) missing.push("S3_BUCKET_NAME");
if (!!process.env.S3_ACCESS_KEY_ID !== !!process.env.S3_SECRET_ACCESS_KEY) missing.push("S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY pair");
if (missing.length) throw new Error(`Missing server environment variables: ${missing.join(", ")}`);
// Amplify SSR reads this server environment file; never inline secrets through next.config.env.
// Prefer one normalized base64 key so multiline PEM survives dotenv/expansion parsing.
const values = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY_BASE64: process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim() || Buffer.from(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")).toString("base64"),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME,
  S3_REGION: process.env.S3_REGION || process.env.AWS_REGION || "ap-northeast-2",
  ...(process.env.S3_ACCESS_KEY_ID ? { S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY } : {}),
  ...Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))),
};
writeFileSync(".env.production", Object.entries(values).map(([key,value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600 });
chmodSync(".env.production", 0o600);
console.log("Amplify SSR environment prepared (values hidden).");
