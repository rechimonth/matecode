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

const toDate = (value: unknown): Date => {
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  return new Date(value as string);
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...task,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
};

export const updateTask = async (id: string, data: Partial<Pick<Task, "title" | "description" | "status" | "dueDate" | "priority">>): Promise<void> => {
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

export const deleteTask = async (id: string): Promise<void> => {
  const taskRef = doc(db, COLLECTION, id);
  await deleteDoc(taskRef);
};

export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
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
    } as Task;
  });
};
