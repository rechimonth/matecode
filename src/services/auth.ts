import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

function translateAuthError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("auth/invalid-email")) return "El correo electronico no tiene un formato valido.";
    if (message.includes("auth/user-disabled")) return "Tu cuenta fue deshabilitada. Contacta al administrador.";
    if (message.includes("auth/user-not-found")) return "No existe una cuenta con ese correo electronico.";
    if (message.includes("auth/wrong-password")) return "La contrasena es incorrecta.";
    if (message.includes("auth/invalid-credential")) return "Credenciales invalidas. Verifica el correo y la contrasena.";
    if (message.includes("auth/email-already-in-use")) return "Este correo ya esta registrado. Inicia sesion o recupera tu cuenta.";
    if (message.includes("auth/weak-password")) return "La contrasena debe tener al menos 6 caracteres.";
    if (message.includes("auth/operation-not-allowed")) return "El proveedor de autenticacion no esta habilitado.";
    if (message.includes("auth/popup-closed-by-user")) return "Cerraste la ventana de inicio de sesion con Google.";
    if (message.includes("auth/cancelled-popup-request")) return "La solicitud de inicio con Google fue cancelada.";
    if (message.includes("auth/network-request-failed")) return "Error de red. Verifica tu conexion e intenta de nuevo.";
    if (message.includes("auth/too-many-requests")) return "Demasiados intentos. Espera unos minutos antes de volver a intentar.";
    return message;
  }
  return "Error desconocido al iniciar sesion";
}

export const login = async (email: string, password: string) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(translateAuthError(error));
  }
};

export const register = async (email: string, password: string) => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(translateAuthError(error));
  }
};

export const loginWithGoogle = async () => {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  } catch (error) {
    throw new Error(translateAuthError(error));
  }
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
