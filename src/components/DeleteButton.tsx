import { useState, useEffect, useRef, useCallback } from "react";

interface DeleteButtonProps {
  onConfirm: () => Promise<void>;
  title: string;
  disabled?: boolean;
}

export const DeleteButton = ({ onConfirm, title, disabled = false }: DeleteButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    setShowConfirm(true);
    setError(null);
  };

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setError(null);
  }, []);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      setShowConfirm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar la tarea";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Focus trap: al abrir, enfocar el primer botón accionable
  useEffect(() => {
    if (showConfirm) {
      cancelButtonRef.current?.focus();
    }
  }, [showConfirm]);

  // Cerrar con Escape
  useEffect(() => {
    if (!showConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm, handleCancel]);

  // Focus trap simple: ciclar foco entre botones del modal
  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Cerrar con click-outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(e.target as Node)) {
      handleCancel();
    }
  };

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Eliminar tarea: ${title}`}
        className="btn btn-danger text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
      >
        <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
          Confirmar eliminación
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que querés eliminar la tarea <strong>&quot;{title}&quot;</strong>? Esta acción no se puede deshacer.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};
