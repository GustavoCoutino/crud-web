package models

import (
	"database/sql"
)

type Users struct {
	id_usuario int
	nombre string
	apellido string
	email string
}

type UsersModel struct {
    DB *sql.DB
}

func (m *UsersModel) Insert(nombre string, apellido string, email string) (int, error) {
    stmt := `INSERT INTO usuario (nombre, apellido, email) VALUES(?, ?, ?)`
    result, err := m.DB.Exec(stmt, nombre, apellido, email)
    if err != nil {
        return 0, err
    }
    id, err := result.LastInsertId()
    if err != nil {
        return 0, err
    }
    return int(id), nil
}
