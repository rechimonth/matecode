import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredKeys = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const isTestEnvironment = import.meta.env.MODE === "test";
const missingKeys = Object.entries(requiredKeys)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (!isTestEnvironment && missingKeys.length > 0) {
  throw new Error(
    `Configuración de Firebase incompleta. Faltan variables VITE_FIREBASE_* en el entorno de ejecución: ${missingKeys.join(", ")}`,
  );
}

const firebaseConfig = isTestEnvironment
  ? {
      apiKey: "test-api-key",
      authDomain: "test.firebaseapp.com",
      projectId: "test-project",
      storageBucket: "test-project.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000",
    }
  : {
      apiKey: requiredKeys.VITE_FIREBASE_API_KEY,
      authDomain: requiredKeys.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: requiredKeys.VITE_FIREBASE_PROJECT_ID,
      storageBucket: requiredKeys.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: requiredKeys.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: requiredKeys.VITE_FIREBASE_APP_ID,
    };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
