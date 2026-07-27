import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("TaskFilters", () => {
  let mockUseTasks: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseTasks = vi.fn();
    vi.doMock("../../src/features/tasks/TasksContext", () => ({
      useTasks: mockUseTasks,
    }));
  });

  it("renders all filter options", async () => {
    mockUseTasks.mockReturnValue({
      filters: { status: "all" },
      setStatusFilter: vi.fn(),
      tasks: [],
      loading: false,
      error: null,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { TaskFilters } = await import("../../src/components/TaskFilters");
    render(<TaskFilters />);

    expect(screen.getByText("Todas")).toBeTruthy();
    expect(screen.getByText("Pendientes")).toBeTruthy();
    expect(screen.getByText("Completadas")).toBeTruthy();
  });

  it("calls setStatusFilter when clicking a filter", async () => {
    const setStatusFilter = vi.fn();
    mockUseTasks.mockReturnValue({
      filters: { status: "all" },
      setStatusFilter,
      tasks: [],
      loading: false,
      error: null,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { TaskFilters } = await import("../../src/components/TaskFilters");
    render(<TaskFilters />);

    act(() => {
      screen.getByText("Pendientes").click();
    });
    expect(setStatusFilter).toHaveBeenCalledWith("pending");
  });

  it("highlights active filter", async () => {
    mockUseTasks.mockReturnValue({
      filters: { status: "completed" },
      setStatusFilter: vi.fn(),
      tasks: [],
      loading: false,
      error: null,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleTaskStatus: vi.fn(),
      reorderTask: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { TaskFilters } = await import("../../src/components/TaskFilters");
    render(<TaskFilters />);

    const completedButton = screen.getByText("Completadas");
    expect(completedButton.className).toContain("bg-primary");
  });
});
