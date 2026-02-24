package infrastructure

import (
	"context"
	"log"

	"net/http"
	"net/url"
	"strings"

	"github.com/arizaguaca/qhay-api/internal/domain"
)

type consoleSMSService struct{}

func NewConsoleSMSService() domain.SMSService {
	return &consoleSMSService{}
}

func (s *consoleSMSService) SendSMS(ctx context.Context, phone string, message string) error {
	log.Printf("[SMS CONSOLE] Enviando a %s: %s", phone, message)
	return nil
}

type twilioSMSService struct {
	accountSid string
	authToken  string
	fromPhone  string
}

func NewTwilioSMSService(sid, token, from string) domain.SMSService {
	return &twilioSMSService{
		accountSid: sid,
		authToken:  token,
		fromPhone:  from,
	}
}

func (s *twilioSMSService) SendSMS(ctx context.Context, phone string, message string) error {
	apiURL := "https://api.twilio.com/2010-04-01/Accounts/" + s.accountSid + "/Messages.json"

	data := url.Values{}
	data.Set("To", phone)
	data.Set("From", s.fromPhone)
	data.Set("Body", message)

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.SetBasicAuth(s.accountSid, s.authToken)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return log.Output(2, "Twilio error: "+resp.Status) // Simple error reporting
	}

	log.Printf("[SMS TWILIO] Mensaje enviado exitosamente a %s", phone)
	return nil
}
