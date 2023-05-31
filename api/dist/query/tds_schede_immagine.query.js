"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_IMMAGINI: 'SELECT * FROM tds_schede_immagini',
    SELECT_TDS_SCHEDE_IMMAGINE: 'SELECT * FROM tds_schede_immagini WHERE id = ?',
    CREATE_TDS_SCHEDE_IMMAGINE: 'INSERT INTO tds_schede_immagini(id_scheda, id_immagine) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_IMMAGINE: 'UPDATE tds_schede_immagini SET id_scheda = ?, id_immagine = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_IMMAGINE: 'DELETE FROM tds_schede_immagini WHERE id = ?'
};
