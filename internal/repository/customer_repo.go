package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type customerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) domain.CustomerRepository {
	return &customerRepository{
		db: db,
	}
}

func (r *customerRepository) Create(ctx context.Context, customer *domain.Customer) error {
	model := mysql.CustomerModel{
		ID:       customer.ID,
		Name:     customer.Name,
		Phone:    customer.Phone,
		IsActive: customer.IsActive,
	}
	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *customerRepository) GetByID(ctx context.Context, id string) (*domain.Customer, error) {
	var model mysql.CustomerModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &domain.Customer{
		ID:        model.ID,
		Name:      model.Name,
		Phone:     model.Phone,
		IsActive:  model.IsActive,
		CreatedAt: time.UnixMilli(model.CreatedAt),
		UpdatedAt: time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *customerRepository) GetByPhone(ctx context.Context, phone string) (*domain.Customer, error) {
	var model mysql.CustomerModel
	if err := r.db.WithContext(ctx).First(&model, "phone = ?", phone).Error; err != nil {
		return nil, err
	}
	return &domain.Customer{
		ID:        model.ID,
		Name:      model.Name,
		Phone:     model.Phone,
		IsActive:  model.IsActive,
		CreatedAt: time.UnixMilli(model.CreatedAt),
		UpdatedAt: time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *customerRepository) Update(ctx context.Context, customer *domain.Customer) error {
	model := mysql.CustomerModel{
		ID:       customer.ID,
		Name:     customer.Name,
		Phone:    customer.Phone,
		IsActive: customer.IsActive,
	}
	return r.db.WithContext(ctx).Save(&model).Error
}
