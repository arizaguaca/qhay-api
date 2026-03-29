package order_test

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/http/order"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)


func TestOrderHandler_Create(t *testing.T) {
	mockUsecase := new(order.OrderUsecase)
	handler := order.NewOrderHandler(mockUsecase)


	order := &domain.Order{
		RestaurantID: "res123",
		CustomerID:   "cust123",
		TableNumber:  5,
	}
	orderJSON, _ := json.Marshal(order)

	mockUsecase.On("Create", mock.Anything, mock.AnythingOfType("*domain.Order")).Return(nil)

	req := httptest.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))
	rr := httptest.NewRecorder()

	handler.Create(rr, req)

	assert.Equal(t, 201, rr.Code)
	mockUsecase.AssertExpectations(t)
}

func TestOrderHandler_FetchByCustomer(t *testing.T) {
	mockUsecase := new(order.OrderUsecase)
	handler := order.NewOrderHandler(mockUsecase)


	customerID := "cust123"
	expectedOrders := []*domain.Order{
		{ID: "ord1", CustomerID: customerID},
	}

	mockUsecase.On("FetchByCustomerID", mock.Anything, customerID).Return(expectedOrders, nil)

	req := httptest.NewRequest("GET", "/orders?customer_id="+customerID, nil)
	rr := httptest.NewRecorder()

	handler.Fetch(rr, req)

	assert.Equal(t, 200, rr.Code)
	mockUsecase.AssertExpectations(t)
}
