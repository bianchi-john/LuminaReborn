export const QUERY = {
    SELECT_MOSTRE: 'SELECT * FROM mostre',
    SELECT_MOSTRA: 'SELECT * FROM mostre WHERE id = ?',
    CREATE_MOSTRA: 'INSERT INTO mostre(id_scheda, id_mostra) VALUES (?, ?)',
    UPDATE_MOSTRA: 'UPDATE mostre SET id_scheda = ?, id_mostra = ? WHERE id = ?',
    DELETE_MOSTRA: 'DELETE FROM mostre WHERE id = ?',
};
