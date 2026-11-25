ALTER TABLE platform_setting ADD COLUMN image_size INT NOT NULL DEFAULT 512;
ALTER TABLE trail MODIFY COLUMN image_url TEXT NULL,
    ADD COLUMN archive_retry_at DATETIME(3) NULL,
    ADD INDEX trail_archive_retry_at_idx (archive_retry_at);
