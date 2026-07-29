import { useTasks } from "../features/tasks/TasksContext";
import { ListFilter } from "lucide-react";

const options = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "completed", label: "Completadas" },
] as const;

export const TaskFilters = () => {
  const { filters, setStatusFilter } = useTasks();

  return (
    <div className="flex items-center gap-2">
      <ListFilter className="w-4 h-4 text-gray-500" />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setStatusFilter(option.value)}
          className={`
            px-3 py-1.5 text-sm rounded-md transition-all duration-150 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${filters.status === option.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
