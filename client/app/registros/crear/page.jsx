"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateRegistro } from "@/hooks/useCreateRegistro";
import { Calendar, Target, ArrowLeft, Plus } from "lucide-react";

export default function CreateRegistro() {
  const router = useRouter();
  const { createRegistro, creating } = useCreateRegistro();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    inicio_semana: "",
    fin_semana: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");

    const result = await createRegistro(formData);

    if (result?.success) {
      router.push("/registros");
    } else {
      if (result?.fields) {
        setFieldErrors(result.fields);
      }
      if (result?.error) {
        setGeneralError(result.error);
      }
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const getEndOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(now.setDate(diff));
    return sunday.toISOString().split("T")[0];
  };

  const handleSetCurrentWeek = () => {
    setFormData((prev) => ({
      ...prev,
      inicio_semana: prev.inicio_semana || getStartOfWeek(),
      fin_semana: prev.fin_semana || getEndOfWeek(),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push("/registros")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a registros
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Nuevo Registro
              </h1>
              <p className="text-gray-600">
                Documenta tu logro semanal para seguir tu progreso
              </p>
            </div>
          </div>
        </div>

        {generalError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h4 className="font-semibold">Error:</h4>
            <p>{generalError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="titulo"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Título del Logro *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black ${
                  fieldErrors.titulo
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Ej: Completé el módulo de React"
                maxLength={100}
              />
              {fieldErrors.titulo && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.titulo}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-black ${
                  fieldErrors.descripcion
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Describe tu logro en detalle..."
              />
              {fieldErrors.descripcion && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.descripcion}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Semana Actual
                  </h4>
                  <p className="text-xs text-blue-700">
                    ¿Este logro corresponde a la semana actual?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSetCurrentWeek}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
                >
                  Usar semana actual
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="inicio_semana"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Inicio de Semana *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="inicio_semana"
                    name="inicio_semana"
                    value={formData.inicio_semana}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black ${
                      fieldErrors.inicio_semana
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.inicio_semana && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.inicio_semana}
                  </p>
                )}
              </div>

              {/* Fin de Semana */}
              <div>
                <label
                  htmlFor="fin_semana"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Fin de Semana *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="fin_semana"
                    name="fin_semana"
                    value={formData.fin_semana}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black ${
                      fieldErrors.fin_semana
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.fin_semana && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.fin_semana}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.push("/registros")}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Crear Registro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
