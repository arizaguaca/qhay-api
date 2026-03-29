package order_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/order"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestOrderUsecase_Create(t *testing.T) {
	mockRepo := new(order.OrderRepository)
	timeout := 10 * time.Second
	u := order.NewOrderUsecase(mockRepo, timeout)




	order := &domain.Order{
		RestaurantID: "res123",
		TableNumber:  1,
		Items: []*domain.OrderItem{
			{MenuItemID: "item1", Quantity: 2, Price: 10.0},
		},
	}

	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.Order")).Return(nil)

	err := u.Create(context.Background(), order)

	assert.NoError(t, err)
	assert.NotEmpty(t, order.ID)
	assert.Equal(t, domain.OrderStatusPending, order.Status)
	assert.NotEmpty(t, order.Items[0].ID)
	assert.Equal(t, order.ID, order.Items[0].OrderID)
	mockRepo.AssertExpectations(t)
}

func TestOrderUsecase_UpdateStatus(t *testing.T) {
	mockRepo := new(order.OrderRepository)
	timeout := 10 * time.Second
	u := order.NewOrderUsecase(mockRepo, timeout)


	orderID := "ord123"
	status := domain.OrderStatusPreparing

	mockRepo.On("UpdateStatus", mock.Anything, orderID, status).Return(nil)

	err := u.UpdateStatus(context.Background(), orderID, status)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
