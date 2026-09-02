import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { currentUser } = vi.hoisted(() => ({ currentUser: { value: null as { uid: string } | null } }));
const getTasksByUser = vi.hoisted(() => vi.fn());

vi.mock("firebase/auth", () => ({ getAuth: vi.fn(() => ({})), onAuthStateChanged: vi.fn() }));
vi.mock("../src/features/auth/AuthContext", () => ({ useAuth: () => ({ user: currentUser.value }) }));
vi.mock("../src/services/tasks", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  getTasksByUser,
}));

import { TasksProvider, useTasks } from "../src/features/tasks/TasksContext";

const Consumer = () => {
  const { tasks, loading } = useTasks();
  return <span data-testid="tasks">{loading ? "loading" : tasks.map((task) => task.id).join(",")}</span>;
};

const task = (id: string, userId: string) => ({
  id,
  title: id,
  description: "description",
  status: "pending" as const,
  userId,
  createdAt: new Date("2026-08-01"),
  updatedAt: new Date("2026-08-01"),
});

describe("TasksContext user isolation", () => {
  beforeEach(() => {
    currentUser.value = { uid: "user-a" };
    getTasksByUser.mockReset();
  });

  it("clears user A tasks on logout and loads only user B tasks after login", async () => {
    getTasksByUser.mockImplementation(async (uid: string) => {
      if (uid === "user-a") return [task("task-a", "user-a")];
      if (uid === "user-b") return [task("task-b", "user-b")];
      return [];
    });

    const { rerender } = render(<TasksProvider><Consumer /></TasksProvider>);
    await waitFor(() => expect(screen.getByTestId("tasks")).toHaveTextContent("task-a"));

    currentUser.value = null;
    rerender(<TasksProvider><Consumer /></TasksProvider>);
    await waitFor(() => expect(screen.getByTestId("tasks")).not.toHaveTextContent("task-a"));

    currentUser.value = { uid: "user-b" };
    rerender(<TasksProvider><Consumer /></TasksProvider>);
    await waitFor(() => expect(screen.getByTestId("tasks")).toHaveTextContent("task-b"));
    expect(screen.getByTestId("tasks")).not.toHaveTextContent("task-a");
    expect(getTasksByUser).toHaveBeenLastCalledWith("user-b");
  });
});
