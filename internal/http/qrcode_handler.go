package http

import (
	"encoding/json"
	"net/http"
	"strings"

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
		TableNumber  int    `json:"table_number"`
		Label        string `json:"label"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.RestaurantID == "" || input.TableNumber <= 0 {
		http.Error(w, "restaurant_id and a valid table_number are required", http.StatusBadRequest)
		return
	}

	qrCode, err := h.Usecase.Generate(r.Context(), input.RestaurantID, input.TableNumber)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update label if provided
	if input.Label != "" {
		qrCode.Label = input.Label
		// Note: We might need an Update method in usecase to persist this if it was an "existing" QR
		// But for now Generate handles creation with a default label.
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(qrCode)
}

func (h *QRCodeHandler) GetByRestaurant(w http.ResponseWriter, r *http.Request) {
	// Try to get from query first, then from path if using a custom router or manual parsing
	restaurantID := r.URL.Query().Get("restaurant_id")

	// If using standard mux and paths like /restaurants/{id}/qrs,
	// we need a slightly more complex parsing if we don't use a router like chi or gorilla/mux
	if restaurantID == "" {
		// Basic manual parsing for /restaurants/{id}/qrs
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 4 && parts[1] == "restaurants" && parts[3] == "qrs" {
			restaurantID = parts[2]
		}
	}

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
