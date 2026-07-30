import { useState, useRef } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";
import { XCircle, Loader2 } from "lucide-react";

interface TodoFormProps {
  initialTask?: Task;
  onCancel: () => void;
}

export const TodoForm = ({ initialTask, onCancel }: TodoFormProps) => {
  const { user } = useAuth();
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split("T")[0] : "");
  const [priority, setPriority] = useState<Task["priority"]>(initialTask?.priority || "medium");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const isEditing = !!initialTask;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      setError("Título y descripción son requeridos");
      return;
    }
    setIsSubmitting(true);
    try {
      if (initialTask) {
        await updateTask(initialTask.id, {
          title,
          description,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
          priority,
        });
      } else {
        await addTask({
          title,
          description,
          status: "pending",
          userId: user.uid,
          ...(dueDate ? { dueDate: new Date(dueDate) }: {}),
          priority,
        });
      }
      onCancel();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar la tarea";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setError(null);
  };

  return (
    <>
      <div
        ref={formRef}
        className="card mb-6"
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {initialTask ? "Editar tarea" : "Nueva tarea"}
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                className="input"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Actualizar reporte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                className="input"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles de la tarea..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                <input
                  className="input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  className="input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task["priority"])}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary inline-flex items-center justify-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {initialTask ? "Guardando..." : "Creando..."}
                  </>
                ) : (
                  initialTask ? "Guardar cambios" : "Crear tarea"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                aria-label={isEditing ? "Cancelar edición de tarea" : "Cancelar creación de tarea"}
                className="btn btn-secondary inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
