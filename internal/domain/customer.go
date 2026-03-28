package domain

import (
	"context"
	"time"
)

type Customer struct {
	ID        string    `json:"id"`
	Name      string    `json:"name,omitempty"`
	Phone     string    `json:"phone"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CustomerRepository interface {
	Create(ctx context.Context, customer *Customer) error
	GetByID(ctx context.Context, id string) (*Customer, error)
	GetByPhone(ctx context.Context, phone string) (*Customer, error)
	Update(ctx context.Context, customer *Customer) error
}
