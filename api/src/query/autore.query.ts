export const QUERY = {
    SELECT_AUTORI: 'SELECT * FROM autori',
    SELECT_AUTORE: 'SELECT * FROM autori WHERE id = ?',
    CREATE_AUTORE: 'INSERT INTO autori(id_autore, nome, informazioni) VALUES (?, ?, ?);',
    UPDATE_AUTORE: 'UPDATE autori SET id_autore = ?, nome = ?, informazioni = ? WHERE id = ?',
    DELETE_AUTORE: 'DELETE FROM autori WHERE id = ?'
};
