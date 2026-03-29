package order

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type orderUsecase struct {
	orderRepo      domain.OrderRepository
	contextTimeout time.Duration
}

func NewOrderUsecase(or domain.OrderRepository, timeout time.Duration) domain.OrderUsecase {
	return &orderUsecase{
		orderRepo:      or,
		contextTimeout: timeout,
	}
}

func (u *orderUsecase) Create(ctx context.Context, order *domain.Order) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if order.ID == "" {
		order.ID = uuid.New().String()
	}
	order.Status = domain.OrderStatusPending
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	for _, item := range order.Items {
		if item.ID == "" {
			item.ID = uuid.New().String()
		}
		item.OrderID = order.ID
	}

	return u.orderRepo.Create(ctx, order)
}

func (u *orderUsecase) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.orderRepo.GetByID(ctx, id)
}

func (u *orderUsecase) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.orderRepo.FetchByRestaurantID(ctx, restaurantID)
}

func (u *orderUsecase) FetchByCustomerID(ctx context.Context, customerID string) ([]*domain.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.orderRepo.FetchByCustomerID(ctx, customerID)
}

func (u *orderUsecase) UpdateStatus(ctx context.Context, id string, status string) error {

	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.orderRepo.UpdateStatus(ctx, id, status)
}
