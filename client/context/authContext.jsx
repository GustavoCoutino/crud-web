"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:4000";

  const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  useEffect(() => {
    const token = getCookie("auth-token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = getCookie("auth-token");
      if (!token) {
        setLoading(false);
        return;
      }

      const userInfo = localStorage.getItem("user");
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      deleteCookie("auth-token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setCookie("auth-token", data.token);
        localStorage.setItem("token", data.token);
        const userInfo = {
          id: data.user_id,
          email: email,
        };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.error || "Login fallido",
          fields: data.fields,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Error de red",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, apellido, email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, apellido, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setCookie("auth-token", data.token);
        localStorage.setItem("token", data.token);
        const userInfo = {
          id: data.user_id,
          email: email,
          nombre: nombre,
          apellido: apellido,
        };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.error || "Registro fallido",
          fields: data.fields,
        };
      }
    } catch (error) {
      console.error("Error durante el registro:", error);
      return { success: false, error: "Error de red" };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    deleteCookie("auth-token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        fetchUser,
        login,
        register,
        logout,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
