"use client";
import { apiUrl } from "@/constants";
import { useState } from "react";

export const useDeleteRegistro = () => {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const deleteRegistro = async (registroId) => {
    try {
      setDeleting(true);
      const response = await fetch(`${apiUrl}/registros/${registroId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete registro");
      }
      await response.json();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return { deleteRegistro, deleting, error };
};
