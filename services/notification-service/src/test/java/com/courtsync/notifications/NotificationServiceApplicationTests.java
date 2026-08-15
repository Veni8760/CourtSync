package com.courtsync.notifications;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Boots the whole context: Flyway applies the notifications schema and Hibernate's
 * ddl-auto=validate then checks the Alert entity against the real tables. That
 * mapping check is the point — a column this entity claims but the migration
 * doesn't create fails here rather than at runtime.
 *
 * The Kafka listener is left stopped. Unlike a producer (KafkaTemplate connects
 * lazily), a @KafkaListener container dials the broker as the context starts, and
 * KAFKA_BOOTSTRAP_SERVERS points at the compose hostname, which doesn't resolve
 * from a developer's shell. Consumer behaviour is covered by DropInEventConsumerTest.
 */
@SpringBootTest(properties = "spring.kafka.listener.auto-startup=false")
class NotificationServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
