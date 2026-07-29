import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../features/auth/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    const state = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = state?.from?.pathname || "/tasks";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
