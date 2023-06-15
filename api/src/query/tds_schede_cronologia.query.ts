export const QUERY = {
    SELECT_TDS_SCHEDE_CRONOLOGIE: 'SELECT * FROM tds_schede_cronologie',
    SELECT_TDS_SCHEDE_CRONOLOGIA: 'SELECT * FROM tds_schede_cronologie WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_CRONOLOGIA: 'INSERT INTO tds_schede_cronologie(id_scheda, id_cronologia) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_CRONOLOGIA: 'UPDATE tds_schede_cronologie SET id_scheda = ?, id_cronologia = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_CRONOLOGIA: 'DELETE FROM tds_schede_cronologie WHERE id_scheda = ?',
};
