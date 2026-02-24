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

	// 2. Setup Repository
	tableRepo := repository.NewGormTableRepository(db)

	// 2. Setup Usecase
	timeoutContext := time.Duration(10) * time.Second
	tableUsecase := usecase.NewTableUsecase(tableRepo, timeoutContext)

	// 3. Setup Handler
	tableHandler := thttp.NewTableHandler(tableUsecase)

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

	// 5. Start Server
	serverAddr := ":8080"
	log.Printf("Server starting on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, corsMiddleware(mux)); err != nil {
		log.Fatalf("Server failed: %s", err)
	}

}
