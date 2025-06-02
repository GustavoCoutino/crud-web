package models

import (
	"database/sql"
	"errors"
)

type User struct {
	ID int `json: "id_usuario"`
	Nombre string `json: "nombre"`
	Apellido string `json: "apellido"`
	Email string `json: "email"`
    Password string `json:"-"`
}

type UsersModel struct {
    DB *sql.DB
}

func (m *UsersModel) InsertWithPassword(nombre, apellido, email, hashedPassword string) (int, error) {
	stmt := `INSERT INTO usuario (nombre, apellido, email, password) VALUES(?, ?, ?, ?)`
	result, err := m.DB.Exec(stmt, nombre, apellido, email, hashedPassword)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (m *UsersModel) GetByEmail(email string) (User, error) {
	stmt := `SELECT id_usuario, nombre, apellido, email, password FROM usuario WHERE email = ?`
	row := m.DB.QueryRow(stmt, email)

	var u User
	err := row.Scan(&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.Password)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNoRecord
		}
		return User{}, err
	}
	return u, nil
}
