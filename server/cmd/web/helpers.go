package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"runtime/debug"
)

// decodeJSON se encarga de decodificar el JSON recibido de requests.
// Verifica que el contenido del request sea JSON, y de serlo
// lo decodifica
func (app *application) decodeJSON(r *http.Request, dst any) error {
    if r.Header.Get("Content-Type") != "application/json" {
        return errors.New("content-type header is not application/json")
    }

    err := json.NewDecoder(r.Body).Decode(dst)
    if err != nil {
        return err
    }

    return nil
}

// writeJSON se encarga de escribir un mensaje de respuesta como JSON
func (app *application) writeJSON(w http.ResponseWriter, data interface{}) error {
    w.Header().Set("Content-Type", "application/json")
    return json.NewEncoder(w).Encode(data)
}

// serverError despliega en la consola un error del servidor. El error se despliega
// usando el logger del servidor, mostrando el method, el uri, y el stack trace del 
// error.
func (app *application) serverError(w http.ResponseWriter, r *http.Request, err error){
	var (
		method = r.Method
		uri = r.URL.RequestURI()
		trace = string(debug.Stack())
	)
	app.logger.Error(err.Error(), "method", method, "uri", uri, "trace", trace)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

// clientError despliega en la consola un error del cliente
func (app *application) clientError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}
