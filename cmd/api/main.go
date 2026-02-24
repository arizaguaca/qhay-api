package main

import (
	"log"
	"net/http"
	"time"

	"github.com/arizaguaca/table/internal/config"
	thttp "github.com/arizaguaca/table/internal/http"
	"github.com/arizaguaca/table/internal/infrastructure/mysql"
	"github.com/arizaguaca/table/internal/repository"
	"github.com/arizaguaca/table/internal/usecase"
)

func main() {
	// 0. Load Config
	cfg := config.LoadConfig()

	// 1. Setup Database with Infrastructure Client
	db := mysql.NewClient(cfg)

	// 2. Setup Repositories
	tableRepo := repository.NewGormTableRepository(db)
	userRepo := repository.NewGormUserRepository(db)
	restaurantRepo := repository.NewGormRestaurantRepository(db)
	menuRepo := repository.NewGormMenuRepository(db)

	// 2. Setup Usecases
	timeoutContext := time.Duration(10) * time.Second
	tableUsecase := usecase.NewTableUsecase(tableRepo, timeoutContext)
	userUsecase := usecase.NewUserUsecase(userRepo, timeoutContext)
	restaurantUsecase := usecase.NewRestaurantUsecase(restaurantRepo, timeoutContext)
	menuUsecase := usecase.NewMenuUsecase(menuRepo, timeoutContext)

	// 3. Setup Handlers
	tableHandler := thttp.NewTableHandler(tableUsecase)
	userHandler := thttp.NewUserHandler(userUsecase)
	restaurantHandler := thttp.NewRestaurantHandler(restaurantUsecase)
	menuHandler := thttp.NewMenuHandler(menuUsecase)

	// 4. Setup Routes
	mux := http.NewServeMux()

	// Basic CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			if r.Method == "OPTIONS" {
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Routes
	mux.HandleFunc("/tables", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			tableHandler.Create(w, r)
		case http.MethodGet:
			tableHandler.Fetch(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			userHandler.Create(w, r)
		case http.MethodGet:
			if r.URL.Query().Get("id") != "" {
				userHandler.GetByID(w, r)
			} else {
				userHandler.Fetch(w, r)
			}
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/restaurants", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			restaurantHandler.Create(w, r)
		case http.MethodGet:
			if r.URL.Query().Get("owner_id") != "" {
				restaurantHandler.GetByOwner(w, r)
			} else {
				restaurantHandler.Fetch(w, r)
			}
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/menu", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			menuHandler.Create(w, r)
		case http.MethodGet:
			menuHandler.FetchByRestaurant(w, r)
		case http.MethodPut:
			menuHandler.Update(w, r)
		case http.MethodDelete:
			menuHandler.Delete(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 5. Start Server
	serverAddr := ":8080"
	log.Printf("Server starting on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, corsMiddleware(mux)); err != nil {
		log.Fatalf("Server failed: %s", err)
	}

}
