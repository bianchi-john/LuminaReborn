"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_INVENTARI: 'SELECT * FROM inventari',
    SELECT_INVENTARIO: 'SELECT * FROM inventari WHERE id = ?',
    CREATE_INVENTARIO: 'INSERT INTO inventari(id, numero_inventario, nome_inventario, descrizione) VALUES (?, ?, ?, ?)',
    UPDATE_INVENTARIO: 'UPDATE inventari SET id = ?, numero_inventario = ?,nome_inventario=?, descrizione = ? WHERE id = ?',
    DELETE_INVENTARIO: 'DELETE FROM inventari WHERE id = ?',
};
