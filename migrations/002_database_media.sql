-- =============================================================================
-- 002 - Database separato per i file delle immagini
--
-- `{{MAIN_DB}}.immagini` resta il catalogo delle immagini (scheda, ordine,
-- didascalia, dimensioni). I byte stanno in `{{MEDIA_DB}}.immagini_file`, una
-- riga per variante:
--   originale  il file caricato, visibile solo a schedatori e amministratori
--   anteprima  versione ridotta (WebP) mostrata al pubblico
--   miniatura  per elenchi e risultati di ricerca
-- Eliminando l'immagine (o la scheda) i file vengono eliminati in cascata.
-- Il database media e i permessi sono creati da dbinit/01-database-media.sh
-- (o da scripts/grant-media.sh su installazioni esistenti).
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
