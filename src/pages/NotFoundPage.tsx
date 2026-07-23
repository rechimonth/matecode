import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
        <Link to="/tasks" className="btn btn-primary mt-6">Ir al panel de tareas</Link>
      </div>
    </div>
  );
};
