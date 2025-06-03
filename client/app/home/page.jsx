"use client";
import { useGetRegistros } from "@/hooks/useGetRegistros";
import { PlusCircle, Calendar, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import Error from "@/components/error";
import RegistroItem from "@/components/RegistroItem";

function HomePage() {
  const { registros, loading, error } = useGetRegistros();
  const router = useRouter();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const registrosList = registros?.registros || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a tu Registro de Logros!
            </h1>
            <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
              Prepárate para un internship sobresaliente
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Cada semana, detente y reflexiona: <strong>¿Qué logré?</strong>
              <br />
              Crea un registro de tus logros y al final del internship tendrás
              un resumen completo de todo tu crecimiento.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {registrosList.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No tienes registros aún
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Comienza a documentar tus logros semanales para hacer un
              seguimiento de tu progreso durante el internship.
            </p>
            <button
              onClick={() => router.push("/registros/crear")}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg shadow-lg"
            >
              <PlusCircle className="w-6 h-6" />
              <span>Crear Mi Primer Registro</span>
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Tu Registro Más Reciente
            </h2>

            <RegistroItem registro={registrosList[0]} />
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push("/registros")}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-200 hover:border-blue-300 px-6 py-3 rounded-lg transition-colors"
              >
                <span>Ver Todos los Registros</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
