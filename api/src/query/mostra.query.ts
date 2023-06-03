export const QUERY = {
    SELECT_MOSTRE: 'SELECT * FROM mostre',
    SELECT_MOSTRA: 'SELECT * FROM mostre WHERE id = ?',
    CREATE_MOSTRA: 'INSERT INTO mostre(id, titolo_mostra, data_mostra, descrizione) VALUES (?, ?, ?, ?)',
    UPDATE_MOSTRA: 'UPDATE mostre SET id = ?, titolo_mostra = ? , data_mostra = ?, descrizione = ? WHERE id = ?',
    DELETE_MOSTRA: 'DELETE FROM mostre WHERE id = ?',
};
