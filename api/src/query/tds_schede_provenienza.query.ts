export const QUERY = {
    SELECT_TDS_SCHEDE_PROVENIENZE: 'SELECT * FROM tds_schede_provenienze',
    SELECT_TDS_SCHEDE_PROVENIENZA: 'SELECT * FROM tds_schede_provenienze WHERE id = ?',
    CREATE_TDS_SCHEDE_PROVENIENZA: 'INSERT INTO tds_schede_provenienze(id, id_provenienza) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_PROVENIENZA: 'UPDATE tds_schede_provenienze SET id = ?, id_provenienza = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_PROVENIENZA: 'DELETE FROM tds_schede_provenienze WHERE id = ?',
};
