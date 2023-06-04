"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_MOSTRE: 'SELECT * FROM tds_schede_mostre',
    SELECT_TDS_SCHEDE_MOSTRA: 'SELECT * FROM tds_schede_mostre WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_MOSTRA: 'INSERT INTO tds_schede_mostre(id_scheda, id_mostra) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_MOSTRA: 'UPDATE tds_schede_mostre SET id_scheda = ?, id_mostra = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_MOSTRA: 'DELETE FROM tds_schede_mostre WHERE id_scheda = ?',
};
