import { useTasks } from "../features/tasks/TasksContext";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "../types";
import { TaskItem } from "./TaskItem";
import { ClipboardList } from "lucide-react";

interface TodoListProps {
  onEdit: (task: Task) => void;
}

export const TodoList = ({ onEdit }: TodoListProps) => {
  const { tasks, loading, error, reorderTask } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      void reorderTask(active.id as string, over.id as string);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando tareas">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12" role="alert">
        <div className="text-red-500 mb-4" aria-hidden="true">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">Error al cargar tareas</p>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 mb-4" aria-hidden="true">
          <ClipboardList className="w-16 h-16 mx-auto" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay tareas</h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">Creá tu primera tarea para comenzar a organizar tu trabajo.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
