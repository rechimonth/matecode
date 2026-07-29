import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { XCircle, Loader2, KeyRound } from "lucide-react";

export const LinkPasswordForm = ({ onCancel }: { onCancel: () => void }) => {
  const { linkPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim() || !confirmPassword.trim()) {
      setError("La contrasena es requerida");
      return;
    }
    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setIsSubmitting(true);
    try {
      await linkPassword(password);
      onCancel();
    } catch {
      // error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-600" />
          Vincular contrasena
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cancelar vinculacion de contrasena"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Vinculá una contrasena a tu cuenta de Google para poder iniciar sesion con email y contrasena.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="Minimo 6 caracteres"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            placeholder="Repeti tu contrasena"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full inline-flex items-center justify-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Vinculando...
            </>
          ) : (
            "Vincular contrasena"
          )}
        </button>
      </form>
    </div>
  );
};
