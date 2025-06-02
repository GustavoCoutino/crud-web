"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setFieldErrors({});

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
        if (result.fields) {
          setFieldErrors(result.fields);
        }
        return;
      }
      router.push("/home");
    } catch (error) {
      setError(
        "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde."
      );
      console.error("Error durante el login:", error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <form action={handleSubmit}>
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Login
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Por favor ingresa tus credenciales
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                    fieldErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                    fieldErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tu contraseña"
                  disabled={loading}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }`}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <a
                  href="/signin"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
