package menu_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/menu"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestMenuUsecase_Create(t *testing.T) {
	mockRepo := new(menu.MenuRepository)
	timeout := 10 * time.Second
	u := menu.NewMenuUsecase(mockRepo, timeout)




	item := &domain.MenuItem{
		RestaurantID: "res123",
		Name:         "Pizza",
		Price:        15.0,
	}

	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.MenuItem")).Return(nil)

	err := u.Create(context.Background(), item)

	assert.NoError(t, err)
	assert.NotEmpty(t, item.ID)
	mockRepo.AssertExpectations(t)
}

func TestMenuUsecase_GetByID(t *testing.T) {
	mockRepo := new(menu.MenuRepository)
	timeout := 10 * time.Second
	u := menu.NewMenuUsecase(mockRepo, timeout)




	itemID := "item123"
	expectedItem := &domain.MenuItem{
		ID:   itemID,
		Name: "Pizza",
	}

	mockRepo.On("GetByID", mock.Anything, itemID).Return(expectedItem, nil)

	item, err := u.GetByID(context.Background(), itemID)

	assert.NoError(t, err)
	assert.Equal(t, expectedItem, item)
	mockRepo.AssertExpectations(t)
}
