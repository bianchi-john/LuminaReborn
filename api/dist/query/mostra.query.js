"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_MOSTRE: 'SELECT * FROM mostre',
    SELECT_MOSTRA: 'SELECT * FROM mostre WHERE id = ?',
    CREATE_MOSTRA: 'INSERT INTO mostre(id, curatore, titolo_mostra, giorno_data_da, mese_data_da, anno_data_da, giorno_data_a, mese_data_a, anno_data_a , luogo_mostra, descrizione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    UPDATE_MOSTRA: 'UPDATE mostre SET id = ?, curatore = ?, titolo_mostra = ?, giorno_data_da = ?, mese_data_da = ?, anno_data_da = ?, giorno_data_a = ?, mese_data_a = ?, anno_data_a = ?, luogo_mostra = ?, descrizione = ? WHERE id = ?',
    DELETE_MOSTRA: 'DELETE FROM mostre WHERE id = ?',
};
