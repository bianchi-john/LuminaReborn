export const QUERY = {
    SELECT_UBICAZIONI: 'SELECT * FROM ubicazioni',
    SELECT_UBICAZIONE: 'SELECT * FROM ubicazioni WHERE id = ?',
    CREATE_UBICAZIONE: 'INSERT INTO ubicazioni(id, ubicazione, descrizione) VALUES (?, ?, ?)',
    UPDATE_UBICAZIONE: 'UPDATE ubicazioni SET id = ?, ubicazione = ?, descrizione = ? WHERE id = ?',
    DELETE_UBICAZIONE: 'DELETE FROM ubicazioni WHERE id = ?',
};
