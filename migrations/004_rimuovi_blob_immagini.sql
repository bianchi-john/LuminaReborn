-- 004 - Image bytes now live only in the media database (see 003 in
-- src/db/codeMigrations.ts, which moved them and also generated the reduced versions).
ALTER TABLE immagini DROP COLUMN dati;
