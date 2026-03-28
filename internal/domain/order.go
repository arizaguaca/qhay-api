package domain

import (
	"context"
	"time"
)

type Order struct {
	ID           string       `json:"id"`
	RestaurantID string       `json:"restaurant_id"`
	CustomerID   string       `json:"customer_id"`
	TableNumber  int          `json:"table_number"`
	Items        []*OrderItem `json:"items"`
	Status       string       `json:"status"` // pending, preparing, ready, delivered, paid, cancelled
	TotalPrice   float64      `json:"total_price"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
}


type OrderItem struct {
	ID         string  `json:"id"`
	OrderID    string  `json:"order_id"`
	MenuItemID string  `json:"menu_item_id"`
	Name       string  `json:"name,omitempty"` // populated from MenuItem
	Quantity   int     `json:"quantity"`
	Price      float64 `json:"price"` // price at the time of order
}

const (
	OrderStatusPending   = "pending"
	OrderStatusPreparing = "preparing"
	OrderStatusReady     = "ready"
	OrderStatusDelivered = "delivered"
	OrderStatusPaid      = "paid"
	OrderStatusCancelled = "cancelled"
)

type OrderRepository interface {
	Create(ctx context.Context, order *Order) error
	GetByID(ctx context.Context, id string) (*Order, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*Order, error)
	FetchByCustomerID(ctx context.Context, customerID string) ([]*Order, error)
	UpdateStatus(ctx context.Context, id string, status string) error
	Update(ctx context.Context, order *Order) error
}

type OrderUsecase interface {
	Create(ctx context.Context, order *Order) error
	GetByID(ctx context.Context, id string) (*Order, error)
	FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*Order, error)
	FetchByCustomerID(ctx context.Context, customerID string) ([]*Order, error)
	UpdateStatus(ctx context.Context, id string, status string) error
}

