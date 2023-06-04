export const QUERY = {
    SELECT_TDS_SCHEDE_TECNICHE: 'SELECT * FROM tds_schede_tecniche',
    SELECT_TDS_SCHEDE_TECNICA: 'SELECT * FROM tds_schede_tecniche WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_TECNICA: 'INSERT INTO tds_schede_tecniche(id_scheda, id_tecnica) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_TECNICA: 'UPDATE tds_schede_tecniche SET id_scheda = ?, id_tecnica = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_TECNICA: 'DELETE FROM tds_schede_tecniche WHERE id_scheda = ?'
};
