import { useState, useRef, useCallback } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../services/firebase";
import { useTasks } from "../features/tasks/TasksContext";
import { useAuth } from "../features/auth/AuthContext";
import { useToast } from "./ui/Toast";
import { validateEmail } from "../utils/validators";
import { Mail, Loader2, XCircle } from "lucide-react";

export const EmailButton = () => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user?.email) {
      showToast("error", "Necesitás una sesión autenticada con email para enviar el resumen");
      return;
    }
    if (!validateEmail(user.email)) {
      showToast("error", "Email inválido");
      return;
    }

    setSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const idToken = await getIdToken(currentUser);
      const apiUrl = import.meta.env.VITE_API_URL || "/api/send-summary";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: user.displayName }),
        signal: controller.signal,
      });

      const text = await res.text();
      let data: { error?: string; message?: string } = {};
      try {
        data = text ? (JSON.parse(text) as typeof data) : {};
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }
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
      clearTimeout(timeoutId);
      setSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setSending(false);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || tasks.length === 0}
        aria-busy={sending}
        className="btn btn-primary inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" aria-hidden="true" />
            Enviar resumen por email
          </>
        )}
      </button>
      {sending && (
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancelar envío del resumen"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <XCircle className="w-4 h-4" aria-hidden="true" />
          Cancelar
        </button>
      )}
    </div>
  );
};
