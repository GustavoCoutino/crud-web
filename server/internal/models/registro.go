package models

import (
	"database/sql"
	"errors"
	"time"
)

type Registro struct {
	ID_Registro    int       `json:"id_registro"`
	ID_Usuario     int       `json:"id_usuario"`
	ID_Logro       int       `json:"id_logro"`
	InicioSemana   time.Time `json:"inicio_semana"`
	FinSemana      time.Time `json:"fin_semana"`
}


type RegistrosModel struct {
    DB *sql.DB
}

func (m *RegistrosModel) Insert(id_usuario int, id_logro int, inicio_semana time.Time, fin_semana time.Time) (int, error) {
	stmt := `INSERT INTO registro (id_usuario, id_logro, inicio_semana, fin_semana) VALUES(?, ?, ?, ?)`
    result, err := m.DB.Exec(stmt, id_usuario, id_logro, inicio_semana, fin_semana)
    if err != nil {
        return 0, err
    }
    id, err := result.LastInsertId()
    if err != nil {
        return 0, err
    }
    return int(id), nil
}

func (m *RegistrosModel) Get(id int) (Registro, error) {
    stmt := `SELECT id_registro, id_usuario, id_logro, inicio_semana, fin_semana FROM registro
    WHERE id_registro = ?`
    row := m.DB.QueryRow(stmt, id)

    var s Registro
    err := row.Scan(&s.ID_Registro, &s.ID_Usuario, &s.ID_Logro, &s.InicioSemana, &s.FinSemana)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return Registro{}, ErrNoRecord
        } else {
            return Registro{}, err
        }
    }
    return s, nil
}

func (m *RegistrosModel) Update(id int, id_usuario int, id_logro int, inicio_semana time.Time, fin_semana time.Time) error {
    stmt := `UPDATE registro 
    SET id_usuario = ?, id_logro = ?, inicio_semana = ?, fin_semana = ?
    WHERE id_registro = ?`
    
    result, err := m.DB.Exec(stmt, id_usuario, id_logro, inicio_semana, fin_semana, id)
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

func (m *RegistrosModel) Delete(id int) error {
    stmt := `DELETE FROM registro WHERE id_registro = ?`
    
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

func (m *RegistrosModel) Latest(id int) ([]Registro, error) {
    stmt := `SELECT id_registro, id_usuario, id_logro, inicio_semana, fin_semana FROM registro
    WHERE id_usuario = ? ORDER BY inicio_semana DESC LIMIT 10`
    rows, err := m.DB.Query(stmt, id)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var registros []Registro

    for rows.Next() {
        var s Registro
        err = rows.Scan(&s.ID_Registro, &s.ID_Usuario, &s.ID_Logro, &s.InicioSemana, &s.FinSemana)
        if err != nil {
            return nil, err
        }
        registros = append(registros, s)
    }
    if err = rows.Err(); err != nil {
        return nil, err
    }
    return registros, nil
}