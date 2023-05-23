"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TECNICHE: 'SELECT * FROM tecniche',
    SELECT_TECNICA: 'SELECT * FROM tecniche WHERE id = ?',
    CREATE_TECNICA: 'INSERT INTO tecniche(id, nome_tecnica, descrizione) VALUES (?, ?, ?);',
    UPDATE_TECNICA: 'UPDATE tecniche SET id = ?, nome_tecnica = ?, descrizione = ? WHERE id = ?',
    DELETE_TECNICA: 'DELETE FROM tecniche WHERE id = ?'
};
