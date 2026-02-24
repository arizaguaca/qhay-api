package http

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/arizaguaca/qhay-api/internal/domain"
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

func (h *MenuHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	// Path example: /menu/52d6976b-41c3-4dec-8b04-dba3fd1cf566/image
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	itemID := parts[2]

	// 1. Limit upload size to 5MB
	r.Body = http.MaxBytesReader(w, r.Body, 5<<20)
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		http.Error(w, "File too large or invalid form", http.StatusBadRequest)
		return
	}

	// 2. Get file from form
	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 3. Create directory if not exists
	uploadDir := filepath.Join("uploads", "menu")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Error creating upload directory", http.StatusInternalServerError)
		return
	}

	// 4. Create unique filename
	fileName := fmt.Sprintf("%s%s", itemID, filepath.Ext(header.Filename))
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

	// 6. Update MenuItem image_url in DB
	item, err := h.Usecase.GetByID(r.Context(), itemID)
	if err != nil {
		http.Error(w, "Menu item not found", http.StatusNotFound)
		return
	}

	imageURL := fmt.Sprintf("/uploads/menu/%s", fileName)
	item.ImageURL = imageURL

	if err := h.Usecase.Update(r.Context(), item); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"image_url": imageURL,
	})
}
