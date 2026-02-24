package domain

import (
	"context"
	"time"
)

// Table representa el núcleo del negocio
type Table struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Columns   []string  `json:"columns"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableRepository define el contrato para la persistencia
type TableRepository interface {
	Create(ctx context.Context, table *Table) error
	GetByID(ctx context.Context, id string) (*Table, error)
	Fetch(ctx context.Context) ([]*Table, error)
}

// TableUsecase define el contrato para la lógica de negocio
type TableUsecase interface {
	Create(ctx context.Context, table *Table) error
	GetByID(ctx context.Context, id string) (*Table, error)
	Fetch(ctx context.Context) ([]*Table, error)
}
