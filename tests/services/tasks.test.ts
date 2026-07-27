import { describe, it, expect, vi, beforeEach } from "vitest";

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

import * as firebaseFirestore from "firebase/firestore";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser,
} from "../../src/services/tasks";

const mockedAddDoc = vi.mocked(firebaseFirestore.addDoc) as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateDoc = vi.mocked(firebaseFirestore.updateDoc) as unknown as ReturnType<typeof vi.fn>;
const mockedDeleteDoc = vi.mocked(firebaseFirestore.deleteDoc) as unknown as ReturnType<typeof vi.fn>;
const mockedGetDocs = vi.mocked(firebaseFirestore.getDocs) as unknown as ReturnType<typeof vi.fn>;
const mockedCollection = vi.mocked(firebaseFirestore.collection) as unknown as ReturnType<typeof vi.fn>;
const mockedWhere = vi.mocked(firebaseFirestore.where) as unknown as ReturnType<typeof vi.fn>;
const mockedOrderBy = vi.mocked(firebaseFirestore.orderBy) as unknown as ReturnType<typeof vi.fn>;

describe("services/tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCollection.mockReturnValue({});
    mockedWhere.mockReturnValue({});
    mockedOrderBy.mockReturnValue({});
  });

  it("createTask calls addDoc with correct payload", async () => {
    mockedAddDoc.mockResolvedValue({ id: "new-id" });

    const id = await createTask({
      title: "t1",
      description: "d1",
      status: "pending",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(id).toBe("new-id");
    expect(mockedAddDoc).toHaveBeenCalled();
  });

  it("updateTask calls updateDoc with id and payload", async () => {
    mockedUpdateDoc.mockResolvedValue(undefined);

    await updateTask("1", { title: "t2" });

    expect(mockedUpdateDoc).toHaveBeenCalled();
  });

  it("deleteTask calls deleteDoc with id", async () => {
    mockedDeleteDoc.mockResolvedValue(undefined);

    await deleteTask("1");

    expect(mockedDeleteDoc).toHaveBeenCalled();
  });

  it("getTasksByUser builds query with where and orderBy", async () => {
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

    const tasks = await getTasksByUser("u1");

    expect(mockedCollection).toHaveBeenCalled();
    expect(mockedWhere).toHaveBeenCalledWith("userId", "==", "u1");
    expect(mockedOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("1");
  });
});
