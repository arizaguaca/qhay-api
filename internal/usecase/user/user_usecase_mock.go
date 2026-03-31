package user

import (
	"context"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/stretchr/testify/mock"
)

type UserUsecase struct {
	mock.Mock
}

func (m *UserUsecase) Create(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *UserUsecase) Login(ctx context.Context, email, password string) (*domain.User, error) {
	args := m.Called(ctx, email, password)
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *UserUsecase) GetByID(ctx context.Context, id string) (*domain.User, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *UserUsecase) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *UserUsecase) GetByPhone(ctx context.Context, phone string) (*domain.User, error) {
	args := m.Called(ctx, phone)
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *UserUsecase) GetStaffByRestaurant(ctx context.Context, restaurantID string) ([]*domain.User, error) {
	args := m.Called(ctx, restaurantID)
	return args.Get(0).([]*domain.User), args.Error(1)
}

func (m *UserUsecase) Fetch(ctx context.Context) ([]*domain.User, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*domain.User), args.Error(1)
}

func (m *UserUsecase) Update(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *UserUsecase) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
