package kafka

import (
	"context"
	"log"

	"github.com/courtsync/notification-service/internal/config"
	"github.com/segmentio/kafka-go"
)

// Consumer reads messages from a Kafka topic and dispatches each one to handle.
type Consumer struct {
	reader *kafka.Reader
}

// NewConsumer builds a Consumer subscribed to the configured dropin topic.
func NewConsumer(cfg config.Config) *Consumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{cfg.KafkaBrokers},
		Topic:   cfg.DropinTopic,
		GroupID: cfg.ConsumerGroupID,
	})
	return &Consumer{reader: reader}
}

// Run blocks reading messages until ctx is cancelled, passing each value to handle.
func (c *Consumer) Run(ctx context.Context, handle func(value []byte)) {
	log.Printf("[notification-service] kafka consumer started, waiting for messages on %q", c.reader.Config().Topic)
	for {
		msg, err := c.reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return // shutting down
			}
			log.Printf("[notification-service] kafka read error: %v", err)
			continue
		}
		handle(msg.Value)
	}
}

// Close releases the underlying reader.
func (c *Consumer) Close() error {
	return c.reader.Close()
}
