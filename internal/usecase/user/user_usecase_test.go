package user_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUserUsecase_Create(t *testing.T) {
	mockRepo := new(user.UserRepository)
	timeout := 10 * time.Second
	u := user.NewUserUsecase(mockRepo, timeout)




	user := &domain.User{
		Name:  "Test User",
		Email: "test@example.com",
	}

	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)

	err := u.Create(context.Background(), user)

	assert.NoError(t, err)
	assert.NotEmpty(t, user.ID)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_GetByID(t *testing.T) {
	mockRepo := new(user.UserRepository)
	timeout := 10 * time.Second
	u := user.NewUserUsecase(mockRepo, timeout)


	userID := "123"
	expectedUser := &domain.User{
		ID:    userID,
		Name:  "Test User",
		Email: "test@example.com",
	}

	mockRepo.On("GetByID", mock.Anything, userID).Return(expectedUser, nil)

	user, err := u.GetByID(context.Background(), userID)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_Login_Success(t *testing.T) {
	mockRepo := new(user.UserRepository)
	timeout := 10 * time.Second
	u := user.NewUserUsecase(mockRepo, timeout)


	email := "test@example.com"
	password := "hashed_password"
	expectedUser := &domain.User{
		ID:       "123",
		Email:    email,
		Password: password,
	}

	mockRepo.On("GetByEmail", mock.Anything, email).Return(expectedUser, nil)

	user, err := u.Login(context.Background(), email, password)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
	mockRepo.AssertExpectations(t)
}

func TestUserUsecase_Login_InvalidCredentials(t *testing.T) {
	mockRepo := new(user.UserRepository)
	timeout := 10 * time.Second
	u := user.NewUserUsecase(mockRepo, timeout)


	email := "test@example.com"
	password := "wrong_password"
	existingUser := &domain.User{
		ID:       "123",
		Email:    email,
		Password: "correct_password",
	}

	mockRepo.On("GetByEmail", mock.Anything, email).Return(existingUser, nil)

	user, err := u.Login(context.Background(), email, password)

	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Equal(t, domain.ErrInvalidCredentials, err)
	mockRepo.AssertExpectations(t)
}
