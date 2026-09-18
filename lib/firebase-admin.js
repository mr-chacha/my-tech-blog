import admin from "firebase-admin";

/**
 * Amplify 콘솔에 넣을 때 줄바꿈이 깨지는 경우가 많아
 * 1) 일반 PEM + \n 문자열
 * 2) BASE64 인코딩 값
 * 둘 다 지원합니다.
 */
function normalizePrivateKey(raw) {
  if (!raw) return undefined;

  let key = String(raw).trim();

  // 값 전체를 감싼 따옴표 제거 (콘솔에 "..." 로 넣은 경우)
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Base64로 저장한 경우 (권장: Amplify에서 줄바꿈 이슈 회피)
  const looksLikePem = key.includes("BEGIN PRIVATE KEY") || key.includes("BEGIN RSA PRIVATE KEY");
  if (!looksLikePem) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8").trim();
      if (decoded.includes("BEGIN PRIVATE KEY") || decoded.includes("BEGIN RSA PRIVATE KEY")) {
        key = decoded;
      }
    } catch {
      // base64가 아니면 그대로 진행
    }
  }

  // 리터럴 \n → 실제 개행
  key = key.replace(/\\n/g, "\n");

  return key;
}

function getFirebaseAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY
  );

  return { projectId, clientEmail, privateKey };
}

function assertFirebaseAdminConfig({ projectId, clientEmail, privateKey }) {
  const missing = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64");

  if (missing.length) {
    throw new Error(
      `[firebase-admin] Missing env on server runtime: ${missing.join(", ")}. ` +
        `Amplify Hosting → Environment variables에 등록 후 재배포하세요. ` +
        `Private key는 FIREBASE_PRIVATE_KEY_BASE64 사용을 권장합니다. (docs/AMPLIFY_ENV.md)`
    );
  }

  if (!privateKey.includes("BEGIN") || !privateKey.includes("PRIVATE KEY")) {
    throw new Error(
      "[firebase-admin] FIREBASE_PRIVATE_KEY looks invalid (PEM header missing). " +
        "Use FIREBASE_PRIVATE_KEY_BASE64 or a single-line key with \\n escapes."
    );
  }
}

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];

  const config = getFirebaseAdminConfig();
  assertFirebaseAdminConfig(config);

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: config.projectId,
        private_key: config.privateKey,
        client_email: config.clientEmail,
      }),
    });
  } catch (error) {
    const message = error?.message || String(error);
    throw new Error(
      `[firebase-admin] Failed to initialize: ${message}. ` +
        `Check Amplify SSR/runtime env and private key formatting. (docs/AMPLIFY_ENV.md)`
    );
  }
}

export { admin };
export const getDb = () => getAdminApp().firestore();
export const getAuth = () => getAdminApp().auth();
