"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_GRUPPO_MISURE: 'SELECT * FROM tds_schede_gruppo_misure',
    SELECT_TDS_SCHEDE_GRUPPO_MISURA: 'SELECT * FROM tds_schede_gruppo_misure WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_GRUPPO_MISURA: 'INSERT INTO tds_schede_gruppo_misure(id_scheda ,id_gruppo_misure) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_GRUPPO_MISURA: 'UPDATE tds_schede_gruppo_misure SET id_scheda = ? , id_gruppo_misure = ?, WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_GRUPPO_MISURA: 'DELETE FROM tds_schede_gruppo_misure WHERE id_scheda = ?'
};
