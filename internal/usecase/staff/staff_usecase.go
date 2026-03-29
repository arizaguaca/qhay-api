package staff

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type staffUsecase struct {
	staffRepo      domain.StaffRepository
	contextTimeout time.Duration
}

func NewStaffUsecase(sr domain.StaffRepository, timeout time.Duration) domain.StaffUsecase {
	return &staffUsecase{
		staffRepo:      sr,
		contextTimeout: timeout,
	}
}

func (u *staffUsecase) Create(ctx context.Context, staff *domain.Staff) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	if staff.ID == "" {
		staff.ID = uuid.New().String()
	}

	// Encrypt password if provided (assuming some login might be needed later)
	if staff.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(staff.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		staff.Password = string(hashed)
	}

	staff.CreatedAt = time.Now()
	staff.UpdatedAt = time.Now()

	// Ensure new staff are active by default
	staff.IsActive = true

	return u.staffRepo.Create(ctx, staff)
}

func (u *staffUsecase) GetByID(ctx context.Context, id string) (*domain.Staff, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()
	return u.staffRepo.GetByID(ctx, id)
}

func (u *staffUsecase) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Staff, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()
	return u.staffRepo.GetByRestaurantID(ctx, restaurantID)
}

func (u *staffUsecase) Update(ctx context.Context, staff *domain.Staff) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	existing, err := u.staffRepo.GetByID(ctx, staff.ID)
	if err != nil {
		return err
	}

	// Preserve non-mutable fields
	staff.RestaurantID = existing.RestaurantID
	staff.CreatedAt = existing.CreatedAt
	
	// Preserve password if not updated
	if staff.Password == "" {
		staff.Password = existing.Password
	} else {
		hashed, err := bcrypt.GenerateFromPassword([]byte(staff.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		staff.Password = string(hashed)
	}

	staff.UpdatedAt = time.Now()
	return u.staffRepo.Update(ctx, staff)
}

func (u *staffUsecase) Delete(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()
	return u.staffRepo.Delete(ctx, id)
}
