import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  addDoc: vi.fn(() => Promise.resolve({ id: "test-id" })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 })),
    fromDate: vi.fn(() => ({ toDate: () => new Date(), seconds: 0, nanoseconds: 0 })),
  },
}));

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import * as firebaseFirestore from "firebase/firestore";
import { TasksProvider, useTasks } from "../src/features/tasks/TasksContext";

const mockedCollection = vi.mocked(firebaseFirestore.collection) as unknown as ReturnType<typeof vi.fn>;
const mockedWhere = vi.mocked(firebaseFirestore.where) as unknown as ReturnType<typeof vi.fn>;
const mockedOrderBy = vi.mocked(firebaseFirestore.orderBy) as unknown as ReturnType<typeof vi.fn>;
const mockedGetDocs = vi.mocked(firebaseFirestore.getDocs) as unknown as ReturnType<typeof vi.fn>;
const mockedAddDoc = vi.mocked(firebaseFirestore.addDoc) as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateDoc = vi.mocked(firebaseFirestore.updateDoc) as unknown as ReturnType<typeof vi.fn>;
const mockedDeleteDoc = vi.mocked(firebaseFirestore.deleteDoc) as unknown as ReturnType<typeof vi.fn>;

const TestConsumer = () => {
  const tasks = useTasks();
  return (
    <div>
      <span data-testid="loading">{tasks.loading ? "loading" : "ready"}</span>
      <span data-testid="error">{tasks.error || "no-error"}</span>
      <span data-testid="count">{tasks.tasks.length}</span>
      <span data-testid="filter">{tasks.filters.status}</span>
      <button onClick={() => tasks.addTask({ title: "t1", description: "d1", status: "pending", userId: "u1" })}>add</button>
      <button onClick={() => tasks.updateTask("1", { title: "t2" })}>update</button>
      <button onClick={() => tasks.deleteTask("1")}>delete</button>
      <button onClick={() => tasks.toggleTaskStatus("1")}>toggle</button>
      <button onClick={() => tasks.reorderTask("1", "2")}>reorder</button>
      <button onClick={() => tasks.setStatusFilter("completed")}>filter</button>
      <button onClick={tasks.clearError}>clear</button>
    </div>
  );
};

describe("TasksContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCollection.mockReturnValue({});
    mockedWhere.mockReturnValue({});
    mockedOrderBy.mockReturnValue({});
  });

  it("refreshTasks loads tasks", async () => {
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("refreshTasks handles error", async () => {
    mockedGetDocs.mockRejectedValue(new Error("load-fail"));

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("error").textContent).toBe("load-fail");
  });

  it("addTask creates and refreshes", async () => {
    mockedAddDoc.mockResolvedValue({ id: "new-id" });
    mockedGetDocs.mockResolvedValue({ docs: [] });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("add").click());
    expect(mockedAddDoc).toHaveBeenCalled();
  });

  it("updateTask updates and refreshes", async () => {
    mockedUpdateDoc.mockResolvedValue(undefined);
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("update").click());
    expect(mockedUpdateDoc).toHaveBeenCalled();
  });

  it("deleteTask deletes and refreshes", async () => {
    mockedDeleteDoc.mockResolvedValue(undefined);
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("delete").click());
    expect(mockedDeleteDoc).toHaveBeenCalled();
  });

  it("toggleTaskStatus toggles and refreshes", async () => {
    mockedUpdateDoc.mockResolvedValue(undefined);
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("toggle").click());
    expect(mockedUpdateDoc).toHaveBeenCalled();
  });

  it("reorderTask refreshes tasks", async () => {
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("reorder").click());
    expect(mockedGetDocs).toHaveBeenCalled();
  });

  it("statusFilter filters tasks", async () => {
    mockedGetDocs.mockResolvedValue({
      docs: [
        {
          id: "1",
          data: () => ({
            title: "t1",
            description: "d1",
            status: "pending",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
        {
          id: "2",
          data: () => ({
            title: "t2",
            description: "d2",
            status: "completed",
            userId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      ],
    });

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("count").textContent).toBe("2");
    await act(async () => screen.getByText("filter").click());
    expect(screen.getByTestId("filter").textContent).toBe("completed");
  });

  it("clearError clears error", async () => {
    mockedGetDocs.mockRejectedValue(new Error("load-fail"));

    render(<TasksProvider><TestConsumer /></TasksProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("error").textContent).toBe("load-fail");
    await act(async () => screen.getByText("clear").click());
    expect(screen.getByTestId("error").textContent).toBe("no-error");
  });
});
