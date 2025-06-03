"use client";
import { apiUrl } from "@/constants";
import { useState } from "react";

export const useCreateRegistro = () => {
  const [creating, setCreating] = useState(false);

  const createRegistro = async (newData) => {
    try {
      setCreating(true);
      const response = await fetch(`${apiUrl}/registros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newData),
      });
      const data = await response.json();
      if (!data.error) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Error al crear el registro",
          fields: data.fields || {},
        };
      }
    } catch (err) {
      console.error("Error creating registro:", err);
    } finally {
      setCreating(false);
    }
  };

  return { createRegistro, creating };
};
