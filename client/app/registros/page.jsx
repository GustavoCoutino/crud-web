"use client";
import { useGetRegistros } from "@/hooks/useGetRegistros";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Loading from "@/components/loading";
import DeleteModal from "@/components/DeleteModal";
import NoRegistrosMessage from "@/components/NoRegistrosMessage";
import { useDeleteRegistro } from "@/hooks/useDeleteRegistro";

function Registros() {
  const { registros, loading, error } = useGetRegistros();
  const { deleteRegistro, deleting, error: deleteError } = useDeleteRegistro();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState(null);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  const registrosList = registros?.registros || [];

  const handleEdit = (registroId) => {
    router.push(`/registros/editar/${registroId}`);
  };

  const handleDeleteClick = (registro) => {
    setRegistroToDelete(registro);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;

    const success = await deleteRegistro(registroToDelete.registro.id_registro);

    if (success) {
      setShowDeleteModal(false);
      setRegistroToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRegistroToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Todos los Registros
          </h1>
          <button
            onClick={() => router.push("/registros/crear")}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Crear Nuevo Registro</span>
          </button>
        </div>

        {registrosList.length === 0 ? (
          <NoRegistrosMessage router={router} />
        ) : (
          <RegistroItemActions
            registrosList={registrosList}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            deleting={deleting}
            formatDate={formatDate}
          />
        )}

        {deleteError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al eliminar: {deleteError}
          </div>
        )}

        {showDeleteModal && (
          <DeleteModal
            registroToDelete={registroToDelete}
            handleDeleteCancel={handleDeleteCancel}
            handleDeleteConfirm={handleDeleteConfirm}
            deleting={deleting}
          />
        )}
      </div>
    </div>
  );
}

export default Registros;
