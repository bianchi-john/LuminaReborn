import { Scheda } from "../interface/scheda";



export const QUERY = {
  SELECT_SCHEDE: 'SELECT * FROM schede',
  SELECT_SCHEDA: 'SELECT * FROM schede WHERE id = ?',
  SELECT_AUTORI: 'SELECT * FROM autori JOIN tds_schede_autori ON autori.id = tds_schede_autori.id_autore  WHERE tds_schede_autori.id_scheda = ?',
  SELECT_CRONOLOGIE: 'SELECT * FROM cronologie JOIN tds_schede_cronologie ON cronologie.id = tds_schede_cronologie.id_cronologia WHERE tds_schede_cronologie.id_scheda = ?',
  SELECT_MATERIALI: 'SELECT * FROM materiali JOIN tds_schede_materiali ON materiali.id = tds_schede_materiali.id_materiale WHERE tds_schede_materiali.id_scheda =  ?',
  SELECT_TECNICHE: 'SELECT * FROM tecniche JOIN tds_schede_tecniche ON tecniche.id = tds_schede_tecniche.id_tecnica WHERE tds_schede_tecniche.id_scheda =  ?',
  SELECT_UBICAZIONI: 'SELECT * FROM ubicazioni JOIN tds_schede_ubicazioni ON ubicazioni.id = tds_schede_ubicazioni.id_ubicazione WHERE tds_schede_ubicazioni.id_scheda =  ?',
  SELECT_INVENTARI: 'SELECT * FROM inventari JOIN tds_schede_inventari ON inventari.id = tds_schede_inventari.id_inventario WHERE tds_schede_inventari.id_scheda =  ?',
  SELECT_PROVENIENZE: 'SELECT * FROM provenienze JOIN tds_schede_provenienze ON provenienze.id = tds_schede_provenienze.id_provenienza WHERE tds_schede_provenienze.id_scheda =  ?',
  SELECT_MOSTRE: 'SELECT * FROM mostre JOIN tds_schede_mostre ON mostre.id = tds_schede_mostre.id_mostra WHERE tds_schede_mostre.id_scheda =  ?',
  SELECT_BIBLIOGRAFIE: 'SELECT * FROM bibliografie  JOIN tds_schede_bibliografie ON bibliografie.id = tds_schede_bibliografie.id_bibliografia WHERE tds_schede_bibliografie.id_scheda =  ?',
  SELECT_ALTREBIBLIOGRAFIE: 'SELECT * FROM altreBibliografie  JOIN tds_schede_altreBibliografie ON altreBibliografie.id = tds_schede_altreBibliografie.id_altreBibliografie WHERE tds_schede_altreBibliografie.id_scheda =  ?',
  SELECT_IMMAGINI: 'SELECT * FROM immagini JOIN tds_schede_immagini ON immagini.id = tds_schede_immagini.id_immagine WHERE tds_schede_immagini.id_scheda =  ?',
  SELECT_DOCUMENTAZIONIFOTOGRAFICHE: 'SELECT * FROM documentazioniFotografiche JOIN tds_schede_documentazioniFotografiche ON documentazioniFotografiche.id = tds_schede_documentazioniFotografiche.id_documentazioneFotografica WHERE tds_schede_documentazioniFotografiche.id_scheda =  ?',
  SELECT_MISURE: 'SELECT m.*, tsgm.* FROM misure AS m JOIN tds_schede_gruppo_misure AS tsgm ON m.id_gruppo_misure = tsgm.id JOIN tds_schede_misure AS tsm ON tsgm.id = tsm.id_gruppo_misure WHERE tsm.id_scheda = ?',
  SELECT_SCHEDATORI: 'SELECT * FROM users JOIN tds_users_schede ON users.id = tds_users_schede.id_user WHERE tds_users_schede.id_scheda = ?',
  UPDATE_SCHEDA: 'UPDATE schede SET id = ?, titolo_opera = ?,  corpo_scheda = ?, iscrizioni = ?, descrizione_sintetica = ?, storia_espositiva = ?, classificazione = ? WHERE id = ?',
  DELETE_SCHEDA: 'DELETE FROM schede WHERE id = ?',
  INSERT_SCHEDA: 'INSERT INTO schede (titolo_opera, corpo_scheda, iscrizioni, descrizione_sintetica, storia_espositiva, classificazione) VALUES (?, ?, ?, ?, ?, ?)',
  INSERT_AUTORE: 'INSERT INTO autori (formula_precedente, formula_successiva, categoria, nome) VALUES (?, ?, ?, ?)',
  INSERT_TDS_SCHEDA_AUTORI: 'INSERT INTO tds_schede_autori (id_scheda, id_autore) VALUES (?, ?)',
  INSERT_CONOLOGIA:'INSERT INTO cronologie (ambito_storico, etichetta_data, giorno_data_da, mese_data_da, anno_data_da, giorno_data_a, mese_data_a, anno_data_a) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  INSERT_TDS_SCHEDA_CONOLOGIA:'INSERT INTO tds_schede_cronologie (id_scheda, id_cronologia) VALUES (?, ?)',
  INSERT_UBICAZIONE:'INSERT INTO ubicazioni (ubicazione, descrizione) VALUES (?, ?)',
  INSERT_TDS_SCHEDA_UBICAZIONE:'INSERT INTO tds_schede_ubicazioni (id_scheda, id_ubicazione) VALUES (?, ?)',
  INSERT_INVENTARIO:'INSERT INTO inventari (numero_inventario, nome_inventario) VALUES (?, ?)',
  INSERT_TDS_SCHEDA_INVENTARIO:'INSERT INTO tds_schede_inventari (id_scheda, id_inventario) VALUES (?, ?)',
  INSERT_MATERIALE:'INSERT INTO materiali (nome_materiale) VALUES (?)',
  INSERT_TDS_SCHEDA_MATERIALE:'INSERT INTO tds_schede_materiali (id_scheda, id_materiale) VALUES (?, ?)',
  INSERT_TECNICA:'INSERT INTO tecniche (nome_tecnica) VALUES (?)',
  INSERT_TDS_SCHEDA_TECNICA:'INSERT INTO tds_schede_tecniche (id_scheda, id_tecnica) VALUES (?, ?)',
  INSERT_PROVENIENZA:'INSERT INTO provenienze (provenienza, descrizione, note) VALUES (?, ?, ?)',
  INSERT_TDS_SCHEDA_PROVENIENZA:'INSERT INTO tds_schede_provenienze (id_scheda, id_provenienza) VALUES (?, ?)',
  INSERT_MOSTRA:'INSERT INTO mostre (curatore, titolo_mostra, giorno_data_da, mese_data_da, anno_data_da, giorno_data_a, mese_data_a, anno_data_a, luogo_mostra, descrizione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )',
  INSERT_TDS_SCHEDA_MOSTRA:'INSERT INTO tds_schede_mostre (id_scheda, id_mostra) VALUES (?, ?)',
  INSERT_BIBILIOGRAFIA:'INSERT INTO bibliografie (riferimento_bibliografico) VALUES (?)',
  INSERT_TDS_SCHEDA_BIBILIOGRAFIA:'INSERT INTO tds_schede_bibliografie (id_scheda, id_bibliografia) VALUES (?, ?)',
  INSERT_ALTRABIBILIOGRAFIA:'INSERT INTO altreBibliografie (riferimento_bibliografico) VALUES (?)',
  INSERT_TDS_SCHEDA_ALTRABIBILIOGRAFIA:'INSERT INTO tds_schede_altreBibliografie (id_scheda, id_altreBibliografie) VALUES (?, ?)',
  INSERT_FOTOGRAFICA:'INSERT INTO documentazioniFotografiche (riferimento_bibliografico) VALUES (?)',
  INSERT_TDS_SCHEDA_FOTOGRAFICA:'INSERT INTO tds_schede_documentazioniFotografiche (id_scheda, id_documentazioneFotografica) VALUES (?, ?)',
  INSERT_GRUPPO_MISURE: 'INSERT INTO tds_schede_gruppo_misure (intero_parziale, titolo_gruppo_misure) VALUES (?, ?)',
  INSERT_MISURE: 'INSERT INTO misure (direzione, tipo, valore, unita_di_misura, id_gruppo_misure) VALUES (?, ?, ?, ?, ?)',
  INSERT_TDS_SCHEDA_MISURE: 'INSERT INTO tds_schede_misure (id_scheda, id_gruppo_misure) VALUES (?, ?)',
};
