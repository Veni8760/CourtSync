package com.courtsync.search.config;

import java.time.Duration;

import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

/**
 * Enables caching and gives the geo-search cache a short TTL. Backed by Redis
 * (autoconfigured from spring.data.redis.*). Values are JDK-serialized result
 * lists (DropInSearchResult is Serializable) — fine for an internal cache.
 *
 * Why 60s: drop-ins change slowly relative to search traffic, so a brief cache
 * gives the "sub-second repeat query" win without serving badly stale results.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String NEARBY_CACHE = "nearby-dropins";

    @Bean
    RedisCacheManagerBuilderCustomizer nearbyCacheTtl() {
        return builder -> builder.withCacheConfiguration(NEARBY_CACHE,
                RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofSeconds(60)));
    }
}
