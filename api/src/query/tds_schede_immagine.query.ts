export const QUERY = {
    SELECT_TDS_SCHEDE_IMMAGINI: 'SELECT * FROM tds_schede_immagini',
    SELECT_TDS_SCHEDE_IMMAGINE: 'SELECT * FROM tds_schede_immagini WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_IMMAGINE: 'INSERT INTO tds_schede_immagini(id_scheda, id_immagine) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_IMMAGINE: 'UPDATE tds_schede_immagini SET id_scheda = ?, id_immagine = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_IMMAGINE: 'DELETE FROM tds_schede_immagini WHERE id_scheda = ?'
};
