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
}
