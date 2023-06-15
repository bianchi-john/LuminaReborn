export const QUERY = {
    SELECT_DOCUMENTAZIONIFOTOGRAFICHE: 'SELECT * FROM documentazioniFotografiche',
    SELECT_DOCUMENTAZIONIFOTOGRAFICA: 'SELECT * FROM documentazioniFotografiche WHERE id = ?',
    CREATE_DOCUMENTAZIONIFOTOGRAFICA: 'INSERT INTO documentazioniFotografiche(id, riferimento_bibliografico) VALUES (?, ?)',
    UPDATE_DOCUMENTAZIONIFOTOGRAFICA: 'UPDATE documentazioniFotografiche SET id = ?, riferimento_bibliografico = ? WHERE id = ?',
    DELETE_DOCUMENTAZIONIFOTOGRAFICA: 'DELETE FROM documentazioniFotografiche WHERE id = ?',
};
