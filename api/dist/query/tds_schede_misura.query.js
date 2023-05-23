"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_MISURE: 'SELECT * FROM tds_schede_materiali',
    SELECT_TDS_SCHEDE_MISURA: 'SELECT * FROM tds_schede_materiali WHERE id = ?',
    CREATE_TDS_SCHEDE_MISURA: 'INSERT INTO tds_schede_materiali(id_scheda, id_misura) VALUES (?, ?);',
    UPDATE_TDS_SCHEDE_MISURA: 'UPDATE tds_schede_materiali SET id_scheda = ?, id_misura = ? WHERE id = ?',
    DELETE_TDS_SCHEDE_MISURA: 'DELETE FROM tds_schede_materiali WHERE id = ?'
};
