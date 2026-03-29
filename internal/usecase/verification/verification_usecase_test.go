package verification_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/verification"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestVerificationUsecase_SendCode(t *testing.T) {
	mockVerifyRepo := new(verification.VerificationRepository)
	mockCustomerRepo := new(verification.CustomerRepository)
	mockSMS := new(verification.SMSService)
	timeout := 10 * time.Second
	u := verification.NewVerificationUsecase(mockVerifyRepo, mockCustomerRepo, mockSMS, timeout)




	phone := "+1234567890"

	mockVerifyRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.VerificationCode")).Return(nil)
	mockSMS.On("SendSMS", mock.Anything, phone, mock.Anything).Return(nil)

	err := u.SendCode(context.Background(), phone)

	assert.NoError(t, err)
	mockVerifyRepo.AssertExpectations(t)
	mockSMS.AssertExpectations(t)
}

func TestVerificationUsecase_VerifyCode_Success(t *testing.T) {
	mockVerifyRepo := new(verification.VerificationRepository)
	mockCustomerRepo := new(verification.CustomerRepository)
	mockSMS := new(verification.SMSService)
	timeout := 10 * time.Second
	u := verification.NewVerificationUsecase(mockVerifyRepo, mockCustomerRepo, mockSMS, timeout)



	phone := "+1234567890"
	code := "123456"
	verification := &domain.VerificationCode{
		Phone: phone,
		Code:  code,
	}
	existingCustomer := &domain.Customer{
		ID:    "cust123",
		Phone: phone,
	}

	mockVerifyRepo.On("GetLatestByPhone", mock.Anything, phone).Return(verification, nil)
	mockCustomerRepo.On("GetByPhone", mock.Anything, phone).Return(existingCustomer, nil)

	userID, err := u.VerifyCode(context.Background(), phone, code)

	assert.NoError(t, err)
	assert.Equal(t, existingCustomer.ID, userID)
	mockVerifyRepo.AssertExpectations(t)
	mockCustomerRepo.AssertExpectations(t)
}

func TestVerificationUsecase_VerifyCode_CreateCustomer(t *testing.T) {
	mockVerifyRepo := new(verification.VerificationRepository)
	mockCustomerRepo := new(verification.CustomerRepository)
	mockSMS := new(verification.SMSService)
	timeout := 10 * time.Second
	u := verification.NewVerificationUsecase(mockVerifyRepo, mockCustomerRepo, mockSMS, timeout)



	phone := "+1234567890"
	code := "123456"
	verification := &domain.VerificationCode{
		Phone: phone,
		Code:  code,
	}

	mockVerifyRepo.On("GetLatestByPhone", mock.Anything, phone).Return(verification, nil)
	mockCustomerRepo.On("GetByPhone", mock.Anything, phone).Return(nil, assert.AnError)
	mockCustomerRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.Customer")).Return(nil)

	userID, err := u.VerifyCode(context.Background(), phone, code)

	assert.NoError(t, err)
	assert.NotEmpty(t, userID)
	mockVerifyRepo.AssertExpectations(t)
	mockCustomerRepo.AssertExpectations(t)
}
