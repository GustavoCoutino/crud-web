import { Edit2, Trash2, Calendar, Target } from "lucide-react";

function RegistroItemActions({
  registrosList,
  handleEdit,
  handleDeleteClick,
  deleting,
  formatDate,
}) {
  return (
    <div className="hidden md:block">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Logro
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Período
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {registrosList.map((registro) => (
            <tr
              key={registro.registro.id_registro}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {registro.logro.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {registro.logro.descripcion}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Inicio:</span>
                    <span className="ml-1">
                      {formatDate(registro.registro.inicio_semana)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Fin:</span>
                    <span className="ml-1">
                      {formatDate(registro.registro.fin_semana)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(registro.registro.id_registro)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(registro)}
                    disabled={deleting}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RegistroItemActions;
