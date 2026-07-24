import { useTasks } from "../features/tasks/TasksContext";
import { Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const SortableTodoItem = ({ task }: { task: Task }) => {
  const { deleteTask, toggleTaskStatus } = useTasks();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
    </div>
  );
};

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
        <p className="text-sm mt-1">Creá una tarea para comenzar</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <SortableTodoItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
