package repository

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/arizaguaca/table/internal/domain"
	_ "github.com/go-sql-driver/mysql"
)

type mysqlTableRepository struct {
	db *sql.DB
}

// NewMysqlTableRepository crea un repositorio MySQL para Table
func NewMysqlTableRepository(db *sql.DB) domain.TableRepository {
	return &mysqlTableRepository{
		db: db,
	}
}

func (m *mysqlTableRepository) Create(ctx context.Context, table *domain.Table) error {
	columnsJSON, err := json.Marshal(table.Columns)
	if err != nil {
		return err
	}

	query := `INSERT INTO tables (id, name, columns, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
	_, err = m.db.ExecContext(ctx, query, table.ID, table.Name, columnsJSON, table.CreatedAt, table.UpdatedAt)
	return err
}

func (m *mysqlTableRepository) GetByID(ctx context.Context, id string) (*domain.Table, error) {
	query := `SELECT id, name, columns, created_at, updated_at FROM tables WHERE id = ?`
	row := m.db.QueryRowContext(ctx, query, id)

	var table domain.Table
	var columnsJSON []byte
	err := row.Scan(&table.ID, &table.Name, &columnsJSON, &table.CreatedAt, &table.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(columnsJSON, &table.Columns); err != nil {
		return nil, err
	}

	return &table, nil
}

func (m *mysqlTableRepository) Fetch(ctx context.Context) ([]*domain.Table, error) {
	query := `SELECT id, name, columns, created_at, updated_at FROM tables`
	rows, err := m.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tables := make([]*domain.Table, 0)
	for rows.Next() {
		var table domain.Table
		var columnsJSON []byte
		if err := rows.Scan(&table.ID, &table.Name, &columnsJSON, &table.CreatedAt, &table.UpdatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(columnsJSON, &table.Columns); err != nil {
			return nil, err
		}
		tables = append(tables, &table)
	}

	return tables, nil
}
