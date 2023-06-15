"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_SCHEDE: 'SELECT * FROM schede',
    SELECT_SCHEDA: 'SELECT * FROM schede WHERE id = ?',
    CREATE_SCHEDA: 'INSERT INTO schede(id, titolo, commento, iscrizioni, descrizione_sintetica, storia_espositiva) VALUES (?, ?, ?, ?, ?, ?);',
    UPDATE_SCHEDA: 'UPDATE schede SET id = ?, titolo = ?, commento = ?, iscrizioni = ?, descrizione_sintetica = ?, storia_espositiva = ?, descrizione_sintetica = ? WHERE id = ?',
    DELETE_SCHEDA: 'DELETE FROM schede WHERE id = ?'
};
