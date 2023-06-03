export const QUERY = {
    SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIE: 'SELECT * FROM tds_schede_altreBibliografie',
    SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA: 'SELECT * FROM tds_schede_altreBibliografie WHERE id = ?',
    CREATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA: 'INSERT INTO tds_schede_altreBibliografie(id_scheda, id_riferimento) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA: 'UPDATE tds_schede_altreBibliografie SET id_scheda = ?, id_riferimento = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_ALTREBIBLIOGRAFIA: 'DELETE FROM tds_schede_altreBibliografie WHERE id = ?',
};
