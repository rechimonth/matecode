export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority?: TaskPriority;
  sortOrder?: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerData: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }>;
}

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (_email: string, _password: string) => Promise<void>;
  register: (_email: string, _password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  linkPassword: (_password: string) => Promise<void>;
  clearError: () => void;
}

export interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: {
    status: "all" | TaskStatus;
  };
  setStatusFilter: (_status: "all" | TaskStatus) => void;
  addTask: (_task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (_id: string, _data: Partial<Pick<Task, "title" | "description" | "status" | "dueDate" | "priority">>) => Promise<void>;
  deleteTask: (_id: string) => Promise<void>;
  toggleTaskStatus: (_id: string, _currentStatus?: TaskStatus) => Promise<void>;
  reorderTask: (_activeId: string, _overId: string) => Promise<void>;
  clearError: () => void;
  isTaskLoading: (_id: string) => boolean;
}
