package usecase

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
	userRepo       domain.UserRepository
	smsService     domain.SMSService
	contextTimeout time.Duration
}

func NewVerificationUsecase(
	vr domain.VerificationRepository,
	ur domain.UserRepository,
	sms domain.SMSService,
	timeout time.Duration,
) domain.VerificationUsecase {
	return &verificationUsecase{
		verifyRepo:     vr,
		userRepo:       ur,
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

func (u *verificationUsecase) VerifyCode(ctx context.Context, phone string, code string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	verification, err := u.verifyRepo.GetLatestByPhone(ctx, phone)
	if err != nil {
		return false, err
	}

	if verification.Code != code {
		return false, nil
	}

	// Code is valid - find or create user
	user, err := u.userRepo.GetByPhone(ctx, phone)
	if err != nil {
		// User doesn't exist, they should be redirected to registration or we create a skeleton
		return true, nil
	}

	// Update user as verified
	user.IsVerified = true
	if err := u.userRepo.Update(ctx, user); err != nil {
		return true, err
	}

	return true, nil
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
