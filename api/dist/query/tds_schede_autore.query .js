"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_autori: 'SELECT * FROM tds_schede_autori',
    SELECT_TDS_SCHEDE_autore: 'SELECT * FROM tds_schede_autori WHERE id = ?',
    CREATE_TDS_SCHEDE_autore: 'INSERT INTO tds_schede_autori(id_scheda, id) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_autore: 'UPDATE tds_schede_autori SET id_scheda = ?, id = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_autore: 'DELETE FROM tds_schede_autori WHERE id = ?'
};
