-- 004 - I byte delle immagini ora stanno solo nel database media (vedi 003 in
-- src/db/codeMigrations.ts, che li ha spostati generando anche le versioni ridotte).
ALTER TABLE immagini DROP COLUMN dati;
