export const QUERY = {
    SELECT_PROVENIENZE: 'SELECT * FROM provenienze',
    SELECT_PROVENIENZA: 'SELECT * FROM provenienze WHERE id = ?',
    CREATE_PROVENIENZA: 'INSERT INTO provenienze(id, provenienza, descrizione, note) VALUES (?, ?, ?, ?)',
    UPDATE_PROVENIENZA: 'UPDATE provenienze SET id = ?, provenienza = ?, descrizione = ?, note = ? WHERE id = ?',
    DELETE_PROVENIENZA: 'DELETE FROM provenienze WHERE id = ?',
};
