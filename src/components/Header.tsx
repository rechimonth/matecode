import { useAuth } from "../features/auth/AuthContext";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">MateCode Tasks</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">
            {user?.displayName || user?.email}
          </span>
          <button onClick={logout} className="btn btn-secondary text-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};
