import { Task } from "../types";
import { useTasks } from "../features/tasks/TasksContext";

export const TodoItem = ({ task }: { task: Task }) => {
  const { deleteTask, toggleTaskStatus } = useTasks();

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-semibold ${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
        <div className="text-xs text-gray-500 mt-2">
          Actualizado: {task.updatedAt.toLocaleDateString("es-ES")}
          {task.dueDate && <span className="ml-3">Vence: {task.dueDate.toLocaleDateString("es-ES")}</span>}
          {task.priority && <span className="ml-3 capitalize">{task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"} prioridad</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => toggleTaskStatus(task.id)} className="btn btn-secondary text-xs">
          {task.status === "completed" ? "Marcar pendiente" : "Marcar completada"}
        </button>
        <button onClick={() => deleteTask(task.id)} className="btn btn-danger text-xs">
          Eliminar
        </button>
      </div>
    </div>
  );
};
