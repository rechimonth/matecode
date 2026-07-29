import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Task, TasksContextType, TaskStatus } from "../../types";
import { createTask, updateTask as updateTaskService, deleteTask as deleteTaskService, getTasksByUser } from "../../services/tasks";
import { useAuth } from "../auth/AuthContext";

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const refreshTasks = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasksByUser(userId);
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar tareas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    setError(null);
    await createTask(task as Task);
    if (task.userId) await refreshTasks(task.userId);
  };

  const updateTask = async (id: string, data: Partial<Pick<Task, "title" | "description" | "status" | "dueDate" | "priority">>) => {
    setError(null);
    await updateTaskService(id, data);
    const userTask = tasks.find((t) => t.id === id);
    if (userTask?.userId) await refreshTasks(userTask.userId);
  };

  const deleteTask = async (id: string) => {
    setError(null);
    const userTask = tasks.find((t) => t.id === id);
    const userId = userTask?.userId;
    // Optimistic update
    if (userId) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    try {
      await deleteTaskService(id);
    } catch (err) {
      // Restaurar estado en caso de error
      if (userId) {
        await refreshTasks(userId);
      }
      throw err;
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === "pending" ? "completed" : "pending";
    await updateTaskService(id, { status: nextStatus });
    if (task.userId) await refreshTasks(task.userId);
  };

  const reorderTask = async (activeId: string, _overId: string) => {
    const userTask = tasks.find((t) => t.id === activeId);
    if (!userTask?.userId) return;
    await refreshTasks(userTask.userId);
  };

  const clearError = () => setError(null);

  const filteredTasks = tasks.filter((_task) => {
    if (statusFilter === "all") return true;
    return _task.status === statusFilter;
  });

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByUser(user.uid);
        if (!cancelled) setTasks(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar tareas";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return (
    <TasksContext.Provider value={{ tasks: filteredTasks, loading, error, filters: { status: statusFilter }, setStatusFilter, addTask, updateTask, deleteTask, toggleTaskStatus, clearError, reorderTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used within a TasksProvider");
  return context;
};
