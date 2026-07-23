import { useState } from "react";
import { Header } from "../components/Header";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { TaskFilters } from "../components/TaskFilters";
import { useTaskStats } from "../hooks/useTaskStats";
import { EmailButton } from "../components/EmailButton";
import { Task } from "../types";

export const TasksPage = () => {
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const stats = useTaskStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tareas</h2>
            <p className="text-sm text-gray-600 mt-1">{stats.pending} pendientes, {stats.completed} completadas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <EmailButton />
            <TaskFilters />
          </div>
        </div>
        <TodoForm initialTask={editingTask} onCancel={() => setEditingTask(undefined)} />
        <TodoList />
      </main>
    </div>
  );
};
