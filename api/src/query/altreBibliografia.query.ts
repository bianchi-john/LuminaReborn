export const QUERY = {
    SELECT_ALTREBIBLIOGRAFIE: 'SELECT * FROM altreBibliografie',
    SELECT_ALTREBIBLIOGRAFIA: 'SELECT * FROM altreBibliografie WHERE id = ?',
    CREATE_ALTREBIBLIOGRAFIA: 'INSERT INTO altreBibliografie(id, riferimento_bibliografico) VALUES (?, ?)',
    UPDATE_ALTREBIBLIOGRAFIA: 'UPDATE altreBibliografie SET id = ?, riferimento_bibliografico = ? WHERE id = ?',
    DELETE_ALTREBIBLIOGRAFIA: 'DELETE FROM altreBibliografie WHERE id = ?',
};