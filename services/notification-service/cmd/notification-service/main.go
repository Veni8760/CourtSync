package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/courtsync/notification-service/internal/config"
	"github.com/courtsync/notification-service/internal/handlers"
	"github.com/courtsync/notification-service/internal/health"
	"github.com/courtsync/notification-service/internal/kafka"
)

func main() {
	cfg := config.Load()
	log.Printf("[notification-service] starting on port %s, kafka=%s", cfg.Port, cfg.KafkaBrokers)

	// Root context cancelled on SIGINT/SIGTERM for graceful shutdown.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// HTTP server: just /health for the skeleton.
	mux := http.NewServeMux()
	mux.HandleFunc("/health", health.Handler(cfg.ServiceName))
	srv := &http.Server{Addr: ":" + cfg.Port, Handler: mux}

	go func() {
		log.Printf("[notification-service] http listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[notification-service] http server error: %v", err)
		}
	}()

	// Kafka consumer runs until shutdown.
	consumer := kafka.NewConsumer(cfg)
	go consumer.Run(ctx, handlers.HandleDropinEvent)

	<-ctx.Done()
	log.Printf("[notification-service] shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("[notification-service] http shutdown error: %v", err)
	}
	if err := consumer.Close(); err != nil {
		log.Printf("[notification-service] kafka close error: %v", err)
	}
	log.Printf("[notification-service] stopped")
	os.Exit(0)
}
