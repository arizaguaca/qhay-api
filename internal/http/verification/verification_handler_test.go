package verification_test

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/http/verification"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)


func TestVerificationHandler_SendCode_NewCustomer(t *testing.T) {
	mockVerifyUsecase := new(verification.VerificationUsecase)
	mockCustomerRepo := new(verification.CustomerRepository)
	handler := verification.NewVerificationHandler(mockVerifyUsecase, mockCustomerRepo)



	phone := "+1234567890"
	input := struct {
		Phone string `json:"phone"`
	}{Phone: phone}
	inputJSON, _ := json.Marshal(input)

	mockCustomerRepo.On("GetByPhone", mock.Anything, phone).Return(nil, assert.AnError)
	mockVerifyUsecase.On("SendCode", mock.Anything, phone).Return(nil)

	req := httptest.NewRequest("POST", "/auth/send-code", bytes.NewBuffer(inputJSON))
	rr := httptest.NewRecorder()

	handler.SendCode(rr, req)

	assert.Equal(t, 200, rr.Code)
	
	var response map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&response)
	assert.Equal(t, false, response["exists"])
	
	mockVerifyUsecase.AssertExpectations(t)
	mockCustomerRepo.AssertExpectations(t)
}

func TestVerificationHandler_SendCode_ExistingCustomer(t *testing.T) {
	mockVerifyUsecase := new(verification.VerificationUsecase)
	mockCustomerRepo := new(verification.CustomerRepository)
	handler := verification.NewVerificationHandler(mockVerifyUsecase, mockCustomerRepo)



	phone := "+1234567890"
	input := struct {
		Phone string `json:"phone"`
	}{Phone: phone}
	inputJSON, _ := json.Marshal(input)
	
	existingCustomer := &domain.Customer{ID: "cust123", Phone: phone}

	mockCustomerRepo.On("GetByPhone", mock.Anything, phone).Return(existingCustomer, nil)

	req := httptest.NewRequest("POST", "/auth/send-code", bytes.NewBuffer(inputJSON))
	rr := httptest.NewRecorder()

	handler.SendCode(rr, req)

	assert.Equal(t, 200, rr.Code)
	
	var response map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&response)
	assert.Equal(t, true, response["exists"])
	assert.Equal(t, existingCustomer.ID, response["customer_id"])

	mockCustomerRepo.AssertExpectations(t)
}
