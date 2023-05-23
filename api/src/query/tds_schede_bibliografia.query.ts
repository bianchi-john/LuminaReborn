export const QUERY = {
    SELECT_TDS_SCHEDE_BIBLIOGRAFIE: 'SELECT * FROM tds_schede_bibliografie',
    SELECT_TDS_SCHEDE_BIBLIOGRAFIA: 'SELECT * FROM tds_schede_bibliografie WHERE id = ?',
    CREATE_TDS_SCHEDE_BIBLIOGRAFIA: 'INSERT INTO tds_schede_bibliografie(id_scheda, id_riferimento) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_BIBLIOGRAFIA: 'UPDATE tds_schede_bibliografie SET id_scheda = ?, id_riferimento = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_BIBLIOGRAFIA: 'DELETE FROM tds_schede_bibliografie WHERE id = ?',
};
