package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/table/internal/domain"
	"github.com/arizaguaca/table/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type gormMenuRepository struct {
	db *gorm.DB
}

func NewGormMenuRepository(db *gorm.DB) domain.MenuRepository {
	return &gormMenuRepository{
		db: db,
	}
}

func (r *gormMenuRepository) Create(ctx context.Context, item *domain.MenuItem) error {
	model := mysql.MenuItemModel{
		ID:           item.ID,
		RestaurantID: item.RestaurantID,
		Name:         item.Name,
		Description:  item.Description,
		Price:        item.Price,
		ImageURL:     item.ImageURL,
		IsAvailable:  item.IsAvailable,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *gormMenuRepository) GetByID(ctx context.Context, id string) (*domain.MenuItem, error) {
	var model mysql.MenuItemModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.MenuItem{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		Name:         model.Name,
		Description:  model.Description,
		Price:        model.Price,
		ImageURL:     model.ImageURL,
		IsAvailable:  model.IsAvailable,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *gormMenuRepository) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.MenuItem, error) {
	var models []mysql.MenuItemModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Find(&models).Error; err != nil {
		return nil, err
	}

	items := make([]*domain.MenuItem, 0, len(models))
	for _, m := range models {
		items = append(items, &domain.MenuItem{
			ID:           m.ID,
			RestaurantID: m.RestaurantID,
			Name:         m.Name,
			Description:  m.Description,
			Price:        m.Price,
			ImageURL:     m.ImageURL,
			IsAvailable:  m.IsAvailable,
			CreatedAt:    time.UnixMilli(m.CreatedAt),
			UpdatedAt:    time.UnixMilli(m.UpdatedAt),
		})
	}

	return items, nil
}

func (r *gormMenuRepository) Update(ctx context.Context, item *domain.MenuItem) error {
	return r.db.WithContext(ctx).Model(&mysql.MenuItemModel{}).Where("id = ?", item.ID).Updates(map[string]interface{}{
		"name":         item.Name,
		"description":  item.Description,
		"price":        item.Price,
		"image_url":    item.ImageURL,
		"is_available": item.IsAvailable,
	}).Error
}

func (r *gormMenuRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&mysql.MenuItemModel{}, "id = ?", id).Error
}
