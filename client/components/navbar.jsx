"use client";
import { useAuth } from "@/context/authContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hiddenRoutes = ["/login", "/signup", "/register"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push("/")}
                className="text-xl font-bold text-blue-600 hover:text-blue-700"
              >
                Mi App
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <button
                  onClick={() => router.push("/home")}
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/home" ? "text-blue-600 bg-blue-50" : ""
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={() => router.push("/registros")}
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/registros" ? "text-blue-600 bg-blue-50" : ""
                  }`}
                >
                  Registros
                </button>

                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700 text-sm">
                      Hola, {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
