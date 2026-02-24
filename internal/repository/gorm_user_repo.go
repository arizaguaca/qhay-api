package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/table/internal/domain"
	"github.com/arizaguaca/table/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type gormUserRepository struct {
	db *gorm.DB
}

func NewGormUserRepository(db *gorm.DB) domain.UserRepository {
	return &gormUserRepository{
		db: db,
	}
}

func (r *gormUserRepository) Create(ctx context.Context, user *domain.User) error {
	model := mysql.UserModel{
		ID:       user.ID,
		Name:     user.Name,
		Email:    user.Email,
		Password: user.Password,
		Role:     user.Role,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *gormUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var model mysql.UserModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.User{
		ID:        model.ID,
		Name:      model.Name,
		Email:     model.Email,
		Role:      model.Role,
		CreatedAt: time.UnixMilli(model.CreatedAt),
		UpdatedAt: time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *gormUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var model mysql.UserModel
	if err := r.db.WithContext(ctx).First(&model, "email = ?", email).Error; err != nil {
		return nil, err
	}

	return &domain.User{
		ID:        model.ID,
		Name:      model.Name,
		Email:     model.Email,
		Password:  model.Password,
		Role:      model.Role,
		CreatedAt: time.UnixMilli(model.CreatedAt),
		UpdatedAt: time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *gormUserRepository) Fetch(ctx context.Context) ([]*domain.User, error) {
	var models []mysql.UserModel
	if err := r.db.WithContext(ctx).Find(&models).Error; err != nil {
		return nil, err
	}

	users := make([]*domain.User, 0, len(models))
	for _, m := range models {
		users = append(users, &domain.User{
			ID:        m.ID,
			Name:      m.Name,
			Email:     m.Email,
			Role:      m.Role,
			CreatedAt: time.UnixMilli(m.CreatedAt),
			UpdatedAt: time.UnixMilli(m.UpdatedAt),
		})
	}

	return users, nil
}
