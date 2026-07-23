import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export const login = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const register = async (email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const loginWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
};

export const logout = async () => {
  await signOut(auth);
};
