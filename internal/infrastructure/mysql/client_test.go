package mysql

import (
	"testing"

	"github.com/arizaguaca/table/internal/config"
)

func TestNewClient(t *testing.T) {
	// 1. Cargar configuración (usará defaults si no hay env vars)
	cfg := config.LoadConfig()

	// 2. Intentar crear el cliente
	db := NewClient(cfg)

	// 3. Verificar que no sea nil
	if db == nil {
		t.Fatal("El cliente de base de datos es nil")
	}

	// 4. Probar la conexión real (Ping)
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Error al obtener sql.DB desde GORM: %v", err)
	}

	err = sqlDB.Ping()
	if err != nil {
		t.Fatalf("No se pudo hacer ping a la base de datos (asegúrate de que MySQL esté corriendo): %v", err)
	}

	t.Log("¡Conexión probada con éxito!")
}
