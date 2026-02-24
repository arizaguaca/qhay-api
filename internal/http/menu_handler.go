package http

import (
	"encoding/json"
	"net/http"

	"github.com/arizaguaca/table/internal/domain"
)

type MenuHandler struct {
	Usecase domain.MenuUsecase
}

func NewMenuHandler(u domain.MenuUsecase) *MenuHandler {
	return &MenuHandler{
		Usecase: u,
	}
}

func (h *MenuHandler) Create(w http.ResponseWriter, r *http.Request) {
	var item domain.MenuItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Create(r.Context(), &item); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (h *MenuHandler) FetchByRestaurant(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant_id parameter", http.StatusBadRequest)
		return
	}

	items, err := h.Usecase.FetchByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *MenuHandler) Update(w http.ResponseWriter, r *http.Request) {
	var item domain.MenuItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Update(r.Context(), &item); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (h *MenuHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
