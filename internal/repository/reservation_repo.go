package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type reservationRepository struct {
	db *gorm.DB
}

func NewReservationRepository(db *gorm.DB) domain.ReservationRepository {
	return &reservationRepository{
		db: db,
	}
}

func (r *reservationRepository) Create(ctx context.Context, res *domain.Reservation) error {
	model := mysql.ReservationModel{
		ID:              res.ID,
		UserID:          res.UserID,
		RestaurantID:    res.RestaurantID,
		TableNumber:     res.TableNumber,
		ReservationDate: res.ReservationDate.UnixMilli(),
		Guests:          res.Guests,
		Status:          res.Status,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *reservationRepository) GetByID(ctx context.Context, id string) (*domain.Reservation, error) {
	var model mysql.ReservationModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return r.toDomain(&model), nil
}

func (r *reservationRepository) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Reservation, error) {
	var models []mysql.ReservationModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Order("reservation_date ASC").Find(&models).Error; err != nil {
		return nil, err
	}

	reservations := make([]*domain.Reservation, len(models))
	for i, m := range models {
		reservations[i] = r.toDomain(&m)
	}
	return reservations, nil
}

func (r *reservationRepository) FetchByUserID(ctx context.Context, userID string) ([]*domain.Reservation, error) {
	var models []mysql.ReservationModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("reservation_date DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	reservations := make([]*domain.Reservation, len(models))
	for i, m := range models {
		reservations[i] = r.toDomain(&m)
	}
	return reservations, nil
}

func (r *reservationRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	return r.db.WithContext(ctx).Model(&mysql.ReservationModel{}).Where("id = ?", id).Update("status", status).Error
}

func (r *reservationRepository) Update(ctx context.Context, res *domain.Reservation) error {
	model := mysql.ReservationModel{
		ID:              res.ID,
		UserID:          res.UserID,
		RestaurantID:    res.RestaurantID,
		TableNumber:     res.TableNumber,
		ReservationDate: res.ReservationDate.UnixMilli(),
		Guests:          res.Guests,
		Status:          res.Status,
	}
	return r.db.WithContext(ctx).Save(&model).Error
}

func (r *reservationRepository) toDomain(m *mysql.ReservationModel) *domain.Reservation {
	return &domain.Reservation{
		ID:              m.ID,
		UserID:          m.UserID,
		RestaurantID:    m.RestaurantID,
		TableNumber:     m.TableNumber,
		ReservationDate: time.UnixMilli(m.ReservationDate),
		Guests:          m.Guests,
		Status:          m.Status,
		CreatedAt:       time.UnixMilli(m.CreatedAt),
		UpdatedAt:       time.UnixMilli(m.UpdatedAt),
	}
}
