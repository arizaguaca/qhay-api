package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type operatingHourRepository struct {
	db *gorm.DB
}

func NewOperatingHourRepository(db *gorm.DB) domain.OperatingHourRepository {
	return &operatingHourRepository{
		db: db,
	}
}

func (r *operatingHourRepository) Create(ctx context.Context, hour *domain.OperatingHour) error {
	model := mysql.OperatingHourModel{
		ID:           hour.ID,
		RestaurantID: hour.RestaurantID,
		DayOfWeek:    hour.DayOfWeek,
		OpenTime:     hour.OpenTime,
		CloseTime:    hour.CloseTime,
		IsClosed:     hour.IsClosed,
	}
	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *operatingHourRepository) Update(ctx context.Context, hour *domain.OperatingHour) error {
	model := mysql.OperatingHourModel{
		ID:           hour.ID,
		RestaurantID: hour.RestaurantID,
		DayOfWeek:    hour.DayOfWeek,
		OpenTime:     hour.OpenTime,
		CloseTime:    hour.CloseTime,
		IsClosed:     hour.IsClosed,
	}
	return r.db.WithContext(ctx).Save(&model).Error
}

func (r *operatingHourRepository) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.OperatingHour, error) {
	var models []mysql.OperatingHourModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Order("day_of_week ASC").Find(&models).Error; err != nil {
		return nil, err
	}

	hours := make([]*domain.OperatingHour, 0, len(models))
	for _, m := range models {
		hours = append(hours, &domain.OperatingHour{
			ID:           m.ID,
			RestaurantID: m.RestaurantID,
			DayOfWeek:    m.DayOfWeek,
			OpenTime:     m.OpenTime,
			CloseTime:    m.CloseTime,
			IsClosed:     m.IsClosed,
			CreatedAt:    time.UnixMilli(m.CreatedAt),
			UpdatedAt:    time.UnixMilli(m.UpdatedAt),
		})
	}
	return hours, nil
}

func (r *operatingHourRepository) GetByRestaurantAndDay(ctx context.Context, restaurantID string, day int) (*domain.OperatingHour, error) {
	var model mysql.OperatingHourModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ? AND day_of_week = ?", restaurantID, day).First(&model).Error; err != nil {
		return nil, err
	}

	return &domain.OperatingHour{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		DayOfWeek:    model.DayOfWeek,
		OpenTime:     model.OpenTime,
		CloseTime:    model.CloseTime,
		IsClosed:     model.IsClosed,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *operatingHourRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&mysql.OperatingHourModel{}, "id = ?", id).Error
}
