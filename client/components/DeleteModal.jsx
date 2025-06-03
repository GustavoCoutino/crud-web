"use client";
import { AlertTriangle } from "lucide-react";

function DeleteModal({
  registroToDelete,
  handleDeleteCancel,
  handleDeleteConfirm,
  deleting,
}) {
  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-lg
 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirmar eliminación
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que quieres eliminar el registro "
          {registroToDelete?.logro?.titulo}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={handleDeleteCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
