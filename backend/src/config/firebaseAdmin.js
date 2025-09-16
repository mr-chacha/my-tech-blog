const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

// Admin SDK 함수들을 export
module.exports = {
  admin,
  db,
  // Firestore 함수들을 Admin SDK 방식으로 래핑
  collection: (collectionName) => db.collection(collectionName),
  query: (ref) => ref,
  orderBy: (field, direction = 'desc') => (ref) => ref.orderBy(field, direction),
  getDocs: async (query) => await query.get(),
  doc: (collectionName, docId) => db.collection(collectionName).doc(docId),
  getDoc: async (docRef) => await docRef.get(),
  addDoc: async (collectionRef, data) => await collectionRef.add(data),
  deleteDoc: async (docRef) => await docRef.delete(),
  updateDoc: async (docRef, data) => await docRef.update(data)
};