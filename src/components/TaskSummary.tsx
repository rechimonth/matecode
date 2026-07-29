import { useTaskStats } from "../hooks/useTaskStats";

export const TaskSummary = () => {
  const { total, pending, completed } = useTaskStats();

  const items = [
    { label: "Todas", value: total },
    { label: "Pendientes", value: pending },
    { label: "Completadas", value: completed },
  ] as const;

  return (
    <div className="flex items-center gap-2 mt-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm"
        >
          <span className="font-medium">{item.value}</span>{" "}
          <span className="text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
