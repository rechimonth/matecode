import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
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

export const vincularContrasenaAUsuario = async (password: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario activo en sesion");
  }

  if (!user.email) {
    throw new Error("El usuario no tiene correo electronico asociado");
  }

  const credential = EmailAuthProvider.credential(user.email, password);

  try {
    await linkWithCredential(user, credential);
    return user;
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (message.includes("email-already-in-use")) {
        throw new Error("Este correo ya esta vinculado a otra cuenta. Usa otro correo o inicia sesion con ese proveedor.");
      }
      if (message.includes("invalid-credential")) {
        throw new Error("Credenciales invalidas. Verifica la contrasena.");
      }
      if (message.includes("operation-not-allowed")) {
        throw new Error("El proveedor de correo no esta habilitado en Firebase.");
      }
      throw error;
    }
    throw new Error("Error desconocido al vincular la contrasena");
  }
};
