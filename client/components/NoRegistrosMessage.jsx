import { PlusCircle, Calendar } from "lucide-react";
function NoRegistrosMessage({ router }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
        <Calendar className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        No tienes registros aún
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Comienza a documentar tus logros semanales creando tu primer registro.
      </p>
      <button
        onClick={() => router.push("/registros/crear")}
        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
      >
        <PlusCircle className="w-6 h-6" />
        <span>Crear Mi Primer Registro</span>
      </button>
    </div>
  );
}

export default NoRegistrosMessage;
