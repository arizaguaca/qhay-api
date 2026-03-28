package main

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/arizaguaca/qhay-api/internal/config"
	"github.com/arizaguaca/qhay-api/internal/domain"
	thttp "github.com/arizaguaca/qhay-api/internal/http"
	"github.com/arizaguaca/qhay-api/internal/infrastructure"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"github.com/arizaguaca/qhay-api/internal/repository"
	"github.com/arizaguaca/qhay-api/internal/usecase"
)

func main() {
	// 0. Load Config
	cfg := config.LoadConfig()
	log.Printf("Iniciando API en entorno: [%s]", cfg.AppEnv)

	// 1. Setup Database with Infrastructure Client
	db := mysql.NewClient(cfg)

	// 2. Setup Repositories
	userRepo := repository.NewUserRepository(db)
	restaurantRepo := repository.NewRestaurantRepository(db)
	menuRepo := repository.NewMenuRepository(db)
	qrCodeRepo := repository.NewQRCodeRepository(db)
	operatingHourRepo := repository.NewOperatingHourRepository(db)
	verificationRepo := repository.NewVerificationRepository(db)
	reservationRepo := repository.NewReservationRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	customerRepo := repository.NewCustomerRepository(db)

	// 2. Setup Usecases
	timeoutContext := time.Duration(10) * time.Second
	userUsecase := usecase.NewUserUsecase(userRepo, timeoutContext)
	restaurantUsecase := usecase.NewRestaurantUsecase(restaurantRepo, timeoutContext)
	menuUsecase := usecase.NewMenuUsecase(menuRepo, timeoutContext)

	// TODO: Get baseUrl from config
	baseUrl := "https://qhay.app"
	qrCodeUsecase := usecase.NewQRCodeUsecase(qrCodeRepo, timeoutContext, baseUrl)
	operatingHourUsecase := usecase.NewOperatingHourUsecase(operatingHourRepo, timeoutContext)

	// Choose SMS Service (Twilio if credentials exist, otherwise Console)
	var smsService domain.SMSService
	if cfg.TwilioSID != "" && cfg.TwilioAuth != "" {
		smsService = infrastructure.NewTwilioSMSService(cfg.TwilioSID, cfg.TwilioAuth, cfg.TwilioPhone)
	} else {
		smsService = infrastructure.NewConsoleSMSService()
	}
	verificationUsecase := usecase.NewVerificationUsecase(verificationRepo, customerRepo, smsService, timeoutContext)
	reservationUsecase := usecase.NewReservationUsecase(reservationRepo, timeoutContext)
	orderUsecase := usecase.NewOrderUsecase(orderRepo, timeoutContext)

	// 3. Setup Handlers
	userHandler := thttp.NewUserHandler(userUsecase)
	restaurantHandler := thttp.NewRestaurantHandler(restaurantUsecase, qrCodeUsecase, menuUsecase, operatingHourUsecase)
	menuHandler := thttp.NewMenuHandler(menuUsecase)
	qrCodeHandler := thttp.NewQRCodeHandler(qrCodeUsecase)
	verificationHandler := thttp.NewVerificationHandler(verificationUsecase, customerRepo)
	reservationHandler := thttp.NewReservationHandler(reservationUsecase)

	orderHandler := thttp.NewOrderHandler(orderUsecase)


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

	// Serve static files from the "uploads" directory
	fs := http.FileServer(http.Dir("./uploads"))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fs))

	// Routes

	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		userHandler.Login(w, r)
	})

	mux.HandleFunc("/auth/send-code", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		verificationHandler.SendCode(w, r)
	})

	mux.HandleFunc("/auth/verify", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		verificationHandler.Verify(w, r)
	})

	mux.HandleFunc("/reservations", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			reservationHandler.Create(w, r)
		case http.MethodGet:
			reservationHandler.GetByUser(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/reservations/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 4 && parts[3] == "status" {
			if r.Method == http.MethodPut {
				reservationHandler.UpdateStatus(w, r)
				return
			}
		}
		http.Error(w, "Invalid path", http.StatusNotFound)
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
		case http.MethodPut:
			userHandler.Update(w, r)
		case http.MethodDelete:
			userHandler.Delete(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			orderHandler.Create(w, r)
		case http.MethodGet:
			orderHandler.Fetch(w, r)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/orders/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 4 && parts[3] == "status" {
			if r.Method == http.MethodPut {
				orderHandler.UpdateStatus(w, r)
				return
			}
		}
		http.Error(w, "Invalid path", http.StatusNotFound)
	})



	mux.HandleFunc("/menu/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 4 && parts[3] == "image" {
			if r.Method == http.MethodPost {
				menuHandler.UploadImage(w, r)
				return
			}
		}

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

	mux.HandleFunc("/qrcodes/image", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		qrCodeHandler.GetImage(w, r)
	})

	mux.HandleFunc("/qrcodes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			qrCodeHandler.Generate(w, r)
		case http.MethodGet:
			if r.URL.Path == "/qrcodes/image" {
				qrCodeHandler.GetImage(w, r)
				return
			}
			qrCodeHandler.GetByRestaurant(w, r)
		case http.MethodDelete:
			qrCodeHandler.Delete(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Support for restful paths:
	// /restaurants/{id}/qrs
	// /restaurants/{id}/menu
	// /restaurants/{id}/hours
	mux.HandleFunc("/restaurants/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")

		// If it's a sub-resource request: /restaurants/{id}/{sub}
		if len(parts) >= 4 {
			restaurantID := parts[2]
			subResource := parts[3]
			_ = restaurantID // used inside handlers

			switch subResource {
			case "qrs":
				if r.Method == http.MethodGet {
					restaurantHandler.GetQRs(w, r)
					return
				}
			case "menu":
				if r.Method == http.MethodGet {
					restaurantHandler.GetMenu(w, r)
					return
				}
			case "hours":
				if r.Method == http.MethodGet {
					restaurantHandler.GetHours(w, r)
					return
				}
				if r.Method == http.MethodPut {
					restaurantHandler.SaveHours(w, r)
					return
				}
			case "logo":
				if r.Method == http.MethodPost {
					restaurantHandler.UploadLogo(w, r)
					return
				}
			case "reservations":
				if r.Method == http.MethodGet {
					reservationHandler.GetByRestaurant(w, r)
					return
				}
			}
		}

		// Fallback to basic restaurant operations
		switch r.Method {
		case http.MethodPost:
			restaurantHandler.Create(w, r)
		case http.MethodPut:
			restaurantHandler.Update(w, r)
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

	// 5. Start Server
	serverAddr := ":8080"
	log.Printf("Server starting on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, corsMiddleware(mux)); err != nil {
		log.Fatalf("Server failed: %s", err)
	}

}
