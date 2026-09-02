import { useRef, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";
import { formatDateForInput, parseDateInput } from "../utils/dates";
import { validateTaskDescription, validateTaskTitle } from "../utils/validators";
import { XCircle, Loader2 } from "lucide-react";

interface TodoFormProps {
  initialTask?: Task;
  onCancel: () => void;
}

const getInitialDueDate = (task?: Task) => (task?.dueDate ? formatDateForInput(task.dueDate) : "");

export const TodoForm = ({ initialTask, onCancel }: TodoFormProps) => {
  const { user } = useAuth();
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [dueDate, setDueDate] = useState(getInitialDueDate(initialTask));
  const [priority, setPriority] = useState<Task["priority"]>(initialTask?.priority ?? "medium");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const isEditing = Boolean(initialTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!user) {
      setError("Necesitás iniciar sesión para gestionar tareas");
      return;
    }

    const titleValidation = validateTaskTitle(title);
    const descriptionValidation = validateTaskDescription(description);
    if (!titleValidation.valid) {
      setError(titleValidation.message);
      return;
    }
    if (!descriptionValidation.valid) {
      setError(descriptionValidation.message);
      return;
    }
    if (!priority) {
      setError("Seleccioná una prioridad válida");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        ...(dueDate ? { dueDate: parseDateInput(dueDate) } : {}),
        priority,
      };

      if (initialTask) {
        await updateTask(initialTask.id, taskData);
      } else {
        await addTask({ ...taskData, status: "pending", userId: user.uid });
      }
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setError(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    onCancel();
  };

  return (
    <div ref={formRef} className="card mb-6">
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{isEditing ? "Editar tarea" : "Nueva tarea"}</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input id="task-title" className="input" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Actualizar reporte" autoComplete="off" maxLength={120} required />
          </div>
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="task-description" className="input" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." rows={3} maxLength={2000} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
              <input id="task-due-date" className="input" type="date" name="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select id="task-priority" className="input" name="priority" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="btn btn-primary inline-flex items-center justify-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />{isEditing ? "Guardando..." : "Creando..."}</> : isEditing ? "Guardar cambios" : "Crear tarea"}
            </button>
            <button type="button" onClick={handleCancelClick} disabled={isSubmitting} aria-label={isEditing ? "Cancelar edición de tarea" : "Cancelar creación de tarea"} className="btn btn-secondary inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <XCircle className="w-4 h-4" aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
