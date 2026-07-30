import { initializeApp, credential } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let adminDb: ReturnType<typeof getFirestore> | null = null;

export function getAdminDb() {
  if (adminDb) return adminDb;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("Server misconfiguration: FIREBASE_SERVICE_ACCOUNT_KEY is required");
  }

  let serviceAccount: {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  try {
    serviceAccount = JSON.parse(serviceAccountJson) as typeof serviceAccount;
  } catch {
    throw new Error("Server misconfiguration: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }

  const app = initializeApp({
    credential: credential.cert(serviceAccount as Parameters<typeof credential.cert>[0]),
    projectId: serviceAccount.project_id,
  });

  adminDb = getFirestore(app);
  return adminDb;
}
