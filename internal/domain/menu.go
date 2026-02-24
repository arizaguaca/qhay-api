package domain

import (
	"context"
	"time"
)

type MenuItem struct {
	ID           string    `json:"id"`
	RestaurantID string    `json:"restaurant_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Price        float64   `json:"price"`
	PrepTime     int       `json:"prep_time"` // in minutes
	ImageURL     string    `json:"image_url"`
	IsAvailable  bool      `json:"is_available"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type MenuRepository interface {
	Create(ctx context.Context, item *MenuItem) error
	GetByID(ctx context.Context, id string) (*MenuItem, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*MenuItem, error)
	Update(ctx context.Context, item *MenuItem) error
	Delete(ctx context.Context, id string) error
}

type MenuUsecase interface {
	Create(ctx context.Context, item *MenuItem) error
	GetByID(ctx context.Context, id string) (*MenuItem, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*MenuItem, error)
	Update(ctx context.Context, item *MenuItem) error
	Delete(ctx context.Context, id string) error
}
