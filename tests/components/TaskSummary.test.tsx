import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskSummary } from "../../src/components/TaskSummary";

vi.mock("../../src/hooks/useTaskStats", () => ({
  useTaskStats: vi.fn(),
}));

describe("TaskSummary", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renders task counts", async () => {
    const { useTaskStats } = await import("../../src/hooks/useTaskStats");
    (useTaskStats as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      total: 3,
      pending: 2,
      completed: 1,
    });

    render(<TaskSummary />);

    const zeros = screen.queryAllByText("0");
    expect(zeros).toHaveLength(0);
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("Todas")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("Pendientes")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("Completadas")).toBeDefined();
  });

  it("renders zero counts when no tasks", async () => {
    const { useTaskStats } = await import("../../src/hooks/useTaskStats");
    (useTaskStats as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      total: 0,
      pending: 0,
      completed: 0,
    });

    render(<TaskSummary />);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
    expect(screen.getByText("Todas")).toBeDefined();
    expect(screen.getByText("Pendientes")).toBeDefined();
    expect(screen.getByText("Completadas")).toBeDefined();
  });
});
