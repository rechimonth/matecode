import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { TasksProvider } from "./features/tasks/TasksContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TasksPage } from "./pages/TasksPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
    <Route path="/" element={<Navigate to="/tasks" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TasksProvider>
        <AppRoutes />
      </TasksProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
