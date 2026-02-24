package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type qrCodeRepository struct {
	db *gorm.DB
}

func NewQRCodeRepository(db *gorm.DB) domain.QRCodeRepository {
	return &qrCodeRepository{
		db: db,
	}
}

func (r *qrCodeRepository) Create(ctx context.Context, qrCode *domain.QRCode) error {
	model := mysql.QRCodeModel{
		ID:           qrCode.ID,
		RestaurantID: qrCode.RestaurantID,
		TableNumber:  qrCode.TableNumber,
		Label:        qrCode.Label,
		Code:         qrCode.Code,
		IsActive:     qrCode.IsActive,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *qrCodeRepository) GetByID(ctx context.Context, id string) (*domain.QRCode, error) {
	var model mysql.QRCodeModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &domain.QRCode{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		TableNumber:  model.TableNumber,
		Label:        model.Label,
		Code:         model.Code,
		IsActive:     model.IsActive,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *qrCodeRepository) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.QRCode, error) {
	var models []mysql.QRCodeModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Find(&models).Error; err != nil {
		return nil, err
	}

	qrCodes := make([]*domain.QRCode, 0, len(models))
	for _, m := range models {
		qrCodes = append(qrCodes, &domain.QRCode{
			ID:           m.ID,
			RestaurantID: m.RestaurantID,
			TableNumber:  m.TableNumber,
			Label:        m.Label,
			Code:         m.Code,
			IsActive:     m.IsActive,
			CreatedAt:    time.UnixMilli(m.CreatedAt),
			UpdatedAt:    time.UnixMilli(m.UpdatedAt),
		})
	}

	return qrCodes, nil
}

func (r *qrCodeRepository) GetByTableNumber(ctx context.Context, restaurantID string, tableNumber int) (*domain.QRCode, error) {
	var model mysql.QRCodeModel
	if err := r.db.WithContext(ctx).Where("restaurant_id = ? AND table_number = ?", restaurantID, tableNumber).First(&model).Error; err != nil {
		return nil, err
	}

	return &domain.QRCode{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		TableNumber:  model.TableNumber,
		Label:        model.Label,
		Code:         model.Code,
		IsActive:     model.IsActive,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *qrCodeRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&mysql.QRCodeModel{}, "id = ?", id).Error
}
