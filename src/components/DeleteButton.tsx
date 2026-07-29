import { useState } from "react";

interface DeleteButtonProps {
  onConfirm: () => Promise<void>;
  title: string;
  disabled?: boolean;
}

export const DeleteButton = ({ onConfirm, title, disabled = false }: DeleteButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setShowConfirm(true);
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setError(null);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
          Confirmar eliminación
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que querés eliminar la tarea <strong>"{title}"</strong>? Esta acción no se puede deshacer.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
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
