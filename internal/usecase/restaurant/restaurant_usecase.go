package restaurant

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type restaurantUsecase struct {
	restaurantRepo domain.RestaurantRepository
	contextTimeout time.Duration
}

func NewRestaurantUsecase(rr domain.RestaurantRepository, timeout time.Duration) domain.RestaurantUsecase {
	return &restaurantUsecase{
		restaurantRepo: rr,
		contextTimeout: timeout,
	}
}

func (u *restaurantUsecase) Create(ctx context.Context, restaurant *domain.Restaurant) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if restaurant.ID == "" {
		restaurant.ID = uuid.New().String()
	}
	restaurant.CreatedAt = time.Now()
	restaurant.UpdatedAt = time.Now()

	return u.restaurantRepo.Create(ctx, restaurant)
}

func (u *restaurantUsecase) GetByID(ctx context.Context, id string) (*domain.Restaurant, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.restaurantRepo.GetByID(ctx, id)
}

func (u *restaurantUsecase) Fetch(ctx context.Context) ([]*domain.Restaurant, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.restaurantRepo.Fetch(ctx)
}

func (u *restaurantUsecase) GetByOwnerID(ctx context.Context, ownerID string) ([]*domain.Restaurant, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.restaurantRepo.GetByOwnerID(ctx, ownerID)
}

func (u *restaurantUsecase) Update(ctx context.Context, restaurant *domain.Restaurant) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	existing, err := u.restaurantRepo.GetByID(ctx, restaurant.ID)
	if err != nil {
		return err
	}

	// Evitar que se modifique el OwnerID
	restaurant.OwnerID = existing.OwnerID
	
	// Mantener el CreatedAt original
	restaurant.CreatedAt = existing.CreatedAt

	// Si el LogoURL viene vacío en el body, mantenemos el que ya tenía
	if restaurant.LogoURL == "" {
		restaurant.LogoURL = existing.LogoURL
	}

	restaurant.UpdatedAt = time.Now()
	return u.restaurantRepo.Update(ctx, restaurant)
}
