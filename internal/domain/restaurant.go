package domain

import (
	"context"
	"time"
)

type Restaurant struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Address     string    `json:"address"`
	Phone       string    `json:"phone"`
	OwnerID     string    `json:"owner_id"`
	LogoURL     string    `json:"logo_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RestaurantRepository interface {
	Create(ctx context.Context, restaurant *Restaurant) error
	GetByID(ctx context.Context, id string) (*Restaurant, error)
	Fetch(ctx context.Context) ([]*Restaurant, error)
	GetByOwnerID(ctx context.Context, ownerID string) ([]*Restaurant, error)
	Update(ctx context.Context, restaurant *Restaurant) error
}

type RestaurantUsecase interface {
	Create(ctx context.Context, restaurant *Restaurant) error
	GetByID(ctx context.Context, id string) (*Restaurant, error)
	Fetch(ctx context.Context) ([]*Restaurant, error)
	GetByOwnerID(ctx context.Context, ownerID string) ([]*Restaurant, error)
	Update(ctx context.Context, restaurant *Restaurant) error
}
