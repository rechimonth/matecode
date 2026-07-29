import { useState, useRef, useCallback } from "react";
import { useTasks } from "../features/tasks/TasksContext";
import { useAuth } from "../features/auth/AuthContext";
import { useToast } from "./ui/Toast";
import { Mail, Loader2, XCircle } from "lucide-react";

export const EmailButton = () => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    if (!user?.email || !user?.uid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      showToast("error", "Email inválido");
      return;
    }

    setSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api/send-summary";
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          userId: user.uid,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar el email");
      showToast("success", "Email enviado correctamente");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        showToast("error", "La solicitud tardó demasiado. Intentá de nuevo.");
      } else {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        showToast("error", msg);
      }
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSending(false);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || tasks.length === 0}
        className="btn btn-primary inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Enviar resumen por email
          </>
        )}
      </button>
      
      {sending && (
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Cancelar
        </button>
      )}
    </div>
  );
};
