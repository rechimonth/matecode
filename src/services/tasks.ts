import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Task } from "../types";

const COLLECTION = "tasks";

type FirestoreDateLike = { toDate: () => Date };

const toDate = (value: unknown): Date => {
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as FirestoreDateLike).toDate === "function") {
    return (value as FirestoreDateLike).toDate();
  }
  if (value instanceof Date) return value;
  return new Date(value as string);
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...task,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
};

export const updateTask = async (id: string, data: Partial<Pick<Task, "title" | "description" | "status" | "dueDate" | "priority" | "sortOrder">>): Promise<void> => {
  const taskRef = doc(db, COLLECTION, id);
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (data.dueDate) {
    payload.dueDate = Timestamp.fromDate(new Date(data.dueDate));
  }
  await updateDoc(taskRef, payload);
};

export const reorderTasks = async (tasks: Task[]): Promise<void> => {
  const timestamp = Timestamp.now();
  await Promise.all(
    tasks.map((task, index) =>
      updateDoc(doc(db, COLLECTION, task.id), {
        sortOrder: index,
        updatedAt: timestamp,
      }),
    ),
  );
};

export const deleteTask = async (id: string): Promise<void> => {
  const taskRef = doc(db, COLLECTION, id);
  await deleteDoc(taskRef);
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      status: data.status,
      userId: data.userId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      dueDate: data.dueDate ? toDate(data.dueDate) : undefined,
      priority: data.priority,
      sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : undefined,
    } as Task;
  });

  return tasks.sort((a, b) => {
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
    if (a.sortOrder !== undefined) return -1;
    if (b.sortOrder !== undefined) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};
