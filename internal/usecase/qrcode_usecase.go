package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
)

type qrCodeUsecase struct {
	qrCodeRepo     domain.QRCodeRepository
	contextTimeout time.Duration
	baseUrl        string // Base URL for the menu, e.g., https://qhay.app/menu/
}

func NewQRCodeUsecase(qr domain.QRCodeRepository, timeout time.Duration, baseUrl string) domain.QRCodeUsecase {
	return &qrCodeUsecase{
		qrCodeRepo:     qr,
		contextTimeout: timeout,
		baseUrl:        baseUrl,
	}
}

func (u *qrCodeUsecase) Generate(ctx context.Context, restaurantID string, tableNumber int) (*domain.QRCode, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// Check if a QR already exists for this table
	existing, err := u.qrCodeRepo.GetByTableNumber(ctx, restaurantID, tableNumber)
	if err == nil && existing != nil {
		return existing, nil
	}

	qrCode := &domain.QRCode{
		ID:           uuid.New().String(),
		RestaurantID: restaurantID,
		TableNumber:  tableNumber,
		Label:        fmt.Sprintf("Mesa %d", tableNumber),
		Code:         fmt.Sprintf("%s/restaurants/%s?table=%d", u.baseUrl, restaurantID, tableNumber),
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := u.qrCodeRepo.Create(ctx, qrCode); err != nil {
		return nil, err
	}

	return qrCode, nil
}

func (u *qrCodeUsecase) GenerateImage(ctx context.Context, code string) ([]byte, error) {
	var png []byte
	png, err := qrcode.Encode(code, qrcode.Medium, 256)
	if err != nil {
		return nil, err
	}
	return png, nil
}

func (u *qrCodeUsecase) GetByID(ctx context.Context, id string) (*domain.QRCode, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.qrCodeRepo.GetByID(ctx, id)
}

func (u *qrCodeUsecase) GetByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.QRCode, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.qrCodeRepo.GetByRestaurantID(ctx, restaurantID)
}

func (u *qrCodeUsecase) Delete(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.qrCodeRepo.Delete(ctx, id)
}
