import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";

export const TodoForm = ({ initialTask, onCancel }: { initialTask?: Task; onCancel?: () => void }) => {
  const { user } = useAuth();
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      setError("Título y descripción son requeridos");
      return;
    }
    try {
      if (initialTask) {
        await updateTask(initialTask.id, { title, description });
      } else {
        await addTask({
          title,
          description,
          status: "pending",
          userId: user.uid,
        });
      }
      setTitle("");
      setDescription("");
      onCancel?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar la tarea";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">{initialTask ? "Editar tarea" : "Nueva tarea"}</h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input className="input" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Actualizar reporte" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea className="input" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." rows={3} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">
            {initialTask ? "Guardar cambios" : "Crear tarea"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
