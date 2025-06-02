package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"runtime/debug"
)

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


func (app *application) serverError(w http.ResponseWriter, r *http.Request, err error){
	var (
		method = r.Method
		uri = r.URL.RequestURI()
		trace = string(debug.Stack())
	)
	app.logger.Error(err.Error(), "method", method, "uri", uri, "trace", trace)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

func (app *application) clientError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}
