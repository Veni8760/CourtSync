package config

import "os"

// Config holds runtime configuration sourced from environment variables.
type Config struct {
	ServiceName     string
	Port            string
	KafkaBrokers    string
	DropinTopic     string
	ConsumerGroupID string
}

// Load reads configuration from the environment, applying sensible local defaults.
func Load() Config {
	return Config{
		ServiceName:     getenv("SERVICE_NAME", "notification-service"),
		Port:            getenv("PORT", "8086"),
		KafkaBrokers:    getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
		DropinTopic:     getenv("DROPIN_TOPIC", "dropin-events"),
		ConsumerGroupID: getenv("KAFKA_CONSUMER_GROUP", "notification-service"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
