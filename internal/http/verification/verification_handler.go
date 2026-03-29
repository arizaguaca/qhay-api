package verification

import (
	"encoding/json"
	"net/http"

	"github.com/arizaguaca/qhay-api/internal/domain"
)

type VerificationHandler struct {
	Usecase      domain.VerificationUsecase
	CustomerRepo domain.CustomerRepository
}

func NewVerificationHandler(u domain.VerificationUsecase, cr domain.CustomerRepository) *VerificationHandler {
	return &VerificationHandler{
		Usecase:      u,
		CustomerRepo: cr,
	}
}


func (h *VerificationHandler) SendCode(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Phone string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 1. Check if customer already exists
	customer, err := h.CustomerRepo.GetByPhone(r.Context(), input.Phone)
	if err == nil && customer != nil {
		// Customer exists, skip code and return ID
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"exists":      true,
			"customer_id": customer.ID,
			"customer":    customer,
			"message":     "Existing customer, skip verification",
		})
		return
	}

	// 2. If not, send code as usual
	if err := h.Usecase.SendCode(r.Context(), input.Phone); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists":  false,
		"message": "Verification code sent",
	})
}


func (h *VerificationHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Phone string `json:"phone"`
		Code  string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, err := h.Usecase.VerifyCode(r.Context(), input.Phone, input.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Fetch full customer details to return to frontend
	customer, err := h.CustomerRepo.GetByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "Error fetching customer details", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"verified":    true,
		"customer_id": userID,
		"customer":    customer,
	})
}




