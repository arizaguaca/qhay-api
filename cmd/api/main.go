package main

import (
	"log"
	"net/http"
	"time"

	"github.com/arizaguaca/qhay-api/internal/config"
	"github.com/arizaguaca/qhay-api/internal/domain"
	apiHttp "github.com/arizaguaca/qhay-api/internal/http"
	menuH "github.com/arizaguaca/qhay-api/internal/http/menu"
	orderH "github.com/arizaguaca/qhay-api/internal/http/order"
	qrH "github.com/arizaguaca/qhay-api/internal/http/qrcode"
	resvH "github.com/arizaguaca/qhay-api/internal/http/reservation"
	restH "github.com/arizaguaca/qhay-api/internal/http/restaurant"
	userH "github.com/arizaguaca/qhay-api/internal/http/user"
	verifyH "github.com/arizaguaca/qhay-api/internal/http/verification"
	"github.com/arizaguaca/qhay-api/internal/infrastructure"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"github.com/arizaguaca/qhay-api/internal/repository"
	menuUC "github.com/arizaguaca/qhay-api/internal/usecase/menu"
	hourUC "github.com/arizaguaca/qhay-api/internal/usecase/operating_hour"
	orderUC "github.com/arizaguaca/qhay-api/internal/usecase/order"
	qrUC "github.com/arizaguaca/qhay-api/internal/usecase/qrcode"
	resvUC "github.com/arizaguaca/qhay-api/internal/usecase/reservation"
	restUC "github.com/arizaguaca/qhay-api/internal/usecase/restaurant"
	userUC "github.com/arizaguaca/qhay-api/internal/usecase/user"
	verifyUC "github.com/arizaguaca/qhay-api/internal/usecase/verification"
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
	userUsecase := userUC.NewUserUsecase(userRepo, timeoutContext)
	restaurantUsecase := restUC.NewRestaurantUsecase(restaurantRepo, timeoutContext)
	menuUsecase := menuUC.NewMenuUsecase(menuRepo, timeoutContext)

	// TODO: Get baseUrl from config
	baseUrl := "https://qhay.app"
	qrCodeUsecase := qrUC.NewQRCodeUsecase(qrCodeRepo, timeoutContext, baseUrl)
	operatingHourUsecase := hourUC.NewOperatingHourUsecase(operatingHourRepo, timeoutContext)

	// Choose SMS Service (Twilio if credentials exist, otherwise Console)
	var smsService domain.SMSService
	if cfg.TwilioSID != "" && cfg.TwilioAuth != "" {
		smsService = infrastructure.NewTwilioSMSService(cfg.TwilioSID, cfg.TwilioAuth, cfg.TwilioPhone)
	} else {
		smsService = infrastructure.NewConsoleSMSService()
	}
	verificationUsecase := verifyUC.NewVerificationUsecase(verificationRepo, customerRepo, smsService, timeoutContext)
	reservationUsecase := resvUC.NewReservationUsecase(reservationRepo, timeoutContext)
	orderUsecase := orderUC.NewOrderUsecase(orderRepo, timeoutContext)
	// staffUsecase := staffUC.NewStaffUsecase(staffRepo, timeoutContext)

	// 3. Setup Handlers
	userHandler := userH.NewUserHandler(userUsecase)
	restaurantHandler := restH.NewRestaurantHandler(restaurantUsecase, qrCodeUsecase, menuUsecase, operatingHourUsecase, reservationUsecase, nil)

	menuHandler := menuH.NewMenuHandler(menuUsecase)
	qrCodeHandler := qrH.NewQRCodeHandler(qrCodeUsecase)
	verificationHandler := verifyH.NewVerificationHandler(verificationUsecase, customerRepo)
	reservationHandler := resvH.NewReservationHandler(reservationUsecase)
	orderHandler := orderH.NewOrderHandler(orderUsecase)

	// 4. Setup Router
	router := apiHttp.NewRouter(apiHttp.Handlers{
		UserHandler:         userHandler,
		RestaurantHandler:   restaurantHandler,
		MenuHandler:         menuHandler,
		QRCodeHandler:       qrCodeHandler,
		VerificationHandler: verificationHandler,
		ReservationHandler:  reservationHandler,
		OrderHandler:        orderHandler,
	})

	// 5. Start Server
	serverAddr := ":8080"
	log.Printf("Server starting on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, router); err != nil {
		log.Fatalf("Server failed: %s", err)
	}
}
