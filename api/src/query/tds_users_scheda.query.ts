export const QUERY = {
    SELECT_TDS_USERS_SCHEDE: 'SELECT * FROM tds_users_schede',
    SELECT_TDS_USERS_SCHEDA: 'SELECT * FROM tds_users_schede WHERE id = ?',
    CREATE_TDS_USERS_SCHEDA: 'INSERT INTO tds_users_schede(id_user, id_scheda, data_modifica) VALUES (?, ?, ?);',
    UPDATE_TDS_USERS_SCHEDA: 'UPDATE tds_users_schede SET id_user = ?, id_scheda = ?, data_modifica = ? WHERE id = ?',
    DELETE_TDS_USERS_SCHEDA: 'DELETE FROM tds_users_schede WHERE id = ?'
};
