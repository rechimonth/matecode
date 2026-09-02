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
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());

  const refreshTasks = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasksByUser(userId);
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar tareas";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addLoadingTask = useCallback((id: string) => {
    setLoadingTasks((prev) => new Set(prev).add(id));
  }, []);

  const removeLoadingTask = useCallback((id: string) => {
    setLoadingTasks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isTaskLoading = useCallback((id: string) => loadingTasks.has(id), [loadingTasks]);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!user?.uid) throw new Error("Necesitás iniciar sesión para crear tareas");
    setError(null);
    await createTask({ ...task, userId: user.uid });
    await refreshTasks(user.uid);
  }, [refreshTasks, user]);

  const updateTask = useCallback(async (id: string, data: Partial<Pick<Task, "title" | "description" | "status" | "dueDate" | "priority">>) => {
    if (!user?.uid) throw new Error("Necesitás iniciar sesión para actualizar tareas");
    setError(null);
    await updateTaskService(id, data);
    await refreshTasks(user.uid);
  }, [refreshTasks, user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user?.uid) throw new Error("Necesitás iniciar sesión para eliminar tareas");
    setError(null);
    const previousTasks = [...tasks];
    try {
      await deleteTaskService(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : "Error al eliminar la tarea";
      setError(message);
      throw err;
    }
  }, [tasks, user]);

  const toggleTaskStatus = useCallback(async (id: string, currentStatus?: TaskStatus) => {
    if (!user?.uid) throw new Error("Necesitás iniciar sesión para actualizar tareas");
    const existingTask = tasks.find((task) => task.id === id);
    const effectiveStatus = currentStatus ?? existingTask?.status ?? "pending";
    const previousTasks = tasks.map((t) => ({ ...t }));
    const nextStatus: TaskStatus = effectiveStatus === "pending" ? "completed" : "pending";

    addLoadingTask(id);
    setError(null);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));

    try {
      await updateTaskService(id, { status: nextStatus });
    } catch (err) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : "Error al actualizar la tarea";
      setError(message);
      throw err;
    } finally {
      removeLoadingTask(id);
    }
  }, [addLoadingTask, removeLoadingTask, tasks, user]);

  const reorderTask = useCallback(async (activeId: string, _overId: string) => {
    if (!user?.uid || !tasks.some((task) => task.id === activeId)) return;
    await refreshTasks(user.uid);
  }, [refreshTasks, tasks, user]);

  const clearError = useCallback(() => setError(null), []);

  const filteredTasks = tasks.filter((task) => statusFilter === "all" || task.status === statusFilter);
  const visibleTasks = user ? filteredTasks : [];
  const visibleError = user ? error : null;
  const visibleLoading = user ? loading : false;
  const visibleTaskLoading = user ? isTaskLoading : () => false;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.uid) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getTasksByUser(user.uid);
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar tareas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <TasksContext.Provider value={{
      tasks: visibleTasks,
      loading: visibleLoading,
      error: visibleError,
      filters: { status: statusFilter },
      setStatusFilter,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      clearError,
      reorderTask,
      isTaskLoading: visibleTaskLoading,
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used within a TasksProvider");
  return context;
};
