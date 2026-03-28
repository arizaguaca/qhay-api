package usecase

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type reservationUsecase struct {
	reservationRepo domain.ReservationRepository
	contextTimeout  time.Duration
}

func NewReservationUsecase(rr domain.ReservationRepository, timeout time.Duration) domain.ReservationUsecase {
	return &reservationUsecase{
		reservationRepo: rr,
		contextTimeout:  timeout,
	}
}

func (u *reservationUsecase) Create(ctx context.Context, res *domain.Reservation) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if res.ID == "" {
		res.ID = uuid.New().String()
	}
	if res.Status == "" {
		res.Status = "pending"
	}
	res.CreatedAt = time.Now()
	res.UpdatedAt = time.Now()

	return u.reservationRepo.Create(ctx, res)
}

func (u *reservationUsecase) GetByID(ctx context.Context, id string) (*domain.Reservation, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.reservationRepo.GetByID(ctx, id)
}

func (u *reservationUsecase) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Reservation, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.reservationRepo.FetchByRestaurantID(ctx, restaurantID)
}

func (u *reservationUsecase) FetchByUserID(ctx context.Context, userID string) ([]*domain.Reservation, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.reservationRepo.FetchByUserID(ctx, userID)
}

func (u *reservationUsecase) UpdateStatus(ctx context.Context, id string, status string) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.reservationRepo.UpdateStatus(ctx, id, status)
}
