import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("EmailButton", () => {
  let mockUseTasks: ReturnType<typeof vi.fn>;
  let mockUseAuth: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseTasks = vi.fn();
    mockUseAuth = vi.fn();
    mockShowToast = vi.fn();
    vi.doMock("../../src/features/tasks/TasksContext", () => ({
      useTasks: mockUseTasks,
    }));
    vi.doMock("../../src/features/auth/AuthContext", () => ({
      useAuth: mockUseAuth,
    }));
    vi.doMock("../../src/components/ui/Toast", () => ({
      useToast: () => ({ showToast: mockShowToast }),
      ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    }));
    vi.doMock("../../src/services/firebase", () => ({
      auth: {
        currentUser: {
          getIdToken: vi.fn().mockResolvedValue("test-id-token"),
        },
      },
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
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A", uid: "uid-1" } } as any);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ message: "Email sent" })),
        json: () => Promise.resolve({ message: "Email sent" }),
      } as Response)
    );

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    await act(async () => {
      screen.getByText("Enviar resumen por email").click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockShowToast).toHaveBeenCalledWith("success", "Email enviado correctamente");
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
    mockUseAuth.mockReturnValue({ user: { email: "a@b.com", displayName: "A", uid: "uid-1" } } as any);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: "server-error" })),
        json: () => Promise.resolve({ error: "server-error" }),
      } as Response)
    );

    const { EmailButton } = await import("../../src/components/EmailButton");
    render(<EmailButton />);

    await act(async () => {
      screen.getByText("Enviar resumen por email").click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockShowToast).toHaveBeenCalledWith("error", "server-error");
  });
});
