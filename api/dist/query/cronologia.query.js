"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_CRONOLOGIE: 'SELECT * FROM cronologie',
    SELECT_CRONOLOGIA: 'SELECT * FROM cronologie WHERE id = ?',
    CREATE_CRONOLOGIA: 'INSERT INTO cronologie(id, ambito_storico, etichetta_data, giorno_data_da, mese_data_da, anno_data_da, giorno_data_a, mese_data_a, anno_data_a ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    UPDATE_CRONOLOGIA: 'UPDATE cronologie SET id = ?, ambito_storico = ?, etichetta_data = ?, giorno_data_da = ?, mese_data_da = ?, anno_data_da = ?, giorno_data_a = ?, mese_data_a = ?, anno_data_a = ?  WHERE id = ?',
    DELETE_CRONOLOGIA: 'DELETE FROM cronologie WHERE id = ?',
};
