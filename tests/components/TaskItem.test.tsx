import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem } from "../../src/components/TaskItem";
import type { Task } from "../../src/types";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: vi.fn(() => undefined) } },
}));

const toggleTaskStatus = vi.fn().mockResolvedValue(undefined);
const deleteTask = vi.fn().mockResolvedValue(undefined);
const isTaskLoading = vi.fn().mockReturnValue(false);

vi.mock("../../src/features/tasks/TasksContext", () => ({
  useTasks: () => ({ deleteTask, toggleTaskStatus, isTaskLoading }),
}));

vi.mock("../../src/components/DeleteButton", () => ({
  DeleteButton: ({ onConfirm, title, disabled }: { onConfirm: () => void; title: string; disabled?: boolean }) => (
    <button type="button" aria-label={`Eliminar tarea: ${title}`} onClick={onConfirm} disabled={disabled}>Eliminar</button>
  ),
}));

vi.mock("../../src/components/ui/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const task: Task = {
  id: "task-1",
  title: "Preparar examen",
  description: "Repasar React y TypeScript",
  status: "pending",
  userId: "user-1",
  createdAt: new Date("2026-08-30T12:00:00"),
  updatedAt: new Date("2026-08-30T12:00:00"),
  priority: "high",
};

const renderTask = (overrides: Partial<Task> = {}) => {
  const onEdit = vi.fn();
  render(<TaskItem task={{ ...task, ...overrides }} onEdit={onEdit} />);
  return onEdit;
};

describe("TaskItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a pending task", () => {
    renderTask();
    expect(screen.getByRole("heading", { name: "Preparar examen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /marcar tarea como completada/i })).toBeInTheDocument();
  });

  it("renders a completed task", () => {
    renderTask({ status: "completed" });
    expect(screen.getByRole("button", { name: /marcar tarea como pendiente/i })).toBeInTheDocument();
  });

  it("exposes an accessible Edit action and calls onEdit with the selected task", async () => {
    const user = userEvent.setup();
    const onEdit = renderTask();
    await user.click(screen.getByRole("button", { name: "Editar tarea: Preparar examen" }));
    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it("toggles completion with a normal click", async () => {
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("button", { name: /marcar tarea como completada/i }));
    expect(toggleTaskStatus).toHaveBeenCalledWith("task-1", "pending");
  });

  it("renders and invokes delete", async () => {
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("button", { name: "Eliminar tarea: Preparar examen" }));
    expect(deleteTask).toHaveBeenCalledWith("task-1");
  });

  it("disables the edit action while task loading", () => {
    isTaskLoading.mockReturnValue(true);
    renderTask();
    expect(screen.getByRole("button", { name: "Editar tarea: Preparar examen" })).toBeDisabled();
  });
});
