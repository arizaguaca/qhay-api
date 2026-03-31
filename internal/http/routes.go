package http

import (
	"net/http"

	menuH "github.com/arizaguaca/qhay-api/internal/http/menu"
	orderH "github.com/arizaguaca/qhay-api/internal/http/order"
	qrH "github.com/arizaguaca/qhay-api/internal/http/qrcode"
	resvH "github.com/arizaguaca/qhay-api/internal/http/reservation"
	restH "github.com/arizaguaca/qhay-api/internal/http/restaurant"
	userH "github.com/arizaguaca/qhay-api/internal/http/user"
	verifyH "github.com/arizaguaca/qhay-api/internal/http/verification"
)

type Handlers struct {
	UserHandler         *userH.UserHandler
	RestaurantHandler   *restH.RestaurantHandler
	MenuHandler         *menuH.MenuHandler
	QRCodeHandler       *qrH.QRCodeHandler
	VerificationHandler *verifyH.VerificationHandler
	ReservationHandler  *resvH.ReservationHandler
	OrderHandler        *orderH.OrderHandler
}

type Router struct {
	mux    *http.ServeMux
	prefix string
}

func (r *Router) Group(prefix string) *Router {
	return &Router{
		mux:    r.mux,
		prefix: r.prefix + prefix,
	}
}

func (r *Router) HandleFunc(pattern string, handler http.HandlerFunc) {
	r.mux.HandleFunc(pattern, handler)
}

func (r *Router) GET(path string, handler http.HandlerFunc) {
	r.mux.HandleFunc("GET "+r.prefix+path, handler)
}

func (r *Router) POST(path string, handler http.HandlerFunc) {
	r.mux.HandleFunc("POST "+r.prefix+path, handler)
}

func (r *Router) PUT(path string, handler http.HandlerFunc) {
	r.mux.HandleFunc("PUT "+r.prefix+path, handler)
}

func (r *Router) DELETE(path string, handler http.HandlerFunc) {
	r.mux.HandleFunc("DELETE "+r.prefix+path, handler)
}

func NewRouter(handlers Handlers) http.Handler {
	mux := http.NewServeMux()
	r := &Router{mux: mux}

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

	// API v1 Group
	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", handlers.UserHandler.Login)
		api.POST("/auth/send-code", handlers.VerificationHandler.SendCode)
		api.POST("/auth/verify", handlers.VerificationHandler.Verify)

		api.POST("/users", handlers.UserHandler.Create)
		api.GET("/users/{id}", handlers.UserHandler.GetByID)
		api.PUT("/users/{id}", handlers.UserHandler.Update)
		api.DELETE("/users/{id}", handlers.UserHandler.Delete)
		api.GET("/users/{ownerID}/restaurants", handlers.RestaurantHandler.GetByOwner)

		api.POST("/reservations", handlers.ReservationHandler.Create)
		api.GET("/reservations", handlers.ReservationHandler.GetByUser)
		api.PUT("/reservations/{id}/status", handlers.ReservationHandler.UpdateStatus)

		api.POST("/orders", handlers.OrderHandler.Create)
		api.GET("/orders", handlers.OrderHandler.Fetch)
		api.PUT("/orders/{id}/status", handlers.OrderHandler.UpdateStatus)

		api.POST("/menu", handlers.MenuHandler.Create)
		api.GET("/menu", handlers.MenuHandler.FetchByRestaurant)
		api.PUT("/menu/{id}", handlers.MenuHandler.Update)
		api.DELETE("/menu/{id}", handlers.MenuHandler.Delete)
		api.POST("/menu/{id}/image", handlers.MenuHandler.UploadImage)

		api.POST("/qrcodes", handlers.QRCodeHandler.Generate)
		api.GET("/qrcodes", handlers.QRCodeHandler.GetByRestaurant)
		api.DELETE("/qrcodes", handlers.QRCodeHandler.Delete)
		api.GET("/qrcodes/image", handlers.QRCodeHandler.GetImage)

		api.POST("/restaurants", handlers.RestaurantHandler.Create)
		api.GET("/restaurants", handlers.RestaurantHandler.Fetch)
		api.GET("/restaurants/{id}", handlers.RestaurantHandler.GetByID)
		api.PUT("/restaurants/{id}", handlers.RestaurantHandler.Update)
		api.GET("/restaurants/{id}/qrs", handlers.RestaurantHandler.GetQRs)
		api.GET("/restaurants/{id}/menu", handlers.RestaurantHandler.GetMenu)
		api.GET("/restaurants/{id}/hours", handlers.RestaurantHandler.GetHours)
		api.PUT("/restaurants/{id}/hours", handlers.RestaurantHandler.SaveHours)
		api.POST("/restaurants/{id}/logo", handlers.RestaurantHandler.UploadLogo)
		api.GET("/restaurants/{id}/reservations", handlers.RestaurantHandler.GetReservations)

		api.POST("/restaurants/{id}/staff", handlers.RestaurantHandler.AddStaff)
		api.GET("/restaurants/{id}/staff", handlers.RestaurantHandler.GetStaff)
		api.PUT("/restaurants/{id}/staff/{staffId}", handlers.RestaurantHandler.UpdateStaff)
		api.DELETE("/restaurants/{id}/staff/{staffId}", handlers.RestaurantHandler.DeleteStaff)
	}

	return corsMiddleware(mux)
}
