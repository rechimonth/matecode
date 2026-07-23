import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export const LoginPage = () => {
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim() || !password.trim()) {
      setLocalError("Email y contraseña son requeridos");
      return;
    }
    try {
      await login(email, password);
    } catch {
      // error handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MateCode</h1>
          <p className="text-gray-600 mt-2">Gestor de tareas para equipos</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-center">Iniciar Sesión</h2>
          {(error || localError) && <div className="error-message mb-4">{error || localError}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setLocalError(null); }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input className="input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLocalError(null); }} />
            </div>
            <button type="submit" className="btn btn-primary w-full">Entrar</button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">O continúa con</span></div>
            </div>
            <button onClick={loginWithGoogle} className="btn btn-secondary w-full mt-4">Google</button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tenés cuenta? <Link to="/register" className="text-primary hover:underline font-medium">Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
