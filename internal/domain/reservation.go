package domain

import (
	"context"
	"time"
)

type Reservation struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	RestaurantID    string    `json:"restaurant_id"`
	TableNumber     int       `json:"table_number"`
	ReservationDate time.Time `json:"reservation_date"`
	Guests          int       `json:"guests"`
	Status          string    `json:"status"` // pending, confirmed, cancelled, completed
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type ReservationRepository interface {
	Create(ctx context.Context, reservation *Reservation) error
	GetByID(ctx context.Context, id string) (*Reservation, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*Reservation, error)
	FetchByUserID(ctx context.Context, userID string) ([]*Reservation, error)
	UpdateStatus(ctx context.Context, id string, status string) error
	Update(ctx context.Context, reservation *Reservation) error
}

type ReservationUsecase interface {
	Create(ctx context.Context, reservation *Reservation) error
	GetByID(ctx context.Context, id string) (*Reservation, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*Reservation, error)
	FetchByUserID(ctx context.Context, userID string) ([]*Reservation, error)
	UpdateStatus(ctx context.Context, id string, status string) error
}
