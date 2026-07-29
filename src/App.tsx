import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { TasksProvider } from "./features/tasks/TasksContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { ToastProvider } from "./components/ui/Toast";

const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const TasksPage = lazy(() => import("./pages/TasksPage").then(m => ({ default: m.TasksPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
    <Route path="/" element={<Navigate to="/tasks" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <TasksProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">Cargando...</p></div>}>
            <AppRoutes />
          </Suspense>
        </TasksProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

export default App;
