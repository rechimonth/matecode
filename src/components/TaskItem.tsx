import { useState, useCallback } from "react";
import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeleteButton } from "./DeleteButton";
import { CheckCircle2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { deleteTask, toggleTaskStatus, isTaskLoading } = useTasks();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = task.status === "completed";
  const loading = isTaskLoading(task.id);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleToggleComplete = async () => {
    await toggleTaskStatus(task.id);
  };

  const handleDelete = useCallback(async () => {
    setIsRemoving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await deleteTask(task.id);
  }, [deleteTask, task.id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        card flex flex-col sm:flex-row sm:items-center justify-between gap-4
        transition-all duration-300 ease-out hover:shadow-md
        ${isRemoving ? "opacity-0 scale-95" : isCompleted ? "opacity-75" : "opacity-100"}
      `}
    >
      <div className="flex-1 min-w-0">
        <h3
          className={`
            text-base font-semibold transition-colors duration-200
            ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}
          `}
          aria-live="polite"
        >
          {task.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
        <div className="text-xs text-gray-500 mt-2">
          Actualizado: {task.updatedAt.toLocaleDateString("es-ES")}
          {task.dueDate && <span className="ml-3">Vence: {task.dueDate.toLocaleDateString("es-ES")}</span>}
          {task.priority && (
            <span className="ml-3 capitalize">
              {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"} prioridad
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleComplete}
          disabled={loading}
          aria-pressed={isCompleted}
          aria-label={isCompleted ? "Marcar tarea como pendiente" : "Marcar tarea como completada"}
          className={`
            btn text-xs font-medium px-3 py-2 rounded-md transition-all duration-150 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center gap-1.5
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            ${isCompleted
              ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
              : "bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus:ring-yellow-400"
            }
          `}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Completada
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Marcar completada
            </>
          )}
        </button>

        <DeleteButton onConfirm={handleDelete} title={task.title} disabled={loading || isRemoving} />
      </div>
    </div>
  );
};
