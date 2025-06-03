package main

import (
	"crud-web/internal/models"
	"database/sql"
	"flag"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-playground/form/v4"
	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

type application struct {
	logger *slog.Logger
	users *models.UsersModel
    registros *models.RegistrosModel
    logros *models.LogrosModel
	formDecoder *form.Decoder
    jwtSecret string
}

func main(){
	err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
	addr := flag.String("addr", ":4000", "HTTP network address")
	flag.Parse()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
    db, err := openDB()
    if err != nil {
        logger.Error(err.Error())
        os.Exit(1)
    }
    defer db.Close()
	formDecoder := form.NewDecoder()
	app := application {
		logger: logger,
		formDecoder: formDecoder,
		users: &models.UsersModel{DB: db},
        registros: &models.RegistrosModel{DB: db},
        logros: &models.LogrosModel{DB: db},
        jwtSecret: os.Getenv("JWTSECRET"),
	}
	logger.Info("starting server", "addr", addr)
	 err = http.ListenAndServe(*addr, app.routes())
    logger.Error(err.Error())
    os.Exit(1)
}

// openDB inicia la conexión a la base de datos
// para realizar las operaciones de los modelos
func openDB() (*sql.DB, error) {
    cfg := mysql.NewConfig()
    cfg.User = os.Getenv("DBUSER")
    cfg.Passwd = os.Getenv("DBPASS")
    cfg.Net = "tcp"
    cfg.Addr = os.Getenv("DBADDR")
    cfg.DBName = "railway" 
    cfg.ParseTime = true 
    
    db, err := sql.Open("mysql", cfg.FormatDSN())
    if err != nil {
        return nil, err
    }
    
    err = db.Ping()
    if err != nil {
        db.Close()
        return nil, err
    }

    return db, nil
}