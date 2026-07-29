import { useAuth } from "../features/auth/AuthContext";
import { LogOut, User } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">MateCode Tasks</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:flex items-center gap-2">
            <User className="w-4 h-4" />
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={logout}
            className="btn btn-secondary text-sm inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Cerrar SesiÃ³n
          </button>
        </div>
      </div>
    </header>
  );
};
