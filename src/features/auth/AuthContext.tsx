import { useState, useEffect } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext } from "react";
import { User, AuthContextType } from "../../types";
import { login, register, loginWithGoogle, logout } from "../../services/auth";
import { useToast } from "../../components/ui/Toast";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      setUser(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      showToast("success", "SesiÃ³n iniciada correctamente");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesiÃ³n";
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
      showToast("success", "SesiÃ³n iniciada con Google");
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
      showToast("info", "SesiÃ³n cerrada");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cerrar sesiÃ³n";
      setError(message);
      showToast("error", message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login: handleLogin, register: handleRegister, loginWithGoogle: handleGoogleLogin, logout: handleLogout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
