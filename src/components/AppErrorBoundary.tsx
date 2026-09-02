import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Ocurrió un error inesperado al iniciar la aplicación.",
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("MateCode runtime error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <section className="w-full max-w-xl rounded-xl bg-white p-8 shadow-sm" role="alert" aria-live="assertive">
          <h1 className="text-2xl font-bold text-gray-900">No se pudo iniciar MateCode</h1>
          <p className="mt-3 text-gray-600">
            La interfaz cargó, pero una configuración o servicio necesario falló. Revisá las variables de entorno de Firebase y recargá la aplicación.
          </p>
          <details className="mt-5 rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
            <summary className="cursor-pointer font-medium">Detalle técnico</summary>
            <pre className="mt-3 whitespace-pre-wrap break-words">{this.state.message}</pre>
          </details>
          <button
            type="button"
            className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </section>
      </main>
    );
  }
}
