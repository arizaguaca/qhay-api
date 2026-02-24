package mysql

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/arizaguaca/table/internal/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// NewClient crea e inicializa una nueva conexión a MySQL usando GORM
func NewClient(cfg *config.Config) *gorm.DB {
	// 1. Asegurar que la base de datos existe
	ensureDatabaseExists(cfg)

	// 2. Conectar a la base de datos específica
	dsn := cfg.GetDSN()
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error al conectar con la base de datos MySQL: %v", err)
	}

	// 3. Auto-migraciones
	err = db.AutoMigrate(&TableModel{})
	if err != nil {
		log.Printf("Advertencia: Falló la auto-migración: %v", err)
	}

	log.Println("Conexión exitosa a la base de datos MySQL y tablas verificadas")
	return db
}

func ensureDatabaseExists(cfg *config.Config) {
	dsn := cfg.GetRootDSN()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error al conectar al servidor MySQL para verificar la DB: %v", err)
	}
	defer db.Close()

	query := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", cfg.DBName)
	_, err = db.Exec(query)
	if err != nil {
		log.Fatalf("Error al intentar crear la base de datos %s: %v", cfg.DBName, err)
	}
	log.Printf("Base de datos '%s' verificada/creada correctamente", cfg.DBName)
}
