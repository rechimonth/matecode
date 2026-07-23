import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { TodoForm } from "../src/components/TodoForm";

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-uid", email: "test@example.com", displayName: null, photoURL: null },
    loading: false,
    error: null,
  }),
}));

vi.mock("../src/features/tasks/TasksContext", () => ({
  useTasks: () => ({
    tasks: [],
    loading: false,
    error: null,
    filters: { status: "all" as const },
    setStatusFilter: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    clearError: vi.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("TodoForm", () => {
  it("renders create form by default", () => {
    renderWithProviders(<TodoForm />);
    expect(screen.getByText("Nueva tarea")).toBeDefined();
    expect(screen.getByPlaceholderText("Ej: Actualizar reporte")).toBeDefined();
  });

  it("shows validation error when submitting empty fields", async () => {
    renderWithProviders(<TodoForm />);
    await userEvent.click(screen.getByRole("button", { name: /crear tarea/i }));
    expect(screen.getByText(/título y descripción son requeridos/i)).toBeDefined();
  });

  it("updates title input", async () => {
    renderWithProviders(<TodoForm />);
    const input = screen.getByPlaceholderText("Ej: Actualizar reporte");
    await userEvent.type(input, "Nueva tarea");
    expect(input).toHaveValue("Nueva tarea");
  });
});
