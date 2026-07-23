import { useTasks } from "../features/tasks/TasksContext";

export const useTaskStats = () => {
  const { tasks } = useTasks();
  return {
    total: tasks.length,
    pending: tasks.filter((t: typeof tasks[number]) => t.status === "pending").length,
    completed: tasks.filter((t: typeof tasks[number]) => t.status === "completed").length,
  };
};
