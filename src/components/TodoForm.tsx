import { useState, useEffect, useRef } from "react";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const isEditing = !!initialTask;
  const hasChanges = title !== (initialTask?.title || "") || description !== (initialTask?.description || "") || dueDate !== (initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split("T")[0] : "") || priority !== (initialTask?.priority || "medium");

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
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      performCancel();
    }
  };

  const performCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  useEffect(() => {
    if (!showConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirm(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm]);

  return (
    <>
      <div
        ref={formRef}
        className={`card mb-6 transition-all duration-300 ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 id="cancel-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar cancelación
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tenés cambios sin guardar. Si cancelás, se perderán las modificaciones.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={performCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Perder cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
