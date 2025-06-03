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

// hashPassword genera un hash seguro de la contraseña usando bcrypt.
// Retorna el hash como string y cualquier error que ocurra durante el proceso.
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// checkPassword compara una contraseña ingresada y una contraseña hasheada
// y verifica si son iguales
func checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// generateToken crea un JWT token válido por 24 horas.
// Incluye el userID y email en los claims para identificación.
// El token se firma con el secret configurado en variables de entorno.
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

// validateToken parsea un token y verifica que sea válido. Primero crear un objeto
// tipo Claims para asignarle los valores del token recibido en los parámetros.
// Si el token es válido, se regresa la variable claims
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

// requireAuth es un middleware que valida tokens JWT en requests.
// Extrae el token del header Authorization, lo valida, y agrega
// X-User-ID y X-User-Email headers para uso en handlers posteriores.
// Si el token es inválido, retorna 401 Unauthorized.
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

// getUserID extrae el ID del usuario desde el header X-User-ID del request.
// Este header es establecido por el middleware requireAuth después de validar el JWT
func getUserID(r *http.Request) int {
	userIDStr := r.Header.Get("X-User-ID")
	userID, _ := strconv.Atoi(userIDStr)
	return userID
}

// register maneja el registro de nuevos usuarios.
// Valida los datos del formulario, verifica que el email no exista,
// hashea la contraseña y crea el usuario en la base de datos.
// Retorna un JWT token si el registro es exitoso.
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

// login maneja la autenticación de usuarios existentes.
// Valida las credenciales (email y contraseña) contra la base de datos
// y retorna un JWT token si las credenciales son correctas.
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