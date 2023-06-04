"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_TDS_SCHEDE_INVENTARI: 'SELECT * FROM tds_schede_inventari',
    SELECT_TDS_SCHEDE_INVENTARIO: 'SELECT * FROM tds_schede_inventari WHERE id_scheda = ?',
    CREATE_TDS_SCHEDE_INVENTARIO: 'INSERT INTO tds_schede_inventari(id_scheda, id_inventario) VALUES (?, ?)',
    UPDATE_TDS_SCHEDE_INVENTARIO: 'UPDATE tds_schede_inventari SET id_scheda = ?, id_inventario = ? WHERE id_scheda = ?',
    DELETE_TDS_SCHEDE_INVENTARIO: 'DELETE FROM tds_schede_inventari WHERE id_scheda = ?',
};
