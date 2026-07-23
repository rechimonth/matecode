import { useTasks } from "../features/tasks/TasksContext";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="card text-red-600">{error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="card text-center text-gray-500">
        <p className="text-lg">No hay tareas para mostrar</p>
        <p className="text-sm mt-1">Creá una tarea para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
      ))}
    </div>
  );
};
