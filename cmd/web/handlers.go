package main

import (
	"fmt"
	"net/http"

	"crud-web/internal/validator"
)

type userCreateForm struct {
    Nombre string 
    Apellido string 
    Email string 
    validator.Validator 
}


func (app *application) createUser(w http.ResponseWriter, r *http.Request) {
    var form userCreateForm

	err := app.decodeJSON(r, &form)
    if err != nil {
        app.clientError(w, http.StatusBadRequest)
        return
    }

    form.CheckField(validator.NotBlank(form.Nombre), "nombre", "Este campo no puede estar en blanco")
    form.CheckField(validator.MaxChars(form.Nombre, 100), "nombre", "Este campo no puede tener más de 100 caracteres")
	form.CheckField(validator.NotBlank(form.Apellido), "apellido", "Este campo no puede estar en blanco")
	form.CheckField(validator.NotBlank(form.Email), "email", "Este campo no puede estar en blanco")

    
    id, err := app.users.Insert(form.Nombre, form.Apellido, form.Email)
    if err != nil {
        app.serverError(w, r, err)
        return
    }
	fmt.Println(id)
}