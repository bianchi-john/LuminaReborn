export const QUERY = {
    SELECT_TDS_SCHEDE_UBICAZIONI: 'SELECT * FROM tds_schede_ubicazioni',
    SELECT_TDS_SCHEDE_UBICAZIONE: 'SELECT * FROM tds_schede_ubicazioni WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_UBICAZIONE: 'INSERT INTO tds_schede_ubicazioni(id_scheda, id_ubicazione) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_UBICAZIONE: 'UPDATE tds_schede_ubicazioni SET id_scheda = ?, id_ubicazione = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_UBICAZIONE: 'DELETE FROM tds_schede_ubicazioni WHERE id_scheda = ?',
};
