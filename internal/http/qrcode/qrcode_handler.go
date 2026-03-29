package qrcode

import (
	"encoding/json"
	"net/http"


	"github.com/arizaguaca/qhay-api/internal/domain"
)

type QRCodeHandler struct {
	Usecase domain.QRCodeUsecase
}

func NewQRCodeHandler(u domain.QRCodeUsecase) *QRCodeHandler {
	return &QRCodeHandler{
		Usecase: u,
	}
}

func (h *QRCodeHandler) Generate(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RestaurantID string `json:"restaurant_id"`
		TableCount   int    `json:"table_count"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.RestaurantID == "" || input.TableCount <= 0 {
		http.Error(w, "restaurant_id and a valid table_count (>0) are required", http.StatusBadRequest)
		return
	}

	var generatedQRs []*domain.QRCode

	for i := 1; i <= input.TableCount; i++ {
		qrCode, err := h.Usecase.Generate(r.Context(), input.RestaurantID, i)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		generatedQRs = append(generatedQRs, qrCode)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(generatedQRs)
}

func (h *QRCodeHandler) GetByRestaurant(w http.ResponseWriter, r *http.Request) {
	// Try to get from query first, then from path if using a custom router or manual parsing
	restaurantID := r.URL.Query().Get("restaurant_id")

	if restaurantID == "" {
		http.Error(w, "Missing restaurant_id parameter", http.StatusBadRequest)
		return
	}

	qrCodes, err := h.Usecase.GetByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(qrCodes)
}

func (h *QRCodeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *QRCodeHandler) GetImage(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	qrCode, err := h.Usecase.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "QRCode not found", http.StatusNotFound)
		return
	}

	imageBytes, err := h.Usecase.GenerateImage(r.Context(), qrCode.Code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Write(imageBytes)
}


