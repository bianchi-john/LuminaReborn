export const QUERY = {
    SELECT_IMMAGINI: 'SELECT * FROM immagini',
    SELECT_IMMAGINE: 'SELECT * FROM immagini WHERE id = ?',
    CREATE_IMMAGINE: 'INSERT INTO immagini(id, path, didascalia) VALUES (?, ?, ?);',
    UPDATE_IMMAGINE: 'UPDATE immagini SET id = ?, path = ?, didascalia=? WHERE id = ?',
    DELETE_IMMAGINE: 'DELETE FROM immagini WHERE id = ?'
};
