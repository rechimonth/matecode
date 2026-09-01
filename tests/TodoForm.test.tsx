import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "../src/components/TodoForm";
import type { Task } from "../src/types";

const addTask = vi.fn();
const updateTask = vi.fn();

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "user-1", email: "user@example.com", displayName: "User", photoURL: null } }),
}));

vi.mock("../src/features/tasks/TasksContext", () => ({
  useTasks: () => ({ addTask, updateTask }),
}));

const baseTask: Task = {
  id: "task-1",
  title: "Tarea existente",
  description: "Descripción existente",
  status: "pending",
  userId: "user-1",
  createdAt: new Date("2026-08-20T10:00:00"),
  updatedAt: new Date("2026-08-21T10:00:00"),
  dueDate: new Date(2026, 8, 15),
  priority: "high",
};

describe("TodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addTask.mockResolvedValue(undefined);
    updateTask.mockResolvedValue(undefined);
  });

  it("renders create mode by default", () => {
    render(<TodoForm onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Nueva tarea" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear tarea" })).toBeInTheDocument();
  });

  it("hydrates all existing task values in edit mode", () => {
    render(<TodoForm initialTask={baseTask} onCancel={vi.fn()} />);
    expect(screen.getByLabelText("Título")).toHaveValue("Tarea existente");
    expect(screen.getByLabelText("Descripción")).toHaveValue("Descripción existente");
    expect(screen.getByLabelText("Prioridad")).toHaveValue("high");
    expect(screen.getByLabelText("Fecha de vencimiento")).toHaveValue("2026-09-15");
    expect(screen.getByRole("heading", { name: "Editar tarea" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });

  it("updates the selected task instead of creating a duplicate", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TodoForm initialTask={baseTask} onCancel={onCancel} />);

    const title = screen.getByLabelText("Título");
    await user.clear(title);
    await user.type(title, "Título modificado");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(updateTask).toHaveBeenCalledWith("task-1", {
      title: "Título modificado",
      description: "Descripción existente",
      dueDate: expect.any(Date),
      priority: "high",
    });
    expect(addTask).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("creates a new task in create mode", async () => {
    const user = userEvent.setup();
    render(<TodoForm onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("Título"), "Nueva");
    await user.type(screen.getByLabelText("Descripción"), "Descripción");
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));

    expect(addTask).toHaveBeenCalledWith({
      title: "Nueva",
      description: "Descripción",
      status: "pending",
      userId: "user-1",
      priority: "medium",
    });
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("blocks blank or oversized values", async () => {
    const user = userEvent.setup();
    render(<TodoForm onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(screen.getByRole("alert")).toHaveTextContent("El título es requerido");
    expect(addTask).not.toHaveBeenCalled();
  });

  it("cancels edit mode and invokes onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TodoForm initialTask={baseTask} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancelar edición de tarea" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Título")).toHaveValue("");
  });

  it("prevents a duplicate submission while saving", async () => {
    const user = userEvent.setup();
    let resolveUpdate: (() => void) | undefined;
    updateTask.mockImplementation(() => new Promise<void>((resolve) => { resolveUpdate = resolve; }));
    render(<TodoForm initialTask={baseTask} onCancel={vi.fn()} />);

    const save = screen.getByRole("button", { name: "Guardar cambios" });
    await user.click(save);
    await user.click(save);
    expect(updateTask).toHaveBeenCalledTimes(1);
    expect(save).toBeDisabled();
    resolveUpdate?.();
  });
});
