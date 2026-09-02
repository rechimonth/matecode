import { useState } from "react";
import { Header } from "../components/Header";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { TaskFilters } from "../components/TaskFilters";
import { EmailButton } from "../components/EmailButton";
import { TaskSummary } from "../components/TaskSummary";
import { Task } from "../types";

export const TasksPage = () => {
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tareas</h2>
            <p className="text-sm text-gray-600 mt-1">Gestioná tus tareas y mantené tu equipo organizado</p>
            <TaskSummary />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <EmailButton />
            <TaskFilters />
          </div>
        </div>
        <div className="space-y-6">
          <TodoForm
            key={editingTask?.id ?? "new-task"}
            initialTask={editingTask}
            onCancel={() => setEditingTask(undefined)}
          />
          <TodoList onEdit={setEditingTask} />
        </div>
      </main>
    </div>
  );
};
