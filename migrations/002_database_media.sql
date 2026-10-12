-- =============================================================================
-- 002 - Separate database for image files
--
-- `{{MAIN_DB}}.immagini` remains the image catalogue (record, order,
-- caption, dimensions). The bytes live in `{{MEDIA_DB}}.immagini_file`, one
-- row per variant:
--   originale  original: the uploaded file, visible only to cataloguers and administrators
--   anteprima  preview: reduced version (WebP) shown to the public
--   miniatura  thumbnail: for lists and search results
-- Deleting the image (or the record) deletes its files in cascade.
-- The media database and its permissions are created by dbinit/01-database-media.sh
-- (or by scripts/grant-media.sh on existing installations).
-- =============================================================================

CREATE TABLE IF NOT EXISTS `{{MEDIA_DB}}`.immagini_file (
  id_immagine INT NOT NULL,
  variante ENUM('originale', 'anteprima', 'miniatura') NOT NULL,
  mime VARCHAR(64) NOT NULL,
  larghezza INT NOT NULL,
  altezza INT NOT NULL,
  dimensione INT NOT NULL,
  dati LONGBLOB NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_immagine, variante),
  CONSTRAINT fk_file_immagine FOREIGN KEY (id_immagine) REFERENCES `{{MAIN_DB}}`.immagini (id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4;

ALTER TABLE immagini
  ADD COLUMN larghezza INT NULL AFTER mime,
  ADD COLUMN altezza INT NULL AFTER larghezza,
  ADD COLUMN dimensione INT NULL AFTER altezza,
  ADD COLUMN sha256 CHAR(64) NULL AFTER dimensione,
  MODIFY dati LONGBLOB NULL;
