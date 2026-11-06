// Pure environment loader shared by the server-only Admin SDK and CLI tools.
// No external secret store or network request is required.
export function loadFirebaseCredential(env = process.env) {
  return {
    projectId: env.FIREBASE_PROJECT_ID?.trim(),
    clientEmail: env.FIREBASE_CLIENT_EMAIL?.trim(),
    privateKey: env.FIREBASE_PRIVATE_KEY_BASE64?.trim()
      ? Buffer.from(env.FIREBASE_PRIVATE_KEY_BASE64.trim(), "base64").toString("utf8")
      : env.FIREBASE_PRIVATE_KEY,
  };
}
