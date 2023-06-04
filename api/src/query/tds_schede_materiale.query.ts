export const QUERY = {
    SELECT_TDS_SCHEDE_MATERIALI: 'SELECT * FROM tds_schede_materiali',
    SELECT_TDS_SCHEDE_MATERIALE: 'SELECT * FROM tds_schede_materiali WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_MATERIALE: 'INSERT INTO tds_schede_materiali(id_scheda, id_materiale) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_MATERIALE: 'UPDATE tds_schede_materiali SET id_scheda = ?, id_materiale = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_MATERIALE: 'DELETE FROM tds_schede_materiali WHERE id_scheda = ?'
};
