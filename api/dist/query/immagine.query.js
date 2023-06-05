"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_IMMAGINI: 'SELECT * FROM immagini',
    SELECT_IMMAGINE: 'SELECT * FROM immagini WHERE id_immagine = ?',
    CREATE_IMMAGINE: 'INSERT INTO immagini(id_immagine, path, didascalia) VALUES (?, ?, ?);',
    UPDATE_IMMAGINE: 'UPDATE immagini SET id_immagine = ?, path = ?, didascalia=? WHERE id_immagine = ?',
    DELETE_IMMAGINE: 'DELETE FROM immagini WHERE id_immagine = ?'
};
