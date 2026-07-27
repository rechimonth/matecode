import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("EmailButton", () => {
  let mockUseTasks: ReturnType<typeof vi.fn>;
  let mockUseAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseTasks = vi.fn();
    mockUseAuth = vi.fn();
    vi.doMock("../../src/features/tasks/TasksContext", () => ({
      useTasks: mockUseTasks,
    }));
    vi.doMock("../../src/features/auth/AuthContext", () => ({
      useAuth: mockUseAuth,
    }));
  });

  it("renders disabled when no tasks", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      filters: { status: "all" },
      setStatusFilter: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A" } } as any);

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    const button = screen.getByText("Enviar resumen por email");
    expect(button).toBeDisabled();
  });

  it("renders enabled when tasks exist", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [{ id: "1", title: "t1", status: "pending", updatedAt: new Date() }],
      loading: false,
      error: null,
      filters: { status: "all" },
      setStatusFilter: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A" } } as any);

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    const button = screen.getByText("Enviar resumen por email");
    expect(button).not.toBeDisabled();
  });

  it("shows success message on successful send", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [{ id: "1", title: "t1", status: "pending", updatedAt: new Date() }],
      loading: false,
      error: null,
      filters: { status: "all" },
      setStatusFilter: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A" } } as any);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    await act(async () => {
      screen.getByText("Enviar resumen por email").click();
    });
    expect(await screen.findByText("Email enviado correctamente")).toBeTruthy();
  });

  it("shows error message on failed send", async () => {
    mockUseTasks.mockReturnValue({
      tasks: [{ id: "1", title: "t1", status: "pending", updatedAt: new Date() }],
      loading: false,
      error: null,
      filters: { status: "all" },
      setStatusFilter: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A" } } as any);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "server-error" }),
      } as Response)
    );

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    await act(async () => {
      screen.getByText("Enviar resumen por email").click();
    });
    expect(await screen.findByText("server-error")).toBeTruthy();
  });
});
