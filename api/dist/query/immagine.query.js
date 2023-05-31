"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_IMMAGINI: 'SELECT * FROM immagini',
    SELECT_IMMAGINE: 'SELECT * FROM immagini WHERE id = ?',
    CREATE_IMMAGINE: 'INSERT INTO immagini(id_immagine, path) VALUES (?, ?);',
    UPDATE_IMMAGINE: 'UPDATE immagini SET id_immagine = ?, path = ? WHERE id = ?',
    DELETE_IMMAGINE: 'DELETE FROM immagini WHERE id = ?'
};
