package handlers

import (
	"encoding/json"
	"log"
)

// RSVPEvent mirrors the RSVP_CREATED / RSVP_CANCELLED / DROP_IN_CANCELLED
// contracts published by dropin-service. See shared/event-contracts/events.md.
type RSVPEvent struct {
	EventType       string  `json:"eventType"`
	DropInID        string  `json:"dropInId"`
	UserID          string  `json:"userId"`
	PaymentRequired bool    `json:"paymentRequired"`
	Amount          float64 `json:"amount"`
	Timestamp       string  `json:"timestamp"`
	OrganizerUserID string  `json:"organizerUserId"`
}

// HandleDropinEvent decodes a raw dropin-events message and logs it.
// For the first milestone, notification-service only logs consumed events;
// real email sending via Resend comes later.
func HandleDropinEvent(value []byte) {
	var evt RSVPEvent
	if err := json.Unmarshal(value, &evt); err != nil {
		log.Printf("[notification-service] failed to decode dropin event: %v (raw=%s)", err, string(value))
		return
	}

	switch evt.EventType {
	case "RSVP_CREATED":
		log.Printf("[notification-service] RSVP_CREATED consumed for dropInId=%s userId=%s", evt.DropInID, evt.UserID)
	case "RSVP_CANCELLED":
		log.Printf("[notification-service] RSVP_CANCELLED consumed for dropInId=%s userId=%s", evt.DropInID, evt.UserID)
	case "DROP_IN_CANCELLED":
		log.Printf("[notification-service] DROP_IN_CANCELLED consumed for dropInId=%s organizerUserId=%s", evt.DropInID, evt.OrganizerUserID)
	default:
		log.Printf("[notification-service] ignoring event type=%s", evt.EventType)
	}
}
