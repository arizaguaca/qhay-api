package reservation

import (
	"encoding/json"
	"net/http"


	"github.com/arizaguaca/qhay-api/internal/domain"
)

type ReservationHandler struct {
	Usecase domain.ReservationUsecase
}

func NewReservationHandler(u domain.ReservationUsecase) *ReservationHandler {
	return &ReservationHandler{
		Usecase: u,
	}
}

func (h *ReservationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var reservation domain.Reservation
	if err := json.NewDecoder(r.Body).Decode(&reservation); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.Create(r.Context(), &reservation); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(reservation)
}

func (h *ReservationHandler) GetByRestaurant(w http.ResponseWriter, r *http.Request) {
	// Path: /restaurants/{id}/reservations
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	reservations, err := h.Usecase.FetchByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) GetByUser(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	reservations, err := h.Usecase.FetchByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *ReservationHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	// Pattern: /reservations/{id}/status
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing reservation id", http.StatusBadRequest)
		return
	}

	var input struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Usecase.UpdateStatus(r.Context(), id, input.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Reservation status updated"})
}


