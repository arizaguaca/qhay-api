package domain

import (
	"context"
	"time"
)

type Staff struct {
	ID           string    `json:"id"`
	RestaurantID string    `json:"restaurant_id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Password     string    `json:"password,omitempty"`
	Role         string    `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type StaffRepository interface {
	Create(ctx context.Context, staff *Staff) error
	GetByID(ctx context.Context, id string) (*Staff, error)
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*Staff, error)
	Update(ctx context.Context, staff *Staff) error
	Delete(ctx context.Context, id string) error
}

type StaffUsecase interface {
	Create(ctx context.Context, staff *Staff) error
	GetByID(ctx context.Context, id string) (*Staff, error)
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*Staff, error)
	Update(ctx context.Context, staff *Staff) error
	Delete(ctx context.Context, id string) error
}
