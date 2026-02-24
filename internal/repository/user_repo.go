package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	model := mysql.UserModel{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		Phone:      user.Phone,
		Password:   user.Password,
		Role:       user.Role,
		IsVerified: user.IsVerified,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	model := mysql.UserModel{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		Phone:      user.Phone,
		Password:   user.Password,
		Role:       user.Role,
		IsVerified: user.IsVerified,
	}

	return r.db.WithContext(ctx).Save(&model).Error
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var model mysql.UserModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.User{
		ID:         model.ID,
		Name:       model.Name,
		Email:      model.Email,
		Phone:      model.Phone,
		Role:       model.Role,
		IsVerified: model.IsVerified,
		CreatedAt:  time.UnixMilli(model.CreatedAt),
		UpdatedAt:  time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var model mysql.UserModel
	if err := r.db.WithContext(ctx).First(&model, "email = ?", email).Error; err != nil {
		return nil, err
	}

	return &domain.User{
		ID:         model.ID,
		Name:       model.Name,
		Email:      model.Email,
		Phone:      model.Phone,
		Password:   model.Password,
		Role:       model.Role,
		IsVerified: model.IsVerified,
		CreatedAt:  time.UnixMilli(model.CreatedAt),
		UpdatedAt:  time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *userRepository) GetByPhone(ctx context.Context, phone string) (*domain.User, error) {
	var model mysql.UserModel
	if err := r.db.WithContext(ctx).First(&model, "phone = ?", phone).Error; err != nil {
		return nil, err
	}

	return &domain.User{
		ID:         model.ID,
		Name:       model.Name,
		Email:      model.Email,
		Phone:      model.Phone,
		Password:   model.Password,
		Role:       model.Role,
		IsVerified: model.IsVerified,
		CreatedAt:  time.UnixMilli(model.CreatedAt),
		UpdatedAt:  time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *userRepository) Fetch(ctx context.Context) ([]*domain.User, error) {
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
