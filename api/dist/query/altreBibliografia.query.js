"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_ALTREBIBLIOGRAFIE: 'SELECT * FROM altreBibliografie',
    SELECT_ALTREBIBLIOGRAFIA: 'SELECT * FROM altreBibliografie WHERE id = ?',
    CREATE_ALTREBIBLIOGRAFIA: 'INSERT INTO altreBibliografie(id, riferimento_bibliografico, altro) VALUES (?, ?, ?)',
    UPDATE_ALTREBIBLIOGRAFIA: 'UPDATE altreBibliografie SET id = ?, riferimento_bibliografico = ?, altro=? WHERE id = ?',
    DELETE_ALTREBIBLIOGRAFIA: 'DELETE FROM altreBibliografie WHERE id = ?',
};
