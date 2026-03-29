package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type staffRepository struct {
	db *gorm.DB
}

func NewStaffRepository(db *gorm.DB) domain.StaffRepository {
	return &staffRepository{db: db}
}

func (r *staffRepository) Create(ctx context.Context, staff *domain.Staff) error {
	model := mysql.StaffModel{
		ID:           staff.ID,
		RestaurantID: staff.RestaurantID,
		Name:         staff.Name,
		Email:        staff.Email,
		Password:     staff.Password,
		Role:         staff.Role,
		IsActive:     staff.IsActive,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *staffRepository) GetByID(ctx context.Context, id string) (*domain.Staff, error) {
	var model mysql.StaffModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.Staff{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		Name:         model.Name,
		Email:        model.Email,
		Password:     model.Password,
		Role:         model.Role,
		IsActive:     model.IsActive,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *staffRepository) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Staff, error) {
	var models []mysql.StaffModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Find(&models).Error; err != nil {
		return nil, err
	}

	staffList := make([]*domain.Staff, 0, len(models))
	for _, m := range models {
		staffList = append(staffList, &domain.Staff{
			ID:           m.ID,
			RestaurantID: m.RestaurantID,
			Name:         m.Name,
			Email:        m.Email,
			Role:         m.Role,
			IsActive:     m.IsActive,
			CreatedAt:    time.UnixMilli(m.CreatedAt),
			UpdatedAt:    time.UnixMilli(m.UpdatedAt),
		})
	}
	return staffList, nil
}

func (r *staffRepository) Update(ctx context.Context, staff *domain.Staff) error {
	model := mysql.StaffModel{
		ID:           staff.ID,
		RestaurantID: staff.RestaurantID,
		Name:         staff.Name,
		Email:        staff.Email,
		Password:     staff.Password,
		Role:         staff.Role,
		IsActive:     staff.IsActive,
	}
	return r.db.WithContext(ctx).Save(&model).Error
}

func (r *staffRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&mysql.StaffModel{}, "id = ?", id).Error
}
