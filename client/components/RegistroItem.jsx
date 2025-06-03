"use client";
import { Calendar } from "lucide-react";
function RegistroItem({ registro }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {registro.logro.titulo}
      </h3>

      <p className="text-gray-700 text-lg mb-6 leading-relaxed">
        {registro.logro.descripcion}
      </p>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Inicio:</span>
            <span>
              {new Date(registro.registro.inicio_semana).toLocaleDateString(
                "es-ES",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-gray-600 mt-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Fin:</span>
            <span>
              {new Date(registro.registro.fin_semana).toLocaleDateString(
                "es-ES",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroItem;
