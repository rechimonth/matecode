import { vi } from "vitest";

export const initializeApp = vi.fn(() => ({}));
export const getAuth = vi.fn(() => ({}));
export const GoogleAuthProvider = vi.fn(() => ({}));
export const getFirestore = vi.fn(() => ({}));
export const onAuthStateChanged = vi.fn((_auth: unknown, cb: (user: unknown) => void) => {
  cb(null);
  return () => {};
});
export const signInWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } }));
export const createUserWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } }));
export const signInWithPopup = vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } }));
export const signOut = vi.fn(() => Promise.resolve());
export const collection = vi.fn(() => ({}));
export const addDoc = vi.fn(() => Promise.resolve({ id: "test-id" }));
export const updateDoc = vi.fn(() => Promise.resolve());
export const deleteDoc = vi.fn(() => Promise.resolve());
export const doc = vi.fn(() => ({}));
export const query = vi.fn(() => ({}));
export const where = vi.fn(() => ({}));
export const orderBy = vi.fn(() => ({}));
export const getDocs = vi.fn(() => Promise.resolve({ docs: [] }));
export const Timestamp = {
  now: vi.fn(() => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 })),
  fromDate: vi.fn(() => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 })),
};
