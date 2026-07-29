import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-gray-300 mb-6">
          <SearchX className="w-24 h-24 mx-auto" strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">404</h1>
        <p className="text-lg text-gray-600 mb-2">PÃ¡gina no encontrada</p>
        <p className="text-sm text-gray-500 mb-8">
          La URL que buscas no existe o fue movida.
        </p>
        <Link to="/tasks" className="btn btn-primary inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
          <Home className="w-4 h-4" />
          Ir al panel de tareas
        </Link>
      </div>
    </div>
  );
};
