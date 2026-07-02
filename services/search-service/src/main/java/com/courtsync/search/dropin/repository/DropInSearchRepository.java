package com.courtsync.search.dropin.repository;

import java.util.List;

import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.geo.Distance;

import com.courtsync.search.dropin.document.DropInDocument;

/**
 * Spring Data Elasticsearch repository for the drop-in index. Inherits save/find
 * by id.
 */
public interface DropInSearchRepository extends ElasticsearchRepository<DropInDocument, String> {

    /**
     * Drop-ins whose {@code location} is within {@code distance} of {@code point}.
     * Spring Data ES turns {@code Near} on a geo_point into an Elasticsearch
     * geo_distance filter. Ordering by distance is done in the service (small
     * result sets) rather than a native geo-sort.
     */
    List<DropInDocument> findByLocationNear(GeoPoint point, Distance distance);

    /**
     * Same geo_distance filter, additionally requiring the {@code title} to match
     * {@code keyword}. Because {@code title} is mapped as analyzed {@code text},
     * Spring Data ES turns the String criterion into a full-text {@code match}
     * query (tokenized, case-insensitive) and ANDs it with the geo filter in a
     * bool query — so "beginner" matches "Beginner Friendly Drop-in".
     */
    List<DropInDocument> findByLocationNearAndTitle(GeoPoint point, Distance distance, String keyword);
}
