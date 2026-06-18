package com.courtsync.search.dropin.document;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import lombok.Getter;
import lombok.Setter;

/**
 * One drop-in as a searchable Elasticsearch document — the read model. This is a
 * DERIVED copy built from {@code dropin-events}; Postgres in dropin-service stays
 * the system of record. Spring Data ES creates the {@code drop-ins} index from
 * these annotations on first use.
 *
 * Only carries what the {@code DROP_IN_CREATED} event provides today. Title /
 * price / skill aren't on that event yet — add them to the event (and here) when
 * the search UI needs to render them (Phase 5). The load-bearing field for Phase
 * 2 is {@link #location}, a {@code geo_point} so we can query "nearby".
 *
 * @Getter/@Setter only (same rule as JPA entities): no @Data on a persisted type.
 */
@Document(indexName = "drop-ins")
@Getter
@Setter
public class DropInDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String courtId;

    @Field(type = FieldType.Keyword)
    private String organizerUserId;

    @Field(type = FieldType.Date)
    private Instant startTime;

    @Field(type = FieldType.Text)
    private String city;

    /** Null when the court had no coordinates — such a drop-in won't match geo queries. */
    @GeoPointField
    private GeoPoint location;
}
