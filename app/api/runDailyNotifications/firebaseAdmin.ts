// lib/firebaseAdmin.ts
import admin from "firebase-admin";
if (!admin.apps.length) {
  const serviceAccount = {
  "type": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_TYPE,
  "project_id": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_AUTH_URI,
  "token_uri": process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN
}

if (!serviceAccount.auth_provider_x509_cert_url || 
  !serviceAccount.auth_uri || 
  !serviceAccount.client_email || 
  !serviceAccount.client_id ||
  !serviceAccount.client_x509_cert_url ||
  !serviceAccount.private_key ||
  !serviceAccount.private_key_id ||
  !serviceAccount.project_id ||
  !serviceAccount.token_uri ||
  !serviceAccount.type ||
  !serviceAccount.universe_domain)
  // sanity check
  console.warn("firebase admin parameter(s) missing")

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const firebaseAdmin = admin;
