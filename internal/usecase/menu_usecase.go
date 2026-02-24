package usecase

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type menuUsecase struct {
	menuRepo       domain.MenuRepository
	contextTimeout time.Duration
}

func NewMenuUsecase(mr domain.MenuRepository, timeout time.Duration) domain.MenuUsecase {
	return &menuUsecase{
		menuRepo:       mr,
		contextTimeout: timeout,
	}
}

func (u *menuUsecase) Create(ctx context.Context, item *domain.MenuItem) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if item.ID == "" {
		item.ID = uuid.New().String()
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()

	return u.menuRepo.Create(ctx, item)
}

func (u *menuUsecase) GetByID(ctx context.Context, id string) (*domain.MenuItem, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.menuRepo.GetByID(ctx, id)
}

func (u *menuUsecase) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.MenuItem, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.menuRepo.FetchByRestaurantID(ctx, restaurantID)
}

func (u *menuUsecase) Update(ctx context.Context, item *domain.MenuItem) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	item.UpdatedAt = time.Now()

	return u.menuRepo.Update(ctx, item)
}

func (u *menuUsecase) Delete(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.menuRepo.Delete(ctx, id)
}
