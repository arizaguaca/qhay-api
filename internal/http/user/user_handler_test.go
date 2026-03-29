package user_test

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/http/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUserHandler_Create(t *testing.T) {
	mockUsecase := new(user.UserUsecase)
	handler := user.NewUserHandler(mockUsecase)

	user := &domain.User{
		Name:  "Test User",
		Email: "test@example.com",
	}
	userJSON, _ := json.Marshal(user)

	mockUsecase.On("Create", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)

	req := httptest.NewRequest("POST", "/users", bytes.NewBuffer(userJSON))
	rr := httptest.NewRecorder()

	handler.Create(rr, req)

	assert.Equal(t, 201, rr.Code)

	mockUsecase.AssertExpectations(t)
}

func TestUserHandler_Login_Success(t *testing.T) {
	mockUsecase := new(user.UserUsecase)
	handler := user.NewUserHandler(mockUsecase)

	input := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{
		Email:    "test@example.com",
		Password: "password123",
	}
	inputJSON, _ := json.Marshal(input)

	mockUsecase.On("Login", mock.Anything, input.Email, input.Password).Return(&domain.User{ID: "123", Email: input.Email}, nil)

	req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(inputJSON))
	rr := httptest.NewRecorder()

	handler.Login(rr, req)

	assert.Equal(t, 200, rr.Code)
	mockUsecase.AssertExpectations(t)
}

func TestUserHandler_Login_InvalidCredentials(t *testing.T) {
	mockUsecase := new(user.UserUsecase)
	handler := user.NewUserHandler(mockUsecase)

	input := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{
		Email:    "test@example.com",
		Password: "wrong_password",
	}
	inputJSON, _ := json.Marshal(input)

	mockUsecase.On("Login", mock.Anything, input.Email, input.Password).Return(nil, domain.ErrInvalidCredentials)

	req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(inputJSON))
	rr := httptest.NewRecorder()

	handler.Login(rr, req)

	assert.Equal(t, 401, rr.Code)
	mockUsecase.AssertExpectations(t)
}
