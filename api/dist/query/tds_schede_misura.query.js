"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_MISURE: 'SELECT * FROM tds_schede_misure',
    SELECT_TDS_SCHEDE_MISURA: 'SELECT * FROM tds_schede_misure WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_MISURA: 'INSERT INTO tds_schede_misure(id ,id_scheda, id_misura, intero_parziale, descrizione) VALUES (?, ?, ?, ?, ?);',
    UPDATE_TDS_SCHEDE_MISURA: 'UPDATE tds_schede_misure SET id = ? , id_scheda = ?, id_misura = ?, intero_parziale = ?, descrizione = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_MISURA: 'DELETE FROM tds_schede_misure WHERE id_scheda = ?'
};
