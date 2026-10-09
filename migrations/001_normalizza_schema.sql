-- =============================================================================
-- 001 - Normalizzazione dello schema
--
-- Porta lo schema originale (dbinit/init.sql) a un modello relazionale in cui:
--   * le "voci" condivise (autori, materiali, tecniche, ubicazioni, provenienze,
--     mostre, bibliografie) esistono una sola volta e sono collegate alle schede
--     tramite tabelle TDS; gli attributi che dipendono dalla singola scheda
--     (es. "copia da", "Opera attribuita", sala/vetrina) stanno sul collegamento;
--   * i dati che appartengono a una sola scheda (cronologie, inventari, misure,
--     immagini, documentazione fotografica) hanno una FK diretta verso la scheda
--     con ON DELETE CASCADE, così eliminare una scheda non lascia orfani;
--   * lo stato della scheda è una colonna di `schede` e ogni passaggio di stato
--     viene registrato in `schede_revisioni`;
--   * le immagini sono salvate come binario (non più data URL in LONGTEXT).
--
-- I duplicati già presenti vengono fusi (confronto senza distinzione di
-- maiuscole/spazi). Eseguita una sola volta dal migratore dell'applicazione.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utenti (copia locale degli utenti dello user-manager)
-- -----------------------------------------------------------------------------
UPDATE users SET username = TRIM(username);
DELETE FROM users WHERE username IS NULL OR username = '';
ALTER TABLE users MODIFY username VARCHAR(191) NOT NULL;

CREATE TABLE _map_users AS
  SELECT id, MIN(id) OVER (PARTITION BY username) AS canon FROM users;
UPDATE tds_users_schede t JOIN _map_users m ON m.id = t.id_user SET t.id_user = m.canon WHERE m.id <> m.canon;
UPDATE tds_stato_schedeUser t JOIN _map_users m ON m.id = t.id_user SET t.id_user = m.canon WHERE m.id <> m.canon;
DELETE u FROM users u JOIN _map_users m ON m.id = u.id WHERE m.id <> m.canon;
DROP TABLE _map_users;

UPDATE users SET isAdmin = CASE WHEN LOWER(TRIM(COALESCE(isAdmin, ''))) IN ('1', 'true') THEN '1' ELSE '0' END;
ALTER TABLE users
  MODIFY display_name VARCHAR(255) NULL,
  MODIFY isAdmin TINYINT(1) NOT NULL DEFAULT 0,
  MODIFY external_id VARCHAR(64) NULL,
  ADD UNIQUE KEY uq_users_username (username);

-- -----------------------------------------------------------------------------
-- Schede: stato, metadati e titolo in testo semplice (per ordinamento e <title>)
-- -----------------------------------------------------------------------------
ALTER TABLE schede
  ADD COLUMN titolo_testo VARCHAR(500) NOT NULL DEFAULT '' AFTER titolo_opera,
  ADD COLUMN stato TINYINT NOT NULL DEFAULT 0,
  ADD COLUMN note_schedatore TEXT NULL,
  ADD COLUMN created_by INT NULL,
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN published_at DATETIME NULL;

UPDATE schede s
  JOIN tds_schede_statoScheda tss ON tss.id_scheda = s.id
  JOIN statoScheda ss ON ss.id = tss.id_stato
  SET s.stato = COALESCE(ss.stato, 0),
      s.note_schedatore = NULLIF(TRIM(ss.commento), '');

UPDATE schede s
  JOIN (SELECT id_scheda, MIN(id_user) AS id_user, MIN(data_modifica) AS creata, MAX(data_modifica) AS modificata
          FROM tds_users_schede GROUP BY id_scheda) t ON t.id_scheda = s.id
  SET s.created_by = t.id_user,
      s.created_at = COALESCE(t.creata, s.created_at),
      s.updated_at = COALESCE(t.modificata, t.creata, s.updated_at);

UPDATE schede SET titolo_opera = '' WHERE titolo_opera IS NULL;
UPDATE schede SET published_at = updated_at WHERE stato = 2;
UPDATE schede SET titolo_testo = LEFT(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(titolo_opera, ''), '<[^>]*>', ''), '[[:space:]]+', ' ')), 500);

ALTER TABLE schede
  MODIFY titolo_opera TEXT NOT NULL,
  ADD KEY idx_schede_stato (stato),
  ADD KEY idx_schede_titolo (titolo_testo),
  ADD CONSTRAINT fk_schede_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL;

-- Schedatori accreditati sulla scheda (molti-a-molti con utenti)
CREATE TABLE tds_users_schede_new (
  id_user INT NOT NULL,
  id_scheda INT NOT NULL,
  data_modifica DATETIME NULL,
  PRIMARY KEY (id_user, id_scheda),
  KEY idx_tus_scheda (id_scheda),
  CONSTRAINT fk_tus_user FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_tus_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE
);
INSERT INTO tds_users_schede_new (id_user, id_scheda, data_modifica)
  SELECT t.id_user, t.id_scheda, MAX(t.data_modifica)
    FROM tds_users_schede t
    JOIN users u ON u.id = t.id_user
    JOIN schede s ON s.id = t.id_scheda
   GROUP BY t.id_user, t.id_scheda;
DROP TABLE tds_users_schede;
RENAME TABLE tds_users_schede_new TO tds_users_schede;

-- Storico delle revisioni (creazione, invio, approvazione, rifiuto, ...)
CREATE TABLE schede_revisioni (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_scheda INT NOT NULL,
  id_user INT NULL,
  azione VARCHAR(32) NOT NULL,
  commento TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_revisioni_scheda (id_scheda, created_at),
  CONSTRAINT fk_revisioni_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_revisioni_user FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE SET NULL
);
INSERT INTO schede_revisioni (id_scheda, id_user, azione, commento, created_at)
  SELECT id, created_by, 'importata', note_schedatore, created_at FROM schede;

DROP TABLE tds_stato_schedeUser;
DROP TABLE tds_schede_statoScheda;
DROP TABLE statoScheda;

-- -----------------------------------------------------------------------------
-- AUTORI: voce condivisa; formula e categoria passano sul collegamento
-- -----------------------------------------------------------------------------
UPDATE autori SET nome = TRIM(REGEXP_REPLACE(COALESCE(nome, ''), '[[:space:]]+', ' '));
DELETE a FROM autori a LEFT JOIN tds_schede_autori t ON t.id_autore = a.id WHERE a.nome = '' AND t.id_autore IS NULL;
ALTER TABLE autori MODIFY nome VARCHAR(255) NOT NULL DEFAULT '';

CREATE TABLE _map_autori AS
  SELECT id, MIN(id) OVER (PARTITION BY nome) AS canon FROM autori;

CREATE TABLE tds_schede_autori_new (
  id_scheda INT NOT NULL,
  id_autore INT NOT NULL,
  formula_precedente VARCHAR(255) NULL,
  formula_successiva VARCHAR(255) NULL,
  categoria VARCHAR(64) NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_autore),
  KEY idx_tsa_autore (id_autore),
  CONSTRAINT fk_tsa_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsa_autore FOREIGN KEY (id_autore) REFERENCES autori (id)
);
INSERT IGNORE INTO tds_schede_autori_new (id_scheda, id_autore, formula_precedente, formula_successiva, categoria, ordine)
  SELECT t.id_scheda, m.canon,
         NULLIF(TRIM(a.formula_precedente), ''), NULLIF(TRIM(a.formula_successiva), ''), NULLIF(TRIM(a.categoria), ''),
         ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_autore) - 1
    FROM tds_schede_autori t
    JOIN autori a ON a.id = t.id_autore
    JOIN _map_autori m ON m.id = t.id_autore
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_autori;
DELETE a FROM autori a JOIN _map_autori m ON m.id = a.id WHERE m.id <> m.canon;
DROP TABLE _map_autori;
RENAME TABLE tds_schede_autori_new TO tds_schede_autori;

ALTER TABLE autori
  DROP COLUMN formula_precedente,
  DROP COLUMN formula_successiva,
  DROP COLUMN categoria,
  ADD COLUMN date_vita VARCHAR(100) NULL,
  ADD COLUMN note TEXT NULL,
  ADD UNIQUE KEY uq_autori_nome (nome);

-- -----------------------------------------------------------------------------
-- MATERIALI
-- -----------------------------------------------------------------------------
UPDATE materiali SET nome_materiale = TRIM(REGEXP_REPLACE(COALESCE(nome_materiale, ''), '[[:space:]]+', ' '));
DELETE m FROM materiali m LEFT JOIN tds_schede_materiali t ON t.id_materiale = m.id WHERE m.nome_materiale = '' AND t.id_materiale IS NULL;
ALTER TABLE materiali MODIFY nome_materiale VARCHAR(255) NOT NULL DEFAULT '';

CREATE TABLE _map_materiali AS
  SELECT id, MIN(id) OVER (PARTITION BY nome_materiale) AS canon FROM materiali;

CREATE TABLE tds_schede_materiali_new (
  id_scheda INT NOT NULL,
  id_materiale INT NOT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_materiale),
  KEY idx_tsm_materiale (id_materiale),
  CONSTRAINT fk_tsm_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsm_materiale FOREIGN KEY (id_materiale) REFERENCES materiali (id)
);
INSERT IGNORE INTO tds_schede_materiali_new (id_scheda, id_materiale, ordine)
  SELECT t.id_scheda, m.canon, ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_materiale) - 1
    FROM tds_schede_materiali t
    JOIN _map_materiali m ON m.id = t.id_materiale
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_materiali;
DELETE x FROM materiali x JOIN _map_materiali m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_materiali;
RENAME TABLE tds_schede_materiali_new TO tds_schede_materiali;
ALTER TABLE materiali ADD UNIQUE KEY uq_materiali_nome (nome_materiale);

-- -----------------------------------------------------------------------------
-- TECNICHE
-- -----------------------------------------------------------------------------
UPDATE tecniche SET nome_tecnica = TRIM(REGEXP_REPLACE(COALESCE(nome_tecnica, ''), '[[:space:]]+', ' '));
DELETE x FROM tecniche x LEFT JOIN tds_schede_tecniche t ON t.id_tecnica = x.id WHERE x.nome_tecnica = '' AND t.id_tecnica IS NULL;
ALTER TABLE tecniche MODIFY nome_tecnica VARCHAR(255) NOT NULL DEFAULT '';

CREATE TABLE _map_tecniche AS
  SELECT id, MIN(id) OVER (PARTITION BY nome_tecnica) AS canon FROM tecniche;

CREATE TABLE tds_schede_tecniche_new (
  id_scheda INT NOT NULL,
  id_tecnica INT NOT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_tecnica),
  KEY idx_tst_tecnica (id_tecnica),
  CONSTRAINT fk_tst_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tst_tecnica FOREIGN KEY (id_tecnica) REFERENCES tecniche (id)
);
INSERT IGNORE INTO tds_schede_tecniche_new (id_scheda, id_tecnica, ordine)
  SELECT t.id_scheda, m.canon, ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_tecnica) - 1
    FROM tds_schede_tecniche t
    JOIN _map_tecniche m ON m.id = t.id_tecnica
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_tecniche;
DELETE x FROM tecniche x JOIN _map_tecniche m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_tecniche;
RENAME TABLE tds_schede_tecniche_new TO tds_schede_tecniche;
ALTER TABLE tecniche ADD UNIQUE KEY uq_tecniche_nome (nome_tecnica);

-- -----------------------------------------------------------------------------
-- UBICAZIONI: il luogo è condiviso; sala/vetrina diventa "collocazione"
-- sul collegamento
-- -----------------------------------------------------------------------------
UPDATE ubicazioni SET ubicazione = TRIM(REGEXP_REPLACE(COALESCE(ubicazione, ''), '[[:space:]]+', ' '));
DELETE x FROM ubicazioni x LEFT JOIN tds_schede_ubicazioni t ON t.id_ubicazione = x.id WHERE x.ubicazione = '' AND t.id_ubicazione IS NULL;
ALTER TABLE ubicazioni MODIFY ubicazione VARCHAR(255) NOT NULL DEFAULT '';

CREATE TABLE _map_ubicazioni AS
  SELECT id, MIN(id) OVER (PARTITION BY ubicazione) AS canon FROM ubicazioni;

CREATE TABLE tds_schede_ubicazioni_new (
  id_scheda INT NOT NULL,
  id_ubicazione INT NOT NULL,
  collocazione VARCHAR(255) NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_ubicazione),
  KEY idx_tsu_ubicazione (id_ubicazione),
  CONSTRAINT fk_tsu_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsu_ubicazione FOREIGN KEY (id_ubicazione) REFERENCES ubicazioni (id)
);
INSERT IGNORE INTO tds_schede_ubicazioni_new (id_scheda, id_ubicazione, collocazione, ordine)
  SELECT t.id_scheda, m.canon, NULLIF(TRIM(u.descrizione), ''),
         ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_ubicazione) - 1
    FROM tds_schede_ubicazioni t
    JOIN ubicazioni u ON u.id = t.id_ubicazione
    JOIN _map_ubicazioni m ON m.id = t.id_ubicazione
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_ubicazioni;
DELETE x FROM ubicazioni x JOIN _map_ubicazioni m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_ubicazioni;
RENAME TABLE tds_schede_ubicazioni_new TO tds_schede_ubicazioni;
-- La vecchia descrizione era la collocazione della singola opera: ora è sul collegamento
UPDATE ubicazioni SET descrizione = NULL;
ALTER TABLE ubicazioni ADD UNIQUE KEY uq_ubicazioni_nome (ubicazione);

-- -----------------------------------------------------------------------------
-- PROVENIENZE: provenienza + descrizione condivise; note sul collegamento
-- -----------------------------------------------------------------------------
UPDATE provenienze
   SET provenienza = TRIM(REGEXP_REPLACE(COALESCE(provenienza, ''), '[[:space:]]+', ' ')),
       descrizione = TRIM(COALESCE(descrizione, '')),
       note = TRIM(COALESCE(note, ''));
-- Righe con solo la nota: la nota diventa la provenienza
UPDATE provenienze SET provenienza = note, note = '' WHERE provenienza = '' AND note <> '';
DELETE x FROM provenienze x LEFT JOIN tds_schede_provenienze t ON t.id_provenienza = x.id WHERE x.provenienza = '' AND t.id_provenienza IS NULL;
ALTER TABLE provenienze
  MODIFY provenienza TEXT NOT NULL,
  MODIFY descrizione TEXT NULL;
ALTER TABLE provenienze
  ADD COLUMN chiave CHAR(64) AS (SHA2(CONCAT_WS(0x1F, LOWER(TRIM(provenienza)), LOWER(TRIM(COALESCE(descrizione, '')))), 256)) STORED;

CREATE TABLE _map_provenienze AS
  SELECT id, MIN(id) OVER (PARTITION BY chiave) AS canon FROM provenienze;

CREATE TABLE tds_schede_provenienze_new (
  id_scheda INT NOT NULL,
  id_provenienza INT NOT NULL,
  note TEXT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_provenienza),
  KEY idx_tsp_provenienza (id_provenienza),
  CONSTRAINT fk_tsp_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsp_provenienza FOREIGN KEY (id_provenienza) REFERENCES provenienze (id)
);
INSERT IGNORE INTO tds_schede_provenienze_new (id_scheda, id_provenienza, note, ordine)
  SELECT t.id_scheda, m.canon, NULLIF(p.note, ''),
         ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_provenienza) - 1
    FROM tds_schede_provenienze t
    JOIN provenienze p ON p.id = t.id_provenienza
    JOIN _map_provenienze m ON m.id = t.id_provenienza
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_provenienze;
DELETE x FROM provenienze x JOIN _map_provenienze m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_provenienze;
RENAME TABLE tds_schede_provenienze_new TO tds_schede_provenienze;
ALTER TABLE provenienze
  DROP COLUMN note,
  ADD UNIQUE KEY uq_provenienze_chiave (chiave);

-- -----------------------------------------------------------------------------
-- MOSTRE: voce condivisa, date numeriche
-- -----------------------------------------------------------------------------
UPDATE mostre SET
  titolo_mostra = TRIM(COALESCE(titolo_mostra, '')),
  luogo_mostra = TRIM(COALESCE(luogo_mostra, '')),
  giorno_data_da = IF(TRIM(giorno_data_da) REGEXP '^-?[0-9]+$', TRIM(giorno_data_da), NULL),
  mese_data_da   = IF(TRIM(mese_data_da)   REGEXP '^-?[0-9]+$', TRIM(mese_data_da),   NULL),
  anno_data_da   = IF(TRIM(anno_data_da)   REGEXP '^-?[0-9]+$', TRIM(anno_data_da),   NULL),
  giorno_data_a  = IF(TRIM(giorno_data_a)  REGEXP '^-?[0-9]+$', TRIM(giorno_data_a),  NULL),
  mese_data_a    = IF(TRIM(mese_data_a)    REGEXP '^-?[0-9]+$', TRIM(mese_data_a),    NULL),
  anno_data_a    = IF(TRIM(anno_data_a)    REGEXP '^-?[0-9]+$', TRIM(anno_data_a),    NULL);
DELETE x FROM mostre x LEFT JOIN tds_schede_mostre t ON t.id_mostra = x.id WHERE x.titolo_mostra = '' AND t.id_mostra IS NULL;
ALTER TABLE mostre
  MODIFY titolo_mostra TEXT NOT NULL,
  MODIFY curatore VARCHAR(255) NULL,
  MODIFY luogo_mostra VARCHAR(255) NULL,
  MODIFY giorno_data_da SMALLINT NULL,
  MODIFY mese_data_da SMALLINT NULL,
  MODIFY anno_data_da INT NULL,
  MODIFY giorno_data_a SMALLINT NULL,
  MODIFY mese_data_a SMALLINT NULL,
  MODIFY anno_data_a INT NULL;
ALTER TABLE mostre
  ADD COLUMN chiave CHAR(64) AS (SHA2(CONCAT_WS(0x1F, LOWER(TRIM(titolo_mostra)), LOWER(TRIM(COALESCE(luogo_mostra, ''))), COALESCE(anno_data_da, '')), 256)) STORED;

CREATE TABLE _map_mostre AS
  SELECT id, MIN(id) OVER (PARTITION BY chiave) AS canon FROM mostre;

CREATE TABLE tds_schede_mostre_new (
  id_scheda INT NOT NULL,
  id_mostra INT NOT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_mostra),
  KEY idx_tsmo_mostra (id_mostra),
  CONSTRAINT fk_tsmo_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsmo_mostra FOREIGN KEY (id_mostra) REFERENCES mostre (id)
);
INSERT IGNORE INTO tds_schede_mostre_new (id_scheda, id_mostra, ordine)
  SELECT t.id_scheda, m.canon, ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_mostra) - 1
    FROM tds_schede_mostre t
    JOIN _map_mostre m ON m.id = t.id_mostra
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_mostre;
DELETE x FROM mostre x JOIN _map_mostre m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_mostre;
RENAME TABLE tds_schede_mostre_new TO tds_schede_mostre;
ALTER TABLE mostre ADD UNIQUE KEY uq_mostre_chiave (chiave);

-- -----------------------------------------------------------------------------
-- BIBLIOGRAFIE e ALTRE BIBLIOGRAFIE: riferimenti condivisi tra schede
-- -----------------------------------------------------------------------------
UPDATE bibliografie SET riferimento_bibliografico = TRIM(COALESCE(riferimento_bibliografico, ''));
DELETE x FROM bibliografie x LEFT JOIN tds_schede_bibliografie t ON t.id_bibliografia = x.id WHERE x.riferimento_bibliografico = '' AND t.id_bibliografia IS NULL;
ALTER TABLE bibliografie
  MODIFY riferimento_bibliografico TEXT NOT NULL;
ALTER TABLE bibliografie
  ADD COLUMN chiave CHAR(64) AS (SHA2(LOWER(TRIM(riferimento_bibliografico)), 256)) STORED;

CREATE TABLE _map_bibliografie AS
  SELECT id, MIN(id) OVER (PARTITION BY chiave) AS canon FROM bibliografie;

CREATE TABLE tds_schede_bibliografie_new (
  id_scheda INT NOT NULL,
  id_bibliografia INT NOT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_bibliografia),
  KEY idx_tsb_bibliografia (id_bibliografia),
  CONSTRAINT fk_tsb_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsb_bibliografia FOREIGN KEY (id_bibliografia) REFERENCES bibliografie (id)
);
INSERT IGNORE INTO tds_schede_bibliografie_new (id_scheda, id_bibliografia, ordine)
  SELECT t.id_scheda, m.canon, ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_bibliografia) - 1
    FROM tds_schede_bibliografie t
    JOIN _map_bibliografie m ON m.id = t.id_bibliografia
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_bibliografie;
DELETE x FROM bibliografie x JOIN _map_bibliografie m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_bibliografie;
RENAME TABLE tds_schede_bibliografie_new TO tds_schede_bibliografie;
ALTER TABLE bibliografie ADD UNIQUE KEY uq_bibliografie_chiave (chiave);

UPDATE altreBibliografie SET riferimento_bibliografico = TRIM(COALESCE(riferimento_bibliografico, ''));
DELETE x FROM altreBibliografie x LEFT JOIN tds_schede_altreBibliografie t ON t.id_altreBibliografie = x.id WHERE x.riferimento_bibliografico = '' AND t.id_altreBibliografie IS NULL;
ALTER TABLE altreBibliografie
  MODIFY riferimento_bibliografico TEXT NOT NULL;
ALTER TABLE altreBibliografie
  ADD COLUMN chiave CHAR(64) AS (SHA2(LOWER(TRIM(riferimento_bibliografico)), 256)) STORED;

CREATE TABLE _map_altreBibliografie AS
  SELECT id, MIN(id) OVER (PARTITION BY chiave) AS canon FROM altreBibliografie;

CREATE TABLE tds_schede_altreBibliografie_new (
  id_scheda INT NOT NULL,
  id_altreBibliografie INT NOT NULL,
  ordine INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_scheda, id_altreBibliografie),
  KEY idx_tsab_bibliografia (id_altreBibliografie),
  CONSTRAINT fk_tsab_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsab_bibliografia FOREIGN KEY (id_altreBibliografie) REFERENCES altreBibliografie (id)
);
INSERT IGNORE INTO tds_schede_altreBibliografie_new (id_scheda, id_altreBibliografie, ordine)
  SELECT t.id_scheda, m.canon, ROW_NUMBER() OVER (PARTITION BY t.id_scheda ORDER BY t.id_altreBibliografie) - 1
    FROM tds_schede_altreBibliografie t
    JOIN _map_altreBibliografie m ON m.id = t.id_altreBibliografie
    JOIN schede s ON s.id = t.id_scheda;
DROP TABLE tds_schede_altreBibliografie;
DELETE x FROM altreBibliografie x JOIN _map_altreBibliografie m ON m.id = x.id WHERE m.id <> m.canon;
DROP TABLE _map_altreBibliografie;
RENAME TABLE tds_schede_altreBibliografie_new TO tds_schede_altreBibliografie;
ALTER TABLE altreBibliografie ADD UNIQUE KEY uq_altreBibliografie_chiave (chiave);

-- -----------------------------------------------------------------------------
-- Dati propri della singola scheda: FK diretta con ON DELETE CASCADE
-- (le righe non collegate ad alcuna scheda sono residui di bozze eliminate)
-- -----------------------------------------------------------------------------

-- Cronologie (date numeriche per consentire la ricerca per intervallo)
ALTER TABLE cronologie ADD COLUMN id_scheda INT NULL AFTER id, ADD COLUMN ordine INT NOT NULL DEFAULT 0;
UPDATE cronologie c JOIN (SELECT id_cronologia, MIN(id_scheda) AS id_scheda FROM tds_schede_cronologie GROUP BY id_cronologia) t
  ON t.id_cronologia = c.id SET c.id_scheda = t.id_scheda;
DELETE c FROM cronologie c LEFT JOIN schede s ON s.id = c.id_scheda WHERE s.id IS NULL;
UPDATE cronologie SET
  giorno_data_da = IF(TRIM(giorno_data_da) REGEXP '^-?[0-9]+$', TRIM(giorno_data_da), NULL),
  mese_data_da   = IF(TRIM(mese_data_da)   REGEXP '^-?[0-9]+$', TRIM(mese_data_da),   NULL),
  anno_data_da   = IF(TRIM(anno_data_da)   REGEXP '^-?[0-9]+$', TRIM(anno_data_da),   NULL),
  giorno_data_a  = IF(TRIM(giorno_data_a)  REGEXP '^-?[0-9]+$', TRIM(giorno_data_a),  NULL),
  mese_data_a    = IF(TRIM(mese_data_a)    REGEXP '^-?[0-9]+$', TRIM(mese_data_a),    NULL),
  anno_data_a    = IF(TRIM(anno_data_a)    REGEXP '^-?[0-9]+$', TRIM(anno_data_a),    NULL),
  etichetta_data = NULLIF(TRIM(etichetta_data), ''),
  ambito_storico = NULLIF(TRIM(ambito_storico), '');
ALTER TABLE cronologie
  MODIFY id_scheda INT NOT NULL,
  MODIFY giorno_data_da SMALLINT NULL,
  MODIFY mese_data_da SMALLINT NULL,
  MODIFY anno_data_da INT NULL,
  MODIFY giorno_data_a SMALLINT NULL,
  MODIFY mese_data_a SMALLINT NULL,
  MODIFY anno_data_a INT NULL,
  ADD KEY idx_cronologie_anni (anno_data_da, anno_data_a),
  ADD CONSTRAINT fk_cronologie_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE;
DROP TABLE tds_schede_cronologie;

-- Inventari. La "proprietà giuridica" è in `descrizione`: il vecchio editor la
-- salvava per errore in `nome_inventario`.
ALTER TABLE inventari ADD COLUMN id_scheda INT NULL AFTER id, ADD COLUMN ordine INT NOT NULL DEFAULT 0;
UPDATE inventari i JOIN (SELECT id_inventario, MIN(id_scheda) AS id_scheda FROM tds_schede_inventari GROUP BY id_inventario) t
  ON t.id_inventario = i.id SET i.id_scheda = t.id_scheda;
DELETE i FROM inventari i LEFT JOIN schede s ON s.id = i.id_scheda WHERE s.id IS NULL;
UPDATE inventari SET descrizione = nome_inventario, nome_inventario = NULL
 WHERE TRIM(COALESCE(descrizione, '')) = '' AND TRIM(COALESCE(nome_inventario, '')) <> '';
UPDATE inventari SET
  numero_inventario = NULLIF(TRIM(numero_inventario), ''),
  nome_inventario = NULLIF(TRIM(nome_inventario), ''),
  descrizione = NULLIF(TRIM(descrizione), '');
ALTER TABLE inventari
  MODIFY id_scheda INT NOT NULL,
  ADD CONSTRAINT fk_inventari_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE;
DROP TABLE tds_schede_inventari;

-- Documentazione fotografica
ALTER TABLE documentazioniFotografiche ADD COLUMN id_scheda INT NULL AFTER id, ADD COLUMN ordine INT NOT NULL DEFAULT 0;
UPDATE documentazioniFotografiche d JOIN (SELECT id_documentazioneFotografica AS id_doc, MIN(id_scheda) AS id_scheda
                                            FROM tds_schede_documentazioniFotografiche GROUP BY id_documentazioneFotografica) t
  ON t.id_doc = d.id SET d.id_scheda = t.id_scheda;
DELETE d FROM documentazioniFotografiche d LEFT JOIN schede s ON s.id = d.id_scheda WHERE s.id IS NULL;
ALTER TABLE documentazioniFotografiche
  MODIFY id_scheda INT NOT NULL,
  ADD CONSTRAINT fk_docfoto_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE;
DROP TABLE tds_schede_documentazioniFotografiche;

-- Gruppi di misure (la vecchia tds_schede_gruppo_misure era in realtà un'entità)
RENAME TABLE tds_schede_gruppo_misure TO gruppi_misure;
ALTER TABLE gruppi_misure ADD COLUMN id_scheda INT NULL AFTER id, ADD COLUMN ordine INT NOT NULL DEFAULT 0;
UPDATE gruppi_misure g JOIN (SELECT id_gruppo_misure, MIN(id_scheda) AS id_scheda FROM tds_schede_misure GROUP BY id_gruppo_misure) t
  ON t.id_gruppo_misure = g.id SET g.id_scheda = t.id_scheda;
UPDATE gruppi_misure g JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY id_scheda ORDER BY id) - 1 AS rn FROM gruppi_misure) r
  ON r.id = g.id SET g.ordine = r.rn;
DROP TABLE tds_schede_misure;
DELETE m FROM misure m LEFT JOIN gruppi_misure g ON g.id = m.id_gruppo_misure LEFT JOIN schede s ON s.id = g.id_scheda WHERE s.id IS NULL;
DELETE g FROM gruppi_misure g LEFT JOIN schede s ON s.id = g.id_scheda WHERE s.id IS NULL;
ALTER TABLE gruppi_misure
  MODIFY id_scheda INT NOT NULL,
  ADD CONSTRAINT fk_gruppi_misure_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE;
UPDATE gruppi_misure SET intero_parziale = TRIM(TRAILING ',' FROM TRIM(intero_parziale));
ALTER TABLE misure
  ADD COLUMN ordine INT NOT NULL DEFAULT 0,
  MODIFY id_gruppo_misure INT NOT NULL,
  MODIFY valore DECIMAL(12, 3) NULL,
  ADD CONSTRAINT fk_misure_gruppo FOREIGN KEY (id_gruppo_misure) REFERENCES gruppi_misure (id) ON DELETE CASCADE;
UPDATE misure m JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY id_gruppo_misure ORDER BY id) - 1 AS rn FROM misure) r
  ON r.id = m.id SET m.ordine = r.rn;

-- Immagini: da data URL (LONGTEXT) a binario + MIME. Le immagini caricate ma non
-- ancora collegate a una scheda hanno id_scheda NULL e vengono ripulite dall'app.
ALTER TABLE immagini
  ADD COLUMN id_scheda INT NULL AFTER id,
  ADD COLUMN ordine INT NOT NULL DEFAULT 0,
  ADD COLUMN mime VARCHAR(64) NULL,
  ADD COLUMN dati LONGBLOB NULL,
  ADD COLUMN uploaded_by INT NULL,
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE immagini i JOIN (SELECT id_immagine, MIN(id_scheda) AS id_scheda FROM tds_schede_immagini GROUP BY id_immagine) t
  ON t.id_immagine = i.id SET i.id_scheda = t.id_scheda;
DELETE i FROM immagini i LEFT JOIN schede s ON s.id = i.id_scheda WHERE s.id IS NULL;
UPDATE immagini
   SET mime = LOWER(SUBSTRING_INDEX(SUBSTRING(data, 6), ';', 1)),
       dati = FROM_BASE64(SUBSTRING_INDEX(data, ',', -1))
 WHERE data LIKE 'data:image/%;base64,%';
DELETE FROM immagini WHERE dati IS NULL OR mime IS NULL;
UPDATE immagini i JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY id_scheda ORDER BY id) - 1 AS rn FROM immagini) r
  ON r.id = i.id SET i.ordine = r.rn;
UPDATE immagini SET didascalia = NULLIF(TRIM(didascalia), '');
DROP TABLE tds_schede_immagini;
ALTER TABLE immagini
  DROP COLUMN data,
  MODIFY mime VARCHAR(64) NOT NULL,
  MODIFY dati LONGBLOB NOT NULL,
  ADD KEY idx_immagini_scheda (id_scheda, ordine),
  ADD CONSTRAINT fk_immagini_scheda FOREIGN KEY (id_scheda) REFERENCES schede (id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_immagini_user FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL;
