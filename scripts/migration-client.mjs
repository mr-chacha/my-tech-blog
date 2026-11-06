import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { loadFirebaseCredential } from "../lib/firebase-credential.mjs";
import { mkdirSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";

export async function migrationClient(args = process.argv.slice(2)) {
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const flags = new Set(args), value = (flag) => args[args.indexOf(flag) + 1];
  const credential = await loadFirebaseCredential();
  if (!value("--project") || !flags.has("--project") || value("--project") !== credential.projectId) throw new Error("Pass --project with the exact Firebase project ID");
  credential.privateKey = credential.privateKey?.replace(/\\n/g, "\n");
  const app = getApps()[0] || initializeApp({ credential: cert(credential), projectId: credential.projectId });
  const apply = flags.has("--apply");
  let backup;
  if (apply) {
    if (!flags.has("--backup-dir") || !value("--backup-dir") || value("--backup-dir").startsWith("--")) throw new Error("--apply requires --backup-dir");
    const dir = resolve(value("--backup-dir")); mkdirSync(dir, { recursive: true, mode: 0o700 });
    const filename = resolve(dir, `migration-${Date.now()}.jsonl`);
    backup = (record) => appendFileSync(filename, JSON.stringify(record) + "\n", { mode: 0o600 });
  }
  return { db: getFirestore(app), apply, backup, flags, value };
}
