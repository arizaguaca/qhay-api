package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBUser string
	DBPass string
	DBHost string
	DBPort string
	DBName string
}

func LoadConfig() *Config {
	return &Config{
		DBUser: getEnv("DB_USER", "root"),
		DBPass: getEnv("DB_PASS", "Kool1010"),
		DBHost: getEnv("DB_HOST", "localhost"),
		DBPort: getEnv("DB_PORT", "3306"),
		DBName: getEnv("DB_NAME", "table_db"),
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
