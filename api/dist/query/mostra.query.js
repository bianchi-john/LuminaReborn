"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_MOSTRE: 'SELECT * FROM mostre',
    SELECT_MOSTRA: 'SELECT * FROM mostre WHERE id = ?',
    CREATE_MOSTRA: 'INSERT INTO mostre(id, curatore, titolo_mostra, data_inizio_mostra, data_fine_mostra luogo_mostra, descrizione) VALUES (?, ?, ?, ?, ?, ?, ?)',
    UPDATE_MOSTRA: 'UPDATE mostre SET id = ?, curatore = ?, titolo_mostra = ? , data_inizio_mostra = ?, data_fine_mostra = ? luogo_mostra = ?, descrizione = ? WHERE id = ?',
    DELETE_MOSTRA: 'DELETE FROM mostre WHERE id = ?',
};
