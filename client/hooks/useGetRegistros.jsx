"use client";
import { apiUrl } from "@/constants";
import { useState, useEffect } from "react";

export const useGetRegistros = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRegistros = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/registros`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch registros");
      }
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRegistros();
  }, []);

  return { registros, loading, error };
};
