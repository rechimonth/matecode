import { useTasks } from "../features/tasks/TasksContext";

const options = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "completed", label: "Completadas" },
] as const;

export const TaskFilters = () => {
  const { filters, setStatusFilter } = useTasks();

  return (
    <div className="flex items-center gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setStatusFilter(option.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filters.status === option.value
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
