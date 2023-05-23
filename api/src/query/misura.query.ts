export const QUERY = {
    SELECT_MISURE: 'SELECT * FROM misure',
    SELECT_MISURA: 'SELECT * FROM misure WHERE id = ?',
    CREATE_MISURA: 'INSERT INTO misure(id, misura, unita_di_misura, descrizione) VALUES (?, ?, ?, ?);',
    UPDATE_MISURA: 'UPDATE misure SET id = ?, misura = ?, unita_di_misura = ? ,descrizione = ? WHERE id = ?',
    DELETE_MISURA: 'DELETE FROM misure WHERE id = ?'
};
