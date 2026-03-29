package verification

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/google/uuid"
)

type verificationUsecase struct {
	verifyRepo     domain.VerificationRepository
	customerRepo   domain.CustomerRepository
	smsService     domain.SMSService
	contextTimeout time.Duration
}

func NewVerificationUsecase(
	vr domain.VerificationRepository,
	cr domain.CustomerRepository,
	sms domain.SMSService,
	timeout time.Duration,
) domain.VerificationUsecase {
	return &verificationUsecase{
		verifyRepo:     vr,
		customerRepo:   cr,
		smsService:     sms,
		contextTimeout: timeout,
	}
}


func (u *verificationUsecase) SendCode(ctx context.Context, phone string) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	// Generate 6-digit code
	code, _ := generateRandomCode(6)

	verification := &domain.VerificationCode{
		ID:        uuid.New().String(),
		Phone:     phone,
		Code:      code,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := u.verifyRepo.Create(ctx, verification); err != nil {
		return err
	}

	message := fmt.Sprintf("Tu codigo de verificacion para QHay es: %s", code)
	return u.smsService.SendSMS(ctx, phone, message)
}

func (u *verificationUsecase) VerifyCode(ctx context.Context, phone string, code string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	verification, err := u.verifyRepo.GetLatestByPhone(ctx, phone)
	if err != nil {
		return "", err
	}

	if verification.Code != code {
		return "", fmt.Errorf("invalid verification code")
	}

	// Code is valid - find or create customer
	customer, err := u.customerRepo.GetByPhone(ctx, phone)
	if err != nil {
		// Customer doesn't exist, create a new one
		newCustomer := &domain.Customer{
			ID:        uuid.New().String(),
			Name:      "Customer",
			Phone:     phone,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := u.customerRepo.Create(ctx, newCustomer); err != nil {
			return "", err
		}
		return newCustomer.ID, nil
	}

	return customer.ID, nil
}



func generateRandomCode(n int) (string, error) {
	const digits = "0123456789"
	result := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		result[i] = digits[num.Int64()]
	}
	return string(result), nil
}
