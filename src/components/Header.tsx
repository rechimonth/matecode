import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { LinkPasswordForm } from "./LinkPasswordForm";
import { LogOut, User, KeyRound } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();
  const [showLinkPassword, setShowLinkPassword] = useState(false);

  const hasEmailProvider = user?.providerData?.some((p) => p.providerId === "password") ?? false;
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com") ?? false;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">MateCode Tasks</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:flex items-center gap-2">
            <User className="w-4 h-4" />
            {user?.displayName || user?.email}
          </span>
          {isGoogleUser && !hasEmailProvider && (
            <button
              onClick={() => setShowLinkPassword(true)}
              className="btn btn-secondary text-sm inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              Vincular contrasena
            </button>
          )}
          <button
            onClick={logout}
            className="btn btn-secondary text-sm inline-flex items-center gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesion
          </button>
        </div>
      </div>
      {showLinkPassword && (
        <LinkPasswordForm onCancel={() => setShowLinkPassword(false)} />
      )}
    </header>
  );
};
