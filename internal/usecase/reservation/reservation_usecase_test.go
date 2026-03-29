package reservation_test

import (
	"context"
	"testing"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/usecase/reservation"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestReservationUsecase_Create(t *testing.T) {
	mockRepo := new(reservation.ReservationRepository)
	timeout := 10 * time.Second
	u := reservation.NewReservationUsecase(mockRepo, timeout)




	reservation := &domain.Reservation{
		RestaurantID:    "res123",
		UserID:          "user123",
		Guests:          4,
		ReservationDate: time.Now().Add(24 * time.Hour),
	}


	mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*domain.Reservation")).Return(nil)

	err := u.Create(context.Background(), reservation)

	assert.NoError(t, err)
	assert.NotEmpty(t, reservation.ID)
	assert.Equal(t, "pending", reservation.Status)
	mockRepo.AssertExpectations(t)
}

func TestReservationUsecase_UpdateStatus(t *testing.T) {
	mockRepo := new(reservation.ReservationRepository)
	timeout := 10 * time.Second
	u := reservation.NewReservationUsecase(mockRepo, timeout)


	reservationID := "resv123"
	status := "confirmed"

	mockRepo.On("UpdateStatus", mock.Anything, reservationID, status).Return(nil)

	err := u.UpdateStatus(context.Background(), reservationID, status)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
