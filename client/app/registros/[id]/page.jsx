"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditRegistro } from "@/hooks/useEditRegistro";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Target } from "lucide-react";

export default function EditRegistro({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    titulo: searchParams.get("titulo") || "",
    descripcion: searchParams.get("descripcion") || "",
    inicio_semana: searchParams.get("inicio_semana") || "",
    fin_semana: searchParams.get("fin_semana") || "",
  });

  const registroId = React.use(params).id || "";

  const { editRegistro, editing } = useEditRegistro();
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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

    try {
      const result = await editRegistro(registroId, formData);
      if (!result.success) {
        setFieldErrors(result.fields);
        return;
      }
      router.push("/registros");
    } catch (err) {
      console.error("Error editing registro:", err);
      setError("Error al editar el registro");
    }
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
                Editar Registro
              </h1>
              <p className="text-gray-600">
                Actualiza la información de tu logro semanal
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h4 className="font-semibold">Error al guardar:</h4>
            <p>{error}</p>
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
              disabled={editing}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {editing ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
