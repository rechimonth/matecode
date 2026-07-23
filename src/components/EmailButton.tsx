import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";

export const EmailButton = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!user) return;
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api/send-summary";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          tasks: tasks.map((t: Task) => ({
            title: t.title,
            status: t.status,
            updatedAt: t.updatedAt.toISOString(),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar el email");
      setMessage("Email enviado correctamente");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
    } finally {
      setSending(false);
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 4000);
    }
  };

  return (
    <div>
      <button onClick={handleSend} disabled={sending || tasks.length === 0} className="btn btn-primary">
        {sending ? "Enviando..." : "Enviar resumen por email"}
      </button>
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};
