"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_DOCUMENTAZIONIFOTOGRAFICHE: 'SELECT * FROM documentazioniFotografiche',
    SELECT_DOCUMENTAZIONIFOTOGRAFICA: 'SELECT * FROM documentazioniFotografica WHERE id = ?',
    CREATE_DOCUMENTAZIONIFOTOGRAFICA: 'INSERT INTO documentazioniFotografica(id, riferimento_bibliografico) VALUES (?, ?)',
    UPDATE_DOCUMENTAZIONIFOTOGRAFICA: 'UPDATE documentazioniFotografica SET id = ?, riferimento_bibliografico = ? WHERE id = ?',
    DELETE_DOCUMENTAZIONIFOTOGRAFICA: 'DELETE FROM documentazioniFotografica WHERE id = ?',
};
