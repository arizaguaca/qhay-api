package http

import (
	"encoding/json"
	"net/http"

	"github.com/arizaguaca/table/internal/domain"
)

type RestaurantHandler struct {
	Usecase domain.RestaurantUsecase
}

func NewRestaurantHandler(u domain.RestaurantUsecase) *RestaurantHandler {
	return &RestaurantHandler{
		Usecase: u,
	}
}

func (h *RestaurantHandler) Create(w http.ResponseWriter, r *http.Request) {
	var restaurant domain.Restaurant
	if err := json.NewDecoder(r.Body).Decode(&restaurant); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Create(r.Context(), &restaurant); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(restaurant)
}

func (h *RestaurantHandler) Fetch(w http.ResponseWriter, r *http.Request) {
	restaurants, err := h.Usecase.Fetch(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(restaurants)
}

func (h *RestaurantHandler) GetByOwner(w http.ResponseWriter, r *http.Request) {
	ownerID := r.URL.Query().Get("owner_id")
	if ownerID == "" {
		http.Error(w, "Missing owner_id parameter", http.StatusBadRequest)
		return
	}

	restaurants, err := h.Usecase.GetByOwnerID(r.Context(), ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(restaurants)
}
