package com.courtsync.search.dropin.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import com.courtsync.search.dropin.document.DropInDocument;

/**
 * Spring Data Elasticsearch repository for the drop-in index. Inherits save/find
 * by id; geo + filter query methods get added in later phases (Phase 3+).
 */
public interface DropInSearchRepository extends ElasticsearchRepository<DropInDocument, String> {
}
