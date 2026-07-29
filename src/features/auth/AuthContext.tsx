import { useState, useEffect } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext } from "react";
import { AppUser, AuthContextType } from "../../types";
import { login, register, loginWithGoogle, logout, vincularContrasenaAUsuario } from "../../services/auth";
import { useToast } from "../../components/ui/Toast";

const AuthContext = createContext<AuthContextType | null>(null);

const mapFirebaseUser = (fbUser: import("firebase/auth").User | null): AppUser | null => {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    providerData: fbUser.providerData.map((p) => ({
      providerId: p.providerId,
      uid: p.uid,
      displayName: p.displayName,
      email: p.email,
      photoURL: p.photoURL,
    })),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(mapFirebaseUser(fbUser));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      showToast("success", "Sesión iniciada correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      showToast("error", message);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      setError(null);
      await register(email, password);
      showToast("success", "Cuenta creada correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar usuario";
      setError(message);
      showToast("error", message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
      showToast("success", "Sesión iniciada con Google");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error con Google Login";
      setError(message);
      showToast("error", message);
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      showToast("info", "Sesión cerrada");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cerrar sesión";
      setError(message);
      showToast("error", message);
    }
  };

  const handleLinkPassword = async (password: string) => {
    try {
      setError(null);
      await vincularContrasenaAUsuario(password);
      showToast("success", "Contrasena vinculada correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al vincular la contrasena";
      setError(message);
      showToast("error", message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login: handleLogin, register: handleRegister, loginWithGoogle: handleGoogleLogin, logout: handleLogout, linkPassword: handleLinkPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
