package models

import (
	"database/sql"
	"errors"
	"fmt"
)

type Logro struct {
	ID_Logro     int    `json:"id_logro"`
	Titulo       string `json:"titulo"`
	Descripcion  string `json:"descripcion"`
}

type LogrosModel struct {
    DB *sql.DB
}

func (m *LogrosModel) Insert(titulo string, descripcion string) (int, error) {
	stmt := `INSERT INTO logro (titulo, descripcion) VALUES(?, ?)`
    result, err := m.DB.Exec(stmt, titulo, descripcion)
    if err != nil {
        return 0, err
    }
    id, err := result.LastInsertId()
    if err != nil {
        return 0, err
    }
    return int(id), nil
}

func (m *LogrosModel) Get(id int) (Logro, error) {
    stmt := `SELECT id_logro, titulo, descripcion FROM logro WHERE id_logro = ?`
    row := m.DB.QueryRow(stmt, id)

    var l Logro
    err := row.Scan(&l.ID_Logro, &l.Titulo, &l.Descripcion)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return Logro{}, ErrNoRecord
        } else {
            return Logro{}, err
        }
    }
    return l, nil
}

func (m *LogrosModel) Update(id int, titulo string, descripcion string) error {
    stmt := `UPDATE logro SET titulo = ?, descripcion = ? WHERE id_logro = ?`
    result, err := m.DB.Exec(stmt, titulo, descripcion, id)
    if err != nil {
        fmt.Println("error in the statement")
        return err
    }
    
    _, err = result.RowsAffected()
    if err != nil {
        fmt.Println("error in the rows affected")
        return err
    }
    
    return nil
}

func (m *LogrosModel) Delete(id int) error {
    stmt := `DELETE FROM logro WHERE id_logro = ?`
    
    result, err := m.DB.Exec(stmt, id)
    if err != nil {
        return err
    }
    
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rowsAffected == 0 {
        return ErrNoRecord
    }
    
    return nil
}
