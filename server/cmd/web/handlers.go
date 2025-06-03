package main

import (
	"crud-web/internal/models"
	"crud-web/internal/validator"
	"errors"
	"net/http"
	"strconv"
	"time"
)

type userCreateForm struct {
    Nombre string `json: "nombre"`
    Apellido string `json: "apellido"`
    Email string `json: "email"`
    Password string `json: "password"`
    validator.Validator `json: "-"`
}

type registroCreateForm struct {
    Titulo      string `json:"titulo"`
    Descripcion string `json:"descripcion"`    
    InicioSemana string `json:"inicio_semana"` 
    FinSemana    string `json:"fin_semana"`    
    validator.Validator `json:"-"`
}

// createRegistro maneja la creación de nuevos registros de logros.
// Valida los datos del formulario, crea un logro en la BD, y luego
// crea el registro asociado al usuario autenticado.
// Retorna JSON con el ID del registro creado o errores de validación.
func (app *application) createRegistro(w http.ResponseWriter, r *http.Request){
    var form registroCreateForm

    err := app.decodeJSON(r, &form)
    if err != nil {
        app.clientError(w, http.StatusBadRequest)
        return
    }

    userID := getUserID(r)

    form.CheckField(validator.NotBlank(form.Titulo), "titulo", "Este campo no puede estar en blanco")
    form.CheckField(validator.MaxChars(form.Titulo, 100), "titulo", "Este campo no puede tener más de 100 caracteres")
	form.CheckField(validator.NotBlank(form.Descripcion), "descripcion", "Este campo no puede estar en blanco")
    form.CheckField(validator.NotBlank(form.InicioSemana), "inicio_semana", "La fecha de inicio no puede estar en blanco")
    form.CheckField(validator.NotBlank(form.FinSemana), "fin_semana", "La fecha de fin no puede estar en blanco")
    form.CheckField(userID > 0, "id_usuario", "ID de usuario inválido")

    if !form.Valid() {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusUnprocessableEntity)
        app.writeJSON(w, map[string]interface{}{
            "error": "validation failed",
            "fields": form.FieldErrors,
        })
        return
    }

    inicioSemana, err := time.Parse("2006-01-02", form.InicioSemana)
    if err != nil {
        form.AddFieldError("inicio_semana", "Formato de fecha inválido (usar YYYY-MM-DD)")
    }
    
    finSemana, err := time.Parse("2006-01-02", form.FinSemana)
    if err != nil {
        form.AddFieldError("fin_semana", "Formato de fecha inválido (usar YYYY-MM-DD)")
    }

    if !form.Valid() {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusUnprocessableEntity)
        app.writeJSON(w, map[string]interface{}{
            "error": "validation failed",
            "fields": form.FieldErrors,
        })
        return
    }

    idLogro, err := app.logros.Insert(form.Titulo, form.Descripcion)
    if err != nil {
        app.serverError(w, r, err)
        return
    }

    idRegistro, err := app.registros.Insert(userID, idLogro, inicioSemana, finSemana)
    if err != nil {
        app.serverError(w, r, err)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    app.writeJSON(w, map[string]interface{}{
        "message": "Registro creado exitosamente",
        "id_registro": idRegistro,
        "id_logro": idLogro,
    })
}

// viewRegistro maneja la visualización de todos los registros de un usuario.
// Obtiene el id del usuario autenticado y retorna un json
// con todos los registros que tenga el usuario
func (app *application) viewRegistro(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	registros, err := app.registros.Latest(userID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	var registrosWithLogros []map[string]interface{}
	
	for _, registro := range registros {
		logro, err := app.logros.Get(registro.ID_Logro)
		if err != nil {
			app.serverError(w, r, err)
			return
		}
		
		registroWithLogro := map[string]interface{}{
			"registro": registro,
			"logro": logro,
		}
		registrosWithLogros = append(registrosWithLogros, registroWithLogro)
	}

	w.Header().Set("Content-Type", "application/json")
	app.writeJSON(w, map[string]interface{}{
		"registros": registrosWithLogros,
	})
}

// editRegistro maneja la edición de un registro existente.
// Valida los datos del formulario, primero edita un logro, y luego
// edita el registro asociado al usuario autenticado.
// Retorna un JSON con el id del registro editado, junto a un mensaje de éxito.
func (app *application) editRegistro(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		app.clientError(w, http.StatusBadRequest)
		return
	}
	
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		app.writeJSON(w, map[string]string{
			"error": "ID inválido",
		})
		return
	}

	userID := getUserID(r)
	
	existingRegistro, err := app.registros.Get(id)
	if err != nil {
		if errors.Is(err, models.ErrNoRecord) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			app.writeJSON(w, map[string]string{
				"error": "Registro no encontrado",
			})
			return
		}
		app.serverError(w, r, err)
		return
	}

	if existingRegistro.ID_Usuario != userID {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		app.writeJSON(w, map[string]string{
			"error": "No tienes permiso para editar este registro",
		})
		return
	}

	var form registroCreateForm
	err = app.decodeJSON(r, &form)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Titulo), "titulo", "Este campo no puede estar en blanco")
	form.CheckField(validator.MaxChars(form.Titulo, 100), "titulo", "Este campo no puede tener más de 100 caracteres")
	form.CheckField(validator.NotBlank(form.Descripcion), "descripcion", "Este campo no puede estar en blanco")
	form.CheckField(validator.NotBlank(form.InicioSemana), "inicio_semana", "La fecha de inicio no puede estar en blanco")
	form.CheckField(validator.NotBlank(form.FinSemana), "fin_semana", "La fecha de fin no puede estar en blanco")

	if !form.Valid() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		app.writeJSON(w, map[string]interface{}{
			"error": "validation failed",
			"fields": form.FieldErrors,
		})
		return
	}

	inicioSemana, err := time.Parse("2006-01-02", form.InicioSemana)
	if err != nil {
		form.AddFieldError("inicio_semana", "Formato de fecha inválido")
	}
	
	finSemana, err := time.Parse("2006-01-02", form.FinSemana)
	if err != nil {
		form.AddFieldError("fin_semana", "Formato de fecha inválido")
	}

	if !form.Valid() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		app.writeJSON(w, map[string]interface{}{
			"error": "validation failed",
			"fields": form.FieldErrors,
		})
		return
	}

	err = app.logros.Update(existingRegistro.ID_Logro, form.Titulo, form.Descripcion)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.registros.Update(id, userID, existingRegistro.ID_Logro, inicioSemana, finSemana)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	app.writeJSON(w, map[string]interface{}{
		"message": "Registro actualizado exitosamente",
		"id": id,
	})
}

// deleteRegistro maneja la eliminación de un registro existente.
// Valida que el id del registro sea válido, y primero elimina el registro,
// y después el logro. Regresa un JSON con un mensaje indicando que la eliminación
// fue exitosa
func (app *application) deleteRegistro(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		app.clientError(w, http.StatusBadRequest)
		return
	}
	
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		app.writeJSON(w, map[string]string{
			"error": "ID inválido",
		})
		return
	}

	userID := getUserID(r)
	
	existingRegistro, err := app.registros.Get(id)
	if err != nil {
		if errors.Is(err, models.ErrNoRecord) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			app.writeJSON(w, map[string]string{
				"error": "Registro no encontrado",
			})
			return
		}
		app.serverError(w, r, err)
		return
	}

	if existingRegistro.ID_Usuario != userID {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		app.writeJSON(w, map[string]string{
			"error": "No tienes permiso para eliminar este registro",
		})
		return
	}

	err = app.registros.Delete(id)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.logros.Delete(existingRegistro.ID_Logro)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	app.writeJSON(w, map[string]interface{}{
		"message": "Registro eliminado exitosamente",
	})
}