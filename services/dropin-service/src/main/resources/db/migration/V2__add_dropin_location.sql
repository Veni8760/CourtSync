-- Denormalized court location, stamped onto the drop-in at creation from the
-- court-service gRPC response. A drop-in is tied to ONE court and its coordinates
-- never change after creation, so copying them here lets the search index answer
-- "drop-ins near me" without a cross-service read (MASTER §7: never query another
-- service's tables). Nullable: a court may not have coordinates yet.
ALTER TABLE drop_ins
    ADD COLUMN latitude   DOUBLE PRECISION,
    ADD COLUMN longitude  DOUBLE PRECISION,
    ADD COLUMN city       VARCHAR(255);
