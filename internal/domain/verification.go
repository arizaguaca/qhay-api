package domain

import (
	"context"
	"time"
)

type VerificationCode struct {
	ID        string    `json:"id"`
	Phone     string    `json:"phone"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type SMSService interface {
	SendSMS(ctx context.Context, phone string, message string) error
}

type VerificationRepository interface {
	Create(ctx context.Context, verify *VerificationCode) error
	GetLatestByPhone(ctx context.Context, phone string) (*VerificationCode, error)
	DeleteByPhone(ctx context.Context, phone string) error
}

type VerificationUsecase interface {
	SendCode(ctx context.Context, phone string) error
	VerifyCode(ctx context.Context, phone string, code string) (bool, error)
}
