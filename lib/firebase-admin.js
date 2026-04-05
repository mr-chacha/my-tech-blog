import admin from "firebase-admin";

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
export const getDb = () => getAdminApp().firestore();
export const getAuth = () => getAdminApp().auth();
