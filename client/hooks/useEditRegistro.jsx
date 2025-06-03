"use client";
import { apiUrl } from "@/constants";
import { useState } from "react";

export const useEditRegistro = () => {
  const [editing, setEditing] = useState(false);

  const editRegistro = async (registroId, updatedData) => {
    try {
      setEditing(true);
      const response = await fetch(`${apiUrl}/registros/${registroId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (data.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Error al editar el registro",
          fields: data.fields || {},
        };
      }
    } catch (err) {
      console.error("Error editing registro:", err);
    } finally {
      setEditing(false);
    }
  };

  return { editRegistro, editing };
};
