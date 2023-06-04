"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_AUTORI: 'SELECT * FROM tds_schede_autori',
    SELECT_TDS_SCHEDE_AUTORE: 'SELECT * FROM tds_schede_autori WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_AUTORE: 'INSERT INTO tds_schede_autori(id_scheda, id_autore) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_AUTORE: 'UPDATE tds_schede_autori SET id_scheda = ?, id_autore = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_AUTORE: 'DELETE FROM tds_schede_autori WHERE id_scheda = ?'
};
