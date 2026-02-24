package domain

import (
	"context"
	"time"
)

type OperatingHour struct {
	ID           string    `json:"id"`
	RestaurantID string    `json:"restaurant_id"`
	DayOfWeek    int       `json:"day_of_week"` // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	OpenTime     string    `json:"open_time"`   // HH:mm
	CloseTime    string    `json:"close_time"`  // HH:mm
	IsClosed     bool      `json:"is_closed"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type OperatingHourRepository interface {
	Create(ctx context.Context, hour *OperatingHour) error
	Update(ctx context.Context, hour *OperatingHour) error
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*OperatingHour, error)
	GetByRestaurantAndDay(ctx context.Context, restaurantID string, day int) (*OperatingHour, error)
	Delete(ctx context.Context, id string) error
}

type OperatingHourUsecase interface {
	SaveHours(ctx context.Context, restaurantID string, hours []*OperatingHour) error
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*OperatingHour, error)
}
