package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type restaurantRepository struct {
	db *gorm.DB
}

func NewRestaurantRepository(db *gorm.DB) domain.RestaurantRepository {
	return &restaurantRepository{
		db: db,
	}
}

func (r *restaurantRepository) Create(ctx context.Context, restaurant *domain.Restaurant) error {
	model := mysql.RestaurantModel{
		ID:          restaurant.ID,
		Name:        restaurant.Name,
		Description: restaurant.Description,
		Address:     restaurant.Address,
		Phone:       restaurant.Phone,
		OwnerID:     restaurant.OwnerID,
		LogoURL:     restaurant.LogoURL,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *restaurantRepository) GetByID(ctx context.Context, id string) (*domain.Restaurant, error) {
	var model mysql.RestaurantModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.Restaurant{
		ID:          model.ID,
		Name:        model.Name,
		Description: model.Description,
		Address:     model.Address,
		Phone:       model.Phone,
		OwnerID:     model.OwnerID,
		LogoURL:     model.LogoURL,
		CreatedAt:   time.UnixMilli(model.CreatedAt),
		UpdatedAt:   time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *restaurantRepository) Fetch(ctx context.Context) ([]*domain.Restaurant, error) {
	var models []mysql.RestaurantModel
	if err := r.db.WithContext(ctx).Find(&models).Error; err != nil {
		return nil, err
	}

	restaurants := make([]*domain.Restaurant, 0, len(models))
	for _, m := range models {
		restaurants = append(restaurants, &domain.Restaurant{
			ID:          m.ID,
			Name:        m.Name,
			Description: m.Description,
			Address:     m.Address,
			Phone:       m.Phone,
			OwnerID:     m.OwnerID,
			LogoURL:     m.LogoURL,
			CreatedAt:   time.UnixMilli(m.CreatedAt),
			UpdatedAt:   time.UnixMilli(m.UpdatedAt),
		})
	}

	return restaurants, nil
}

func (r *restaurantRepository) GetByOwnerID(ctx context.Context, ownerID string) ([]*domain.Restaurant, error) {
	var models []mysql.RestaurantModel
	if err := r.db.WithContext(ctx).Where("owner_id = ?", ownerID).Find(&models).Error; err != nil {
		return nil, err
	}

	restaurants := make([]*domain.Restaurant, 0, len(models))
	for _, m := range models {
		restaurants = append(restaurants, &domain.Restaurant{
			ID:          m.ID,
			Name:        m.Name,
			Description: m.Description,
			Address:     m.Address,
			Phone:       m.Phone,
			OwnerID:     m.OwnerID,
			LogoURL:     m.LogoURL,
			CreatedAt:   time.UnixMilli(m.CreatedAt),
			UpdatedAt:   time.UnixMilli(m.UpdatedAt),
		})
	}

	return restaurants, nil
}

func (r *restaurantRepository) Update(ctx context.Context, restaurant *domain.Restaurant) error {
	model := mysql.RestaurantModel{
		ID:          restaurant.ID,
		Name:        restaurant.Name,
		Description: restaurant.Description,
		Address:     restaurant.Address,
		Phone:       restaurant.Phone,
		OwnerID:     restaurant.OwnerID,
		LogoURL:     restaurant.LogoURL,
	}

	return r.db.WithContext(ctx).Save(&model).Error
}
