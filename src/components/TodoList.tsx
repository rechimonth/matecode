import { useTasks } from "../features/tasks/TasksContext";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskItem } from "./TaskItem";

export const TodoList = () => {
  const { tasks, loading, error, reorderTask } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTask(active.id as string, over.id as string);
    }
  };

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
        <p className="text-sm mt-1">CreÃ¡ una tarea para comenzar</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
