package restaurant

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/arizaguaca/qhay-api/internal/domain"
)

type RestaurantHandler struct {
	Usecase              domain.RestaurantUsecase
	QRCodeUsecase        domain.QRCodeUsecase
	MenuUsecase          domain.MenuUsecase
	OperatingHourUsecase domain.OperatingHourUsecase
	ReservationUsecase   domain.ReservationUsecase
	UserUsecase          domain.UserUsecase
}

func NewRestaurantHandler(
	u domain.RestaurantUsecase,
	q domain.QRCodeUsecase,
	m domain.MenuUsecase,
	oh domain.OperatingHourUsecase,
	rv domain.ReservationUsecase,
	userUsecase domain.UserUsecase,
) *RestaurantHandler {
	return &RestaurantHandler{
		Usecase:              u,
		QRCodeUsecase:        q,
		MenuUsecase:          m,
		OperatingHourUsecase: oh,
		ReservationUsecase:   rv,
		UserUsecase:          userUsecase,
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

func (h *RestaurantHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	restaurant, err := h.Usecase.GetByID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(restaurant)
}

func (h *RestaurantHandler) GetByOwner(w http.ResponseWriter, r *http.Request) {
	ownerID := r.PathValue("ownerID")
	if ownerID == "" {
		http.Error(w, "Missing ownerID", http.StatusBadRequest)
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

func (h *RestaurantHandler) GetQRs(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/qrs
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	qrCodes, err := h.QRCodeUsecase.GetByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(qrCodes)
}

func (h *RestaurantHandler) GetMenu(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/menu
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	menuItems, err := h.MenuUsecase.FetchByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(menuItems)
}

func (h *RestaurantHandler) GetHours(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/hours
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	hours, err := h.OperatingHourUsecase.GetByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hours)
}

func (h *RestaurantHandler) SaveHours(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/hours
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	var hours []*domain.OperatingHour
	if err := json.NewDecoder(r.Body).Decode(&hours); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.OperatingHourUsecase.SaveHours(r.Context(), restaurantID, hours); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Operating hours saved successfully"})
}

func (h *RestaurantHandler) GetReservations(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/reservations
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	reservations, err := h.ReservationUsecase.FetchByRestaurantID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reservations)
}

func (h *RestaurantHandler) Update(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	var restaurant domain.Restaurant
	if err := json.NewDecoder(r.Body).Decode(&restaurant); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	restaurant.ID = restaurantID
	if err := h.Usecase.Update(r.Context(), &restaurant); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(restaurant)
}

func (h *RestaurantHandler) UploadLogo(w http.ResponseWriter, r *http.Request) {
	// Pattern: /restaurants/{id}/logo
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	// 1. Limit upload size to 5MB
	r.Body = http.MaxBytesReader(w, r.Body, 5<<20)
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		http.Error(w, "File too large or invalid form", http.StatusBadRequest)
		return
	}

	// 2. Get file from form
	file, header, err := r.FormFile("logo")
	if err != nil {
		http.Error(w, "Logo file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 3. Create directory if not exists
	uploadDir := filepath.Join("uploads", "logos")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Error creating upload directory", http.StatusInternalServerError)
		return
	}

	// 4. Create unique filename
	fileName := fmt.Sprintf("%s%s", restaurantID, filepath.Ext(header.Filename))
	filePath := filepath.Join(uploadDir, fileName)

	// 5. Save file to disk
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error writing file", http.StatusInternalServerError)
		return
	}

	// 6. Update Restaurant logo_url in DB
	restaurant, err := h.Usecase.GetByID(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, "Restaurant not found", http.StatusNotFound)
		return
	}

	logoURL := fmt.Sprintf("/uploads/logos/%s", fileName)
	restaurant.LogoURL = logoURL

	if err := h.Usecase.Update(r.Context(), restaurant); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"logo_url": logoURL,
	})
}

func (h *RestaurantHandler) AddStaff(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	var user domain.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	user.RestaurantID = restaurantID
	if err := h.UserUsecase.Create(r.Context(), &user); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *RestaurantHandler) GetStaff(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.PathValue("id")
	if restaurantID == "" {
		http.Error(w, "Missing restaurant id", http.StatusBadRequest)
		return
	}

	staffList, err := h.UserUsecase.GetStaffByRestaurant(r.Context(), restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staffList)
}

func (h *RestaurantHandler) UpdateStaff(w http.ResponseWriter, r *http.Request) {
	staffID := r.PathValue("staffId")
	if staffID == "" {
		http.Error(w, "Missing staff id", http.StatusBadRequest)
		return
	}

	var user domain.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Malformed JSON", http.StatusBadRequest)
		return
	}

	user.ID = staffID
	// We don't overwrite RestaurantID here, usecase preserves it.
	if err := h.UserUsecase.Update(r.Context(), &user); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *RestaurantHandler) DeleteStaff(w http.ResponseWriter, r *http.Request) {
	staffID := r.PathValue("staffId")
	if staffID == "" {
		http.Error(w, "Missing staff id", http.StatusBadRequest)
		return
	}

	if err := h.UserUsecase.Delete(r.Context(), staffID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

