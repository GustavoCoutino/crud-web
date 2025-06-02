package main

import (
	"crud-web/internal/validator"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type loginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	validator.Validator `json:"-"`
}

type registerForm struct {
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Email    string `json:"email"`
	Password string `json:"password"`
	validator.Validator `json:"-"`
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}


func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (app *application) generateToken(userID int, email string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(app.jwtSecret))
}

func (app *application) validateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(app.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func (app *application) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			app.writeJSON(w, map[string]string{
				"error": "Authorization header required",
			})
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		
		claims, err := app.validateToken(tokenString)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			app.writeJSON(w, map[string]string{
				"error": "Invalid token",
			})
			return
		}

		r.Header.Set("X-User-ID", strconv.Itoa(claims.UserID))
		r.Header.Set("X-User-Email", claims.Email)
		
		next.ServeHTTP(w, r)
	})
}

func getUserID(r *http.Request) int {
	userIDStr := r.Header.Get("X-User-ID")
	userID, _ := strconv.Atoi(userIDStr)
	return userID
}

func (app *application) register(w http.ResponseWriter, r *http.Request) {
	var form registerForm

	err := app.decodeJSON(r, &form)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Nombre), "nombre", "Este campo no puede estar en blanco")
	form.CheckField(validator.MaxChars(form.Nombre, 100), "nombre", "Este campo no puede tener más de 100 caracteres")
	form.CheckField(validator.NotBlank(form.Apellido), "apellido", "Este campo no puede estar en blanco")
	form.CheckField(validator.NotBlank(form.Email), "email", "Este campo no puede estar en blanco")
	form.CheckField(validator.Matches(form.Email, validator.EmailRX), "email", "Email inválido")
	form.CheckField(validator.NotBlank(form.Password), "password", "Este campo no puede estar en blanco")
	form.CheckField(validator.MinChars(form.Password, 6), "password", "La contraseña debe tener al menos 6 caracteres")

	if !form.Valid() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		app.writeJSON(w, map[string]interface{}{
			"error": "validation failed",
			"fields": form.FieldErrors,
		})
		return
	}

	_, err = app.users.GetByEmail(form.Email)
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		app.writeJSON(w, map[string]string{
			"error": "El email ya está registrado",
		})
		return
	}

	hashedPassword, err := hashPassword(form.Password)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	userID, err := app.users.InsertWithPassword(form.Nombre, form.Apellido, form.Email, hashedPassword)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	token, err := app.generateToken(userID, form.Email)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	app.writeJSON(w, map[string]interface{}{
		"message": "Usuario registrado exitosamente",
		"user_id": userID,
		"token":   token,
	})
}

func (app *application) login(w http.ResponseWriter, r *http.Request) {
	var form loginForm

	err := app.decodeJSON(r, &form)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Email), "email", "Este campo no puede estar en blanco")
	form.CheckField(validator.NotBlank(form.Password), "password", "Este campo no puede estar en blanco")

	if !form.Valid() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		app.writeJSON(w, map[string]interface{}{
			"error": "validation failed",
			"fields": form.FieldErrors,
		})
		return
	}

	user, err := app.users.GetByEmail(form.Email)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		app.writeJSON(w, map[string]string{
			"error": "Credenciales inválidas",
		})
		return
	}

	if !checkPassword(form.Password, user.Password) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		app.writeJSON(w, map[string]string{
			"error": "Credenciales inválidas",
		})
		return
	}

	token, err := app.generateToken(user.ID, user.Email)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	app.writeJSON(w, map[string]interface{}{
		"message": "Login exitoso",
		"user_id": user.ID,
		"token":   token,
	})
}