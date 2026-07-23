export const initializeApp = () => ({});
export const getAuth = () => ({});
export const getFirestore = () => ({});
export const GoogleAuthProvider = class {};
export const signInWithEmailAndPassword = async () => ({ user: { uid: "test-uid", email: "test@example.com" } });
export const createUserWithEmailAndPassword = async () => ({ user: { uid: "test-uid", email: "test@example.com" } });
export const signInWithPopup = async () => ({ user: { uid: "test-uid", email: "test@example.com" } });
export const signOut = async () => {};
export const onAuthStateChanged = () => () => {};
export const collection = () => ({});
export const addDoc = async () => ({ id: "test-id" });
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const doc = () => ({});
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const getDocs = async () => ({ docs: [] });
export const Timestamp = {
  now: () => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 }),
  fromDate: () => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 }),
};
