package main

import (
	"net/http"

	"github.com/justinas/alice"
)

func (app *application) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /register", app.register)
	mux.HandleFunc("POST /login", app.login)

	mux.Handle("POST /registros", app.requireAuth(http.HandlerFunc(app.createRegistro)))
	mux.Handle("GET /registros", app.requireAuth(http.HandlerFunc(app.viewRegistro)))
	mux.Handle("PATCH /registros/{id}", app.requireAuth(http.HandlerFunc(app.editRegistro)))
	mux.Handle("DELETE /registros/{id}", app.requireAuth(http.HandlerFunc(app.deleteRegistro)))

	// Alice es una libreria que sirve para encadenar tus middlewares de HTTP de forma
	// conveniente
	standard := alice.New(app.recoverPanic, app.logRequest, enableCORS, commonHeaders)

    return standard.Then(mux)
}