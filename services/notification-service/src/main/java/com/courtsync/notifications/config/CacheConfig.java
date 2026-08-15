package com.courtsync.notifications.config;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

/**
 * Enables caching and gives the unread-badge count a short TTL. Backed by Redis
 * (autoconfigured from spring.data.redis.*).
 *
 * Why cache this at all: the bell badge is read on every authenticated page load
 * by every signed-in user, and the answer changes only when a Kafka event lands
 * or the user opens the feed. Both of those paths evict the key, so the TTL is
 * only a backstop against a cache that drifted — not the primary correctness
 * mechanism. 60s matches the search cache next door.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String UNREAD_COUNT_CACHE = "unread-alert-count";

    @Bean
    RedisCacheManagerBuilderCustomizer unreadCountCacheTtl() {
        return builder -> builder.withCacheConfiguration(UNREAD_COUNT_CACHE,
                RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(60)));
    }
}
