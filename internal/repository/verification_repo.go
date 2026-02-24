package repository

import (
	"context"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type verificationRepository struct {
	db *gorm.DB
}

func NewVerificationRepository(db *gorm.DB) domain.VerificationRepository {
	return &verificationRepository{
		db: db,
	}
}

func (r *verificationRepository) Create(ctx context.Context, verify *domain.VerificationCode) error {
	model := mysql.VerificationCodeModel{
		ID:        verify.ID,
		Phone:     verify.Phone,
		Code:      verify.Code,
		ExpiresAt: verify.ExpiresAt.UnixMilli(),
	}
	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *verificationRepository) GetLatestByPhone(ctx context.Context, phone string) (*domain.VerificationCode, error) {
	var model mysql.VerificationCodeModel
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).Order("created_at DESC").First(&model).Error; err != nil {
		return nil, err
	}

	return &domain.VerificationCode{
		ID:    model.ID,
		Phone: model.Phone,
		Code:  model.Code,
	}, nil
}

func (r *verificationRepository) DeleteByPhone(ctx context.Context, phone string) error {
	return r.db.WithContext(ctx).Delete(&mysql.VerificationCodeModel{}, "phone = ?", phone).Error
}
