package http

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/arizaguaca/qhay-api/internal/domain"
)

type OrderHandler struct {
	Usecase domain.OrderUsecase
}

func NewOrderHandler(u domain.OrderUsecase) *OrderHandler {
	return &OrderHandler{
		Usecase: u,
	}
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var order domain.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Create(r.Context(), &order); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) Fetch(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	customerID := r.URL.Query().Get("customer_id")

	var orders []*domain.Order
	var err error

	if customerID != "" {
		orders, err = h.Usecase.FetchByCustomerID(r.Context(), customerID)
	} else if restaurantID != "" {
		orders, err = h.Usecase.FetchByRestaurantID(r.Context(), restaurantID)
	} else {
		http.Error(w, "Missing restaurant_id or customer_id parameter", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}


func (h *OrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	// Path example: /orders/uuid/status
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	id := parts[2]

	var input struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.UpdateStatus(r.Context(), id, input.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
