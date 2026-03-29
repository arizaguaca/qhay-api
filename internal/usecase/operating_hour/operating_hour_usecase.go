package operating_hour

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type operatingHourUsecase struct {
	repo           domain.OperatingHourRepository
	contextTimeout time.Duration
}

func NewOperatingHourUsecase(repo domain.OperatingHourRepository, timeout time.Duration) domain.OperatingHourUsecase {
	return &operatingHourUsecase{
		repo:           repo,
		contextTimeout: timeout,
	}
}

func (u *operatingHourUsecase) SaveHours(ctx context.Context, restaurantID string, hours []*domain.OperatingHour) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	for _, hour := range hours {
		existing, err := u.repo.GetByRestaurantAndDay(ctx, restaurantID, hour.DayOfWeek)
		if err == nil {
			// Update existing
			hour.ID = existing.ID
			hour.RestaurantID = restaurantID
			hour.UpdatedAt = time.Now()
			if err := u.repo.Update(ctx, hour); err != nil {
				return err
			}
		} else {
			// Create new
			hour.ID = uuid.New().String()
			hour.RestaurantID = restaurantID
			hour.CreatedAt = time.Now()
			hour.UpdatedAt = time.Now()
			if err := u.repo.Create(ctx, hour); err != nil {
				return err
			}
		}
	}
	return nil
}

func (u *operatingHourUsecase) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.OperatingHour, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()
	return u.repo.GetByRestaurantID(ctx, restaurantID)
}
