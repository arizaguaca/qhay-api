package http

import (
	"encoding/json"
	"net/http"

	"github.com/arizaguaca/qhay-api/internal/domain"
)

type VerificationHandler struct {
	Usecase     domain.VerificationUsecase
	UserUsecase domain.UserUsecase
}

func NewVerificationHandler(u domain.VerificationUsecase, uu domain.UserUsecase) *VerificationHandler {
	return &VerificationHandler{
		Usecase:     u,
		UserUsecase: uu,
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

	if err := h.Usecase.SendCode(r.Context(), input.Phone); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Verification code sent"})
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

	success, err := h.Usecase.VerifyCode(r.Context(), input.Phone, input.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !success {
		http.Error(w, "Invalid verification code", http.StatusUnauthorized)
		return
	}

	// Check if user exists to tell frontend if registration is needed
	user, err := h.UserUsecase.GetByPhone(r.Context(), input.Phone)
	isRegistered := err == nil && user != nil

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"verified":      true,
		"is_registered": isRegistered,
		"user":          user,
	})
}
