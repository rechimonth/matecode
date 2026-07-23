declare module "firebase/app" {
  export function initializeApp(options: Record<string, unknown>, name?: string): unknown;
}

declare module "firebase/auth" {
  export function getAuth(app: unknown): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void, error?: (error: Error) => void, completed?: () => void): () => void;
  export class Auth {
    static getAuth(app: unknown): Auth;
  }
  export class GoogleAuthProvider {
    constructor();
    providerId: string;
  }
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  export interface UserCredential {
    user: User;
  }
  export interface AuthProvider {
    providerId: string;
  }
}

declare module "firebase/firestore" {
  export function getFirestore(app: unknown): unknown;
  export function collection(db: unknown, path: string): unknown;
  export function addDoc(col: unknown, data: unknown): Promise<{ id: string }>;
  export function updateDoc(ref: unknown, data: unknown): Promise<void>;
  export function deleteDoc(ref: unknown): Promise<void>;
  export function doc(db: unknown, path: string, ...pathSegments: unknown[]): unknown;
  export function query(col: unknown, ...constraints: unknown[]): unknown;
  export function where(field: string, op: string, value: unknown): unknown;
  export function orderBy(field: string, direction?: string): unknown;
  export function getDocs(q: unknown): Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }>;
  export class Timestamp {
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    toDate(): Date;
  }
}
