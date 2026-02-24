package domain

import (
	"context"
	"time"
)

type QRCode struct {
	ID           string    `json:"id"`
	RestaurantID string    `json:"restaurant_id"`
	TableNumber  int       `json:"table_number"`
	Label        string    `json:"label"`
	Code         string    `json:"code"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type QRCodeRepository interface {
	Create(ctx context.Context, qrCode *QRCode) error
	GetByID(ctx context.Context, id string) (*QRCode, error)
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*QRCode, error)
	GetByTableNumber(ctx context.Context, restaurantID string, tableNumber int) (*QRCode, error)
	Delete(ctx context.Context, id string) error
}

type QRCodeUsecase interface {
	Generate(ctx context.Context, restaurantID string, tableNumber int) (*QRCode, error)
	GenerateImage(ctx context.Context, code string) ([]byte, error)
	GetByID(ctx context.Context, id string) (*QRCode, error)
	GetByRestaurantID(ctx context.Context, restaurantID string) ([]*QRCode, error)
	Delete(ctx context.Context, id string) error
}
