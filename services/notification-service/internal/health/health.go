package health

import (
	"encoding/json"
	"net/http"
)

// Response is the standard health payload shared across all CourtSync services.
type Response struct {
	Service string `json:"service"`
	Status  string `json:"status"`
}

// Handler returns an http.HandlerFunc that reports the service as UP.
func Handler(serviceName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(Response{Service: serviceName, Status: "UP"})
	}
}
