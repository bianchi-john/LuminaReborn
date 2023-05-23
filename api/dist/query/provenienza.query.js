"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_PROVENIENZE: 'SELECT * FROM provenienze',
    SELECT_PROVENIENZA: 'SELECT * FROM provenienze WHERE id = ?',
    CREATE_PROVENIENZA: 'INSERT INTO provenienze(id, provenienza, descrizione) VALUES (?, ?, ?)',
    UPDATE_PROVENIENZA: 'UPDATE provenienze SET id = ?, provenienza = ?, descrizione = ? WHERE id = ?',
    DELETE_PROVENIENZA: 'DELETE FROM provenienze WHERE id = ?',
};
