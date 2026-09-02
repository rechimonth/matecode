import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksPage } from "../src/pages/TasksPage";
import type { Task } from "../src/types";

const { updateTask } = vi.hoisted(() => ({ updateTask: vi.fn().mockResolvedValue(undefined) }));

const task: Task = {
  id: "task-1",
  title: "Comprar yerba",
  description: "Comprar yerba para la semana",
  status: "pending",
  userId: "user-1",
  createdAt: new Date("2026-08-20T10:00:00"),
  updatedAt: new Date("2026-08-21T10:00:00"),
  priority: "medium",
};

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "user-1", email: "user@example.com", displayName: "User", photoURL: null } }),
}));

vi.mock("../src/features/tasks/TasksContext", () => ({
  useTasks: () => ({
    tasks: [task],
    loading: false,
    error: null,
    filters: { status: "all" },
    setStatusFilter: vi.fn(),
    addTask: vi.fn(),
    updateTask,
    deleteTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    reorderTask: vi.fn(),
    clearError: vi.fn(),
    isTaskLoading: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock("../src/components/Header", () => ({ Header: () => <div>Header</div> }));
vi.mock("../src/components/EmailButton", () => ({ EmailButton: () => <button>email</button> }));
vi.mock("../src/components/TaskFilters", () => ({ TaskFilters: () => <div>filters</div> }));
vi.mock("../src/components/TaskSummary", () => ({ TaskSummary: () => <div>summary</div> }));
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn((sensor, options) => ({ sensor, options })),
  useSensors: vi.fn((...sensors) => sensors),
}));
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: undefined }),
}));
vi.mock("@dnd-kit/utilities", () => ({ CSS: { Transform: { toString: vi.fn(() => undefined) } } }));
vi.mock("../src/components/DeleteButton", () => ({ DeleteButton: () => <button>Eliminar</button> }));
vi.mock("../src/components/ui/Toast", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

describe("Task edit end-to-end UI flow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("detects the original missing-edit regression and completes Edit → Save", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await user.click(screen.getByRole("button", { name: "Editar tarea: Comprar yerba" }));
    expect(screen.getByRole("heading", { name: "Editar tarea" })).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Comprar yerba");

    const title = screen.getByLabelText("Título");
    await user.clear(title);
    await user.type(title, "Comprar yerba y azúcar");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(updateTask).toHaveBeenCalledWith("task-1", expect.objectContaining({
      title: "Comprar yerba y azúcar",
      description: "Comprar yerba para la semana",
      priority: "medium",
    }));
  });

  it("Edit → Cancel exits editing instead of creating or retaining stale data", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await user.click(screen.getByRole("button", { name: "Editar tarea: Comprar yerba" }));
    await user.click(screen.getByRole("button", { name: "Cancelar edición de tarea" }));
    expect(screen.getByRole("heading", { name: "Nueva tarea" })).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");
  });
});
