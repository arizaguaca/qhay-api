package restaurant_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/restaurant"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRestaurantUsecase_Create(t *testing.T) {
	mockRepo := new(restaurant.RestaurantRepository)
	timeout := 10 * time.Second
	u := restaurant.NewRestaurantUsecase(mockRepo, timeout)




	restaurant := &domain.Restaurant{
		Name:    "Test Restaurant",
		Address: "123 Test St",
		Phone:   "1234567890",
		OwnerID: "owner123",
	}

	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.Restaurant")).Return(nil)

	err := u.Create(context.Background(), restaurant)

	assert.NoError(t, err)
	assert.NotEmpty(t, restaurant.ID)
	mockRepo.AssertExpectations(t)
}

func TestRestaurantUsecase_GetByID(t *testing.T) {
	mockRepo := new(restaurant.RestaurantRepository)
	timeout := 10 * time.Second
	u := restaurant.NewRestaurantUsecase(mockRepo, timeout)




	restaurantID := "res123"
	expectedRestaurant := &domain.Restaurant{
		ID:   restaurantID,
		Name: "Test Restaurant",
	}

	mockRepo.On("GetByID", mock.Anything, restaurantID).Return(expectedRestaurant, nil)

	restaurant, err := u.GetByID(context.Background(), restaurantID)

	assert.NoError(t, err)
	assert.Equal(t, expectedRestaurant, restaurant)
	mockRepo.AssertExpectations(t)
}
