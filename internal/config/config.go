package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	DBUser      string
	DBPass      string
	DBHost      string
	DBPort      string
	DBName      string
	TwilioSID   string
	TwilioAuth  string
	TwilioPhone string
}

func LoadConfig() *Config {
	appEnv := getEnv("APP_ENV", "dev")
	envFile := fmt.Sprintf(".env.%s", appEnv)

	// Attempt to load the specific env file
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("Warning: Error loading %s file: %v. Using system environment variables.", envFile, err)
	}

	return &Config{
		AppEnv:      appEnv,
		DBUser:      getEnv("DB_USER", "root"),
		DBPass:      getEnv("DB_PASS", "Kool1010"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "3306"),
		DBName:      getEnv("DB_NAME", "table_db"),
		TwilioSID:   getEnv("TWILIO_ACCOUNT_SID", ""),
		TwilioAuth:  getEnv("TWILIO_AUTH_TOKEN", ""),
		TwilioPhone: getEnv("TWILIO_PHONE_NUMBER", ""),
	}
}

func (c *Config) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName)
}

func (c *Config) GetRootDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/?parseTime=true",
		c.DBUser, c.DBPass, c.DBHost, c.DBPort)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
