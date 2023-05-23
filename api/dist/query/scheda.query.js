"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_SCHEDE: 'SELECT * FROM schede',
    SELECT_SCHEDA: 'SELECT * FROM schede WHERE id = ?',
    CREATE_SCHEDA: 'INSERT INTO schede(id, autore, titolo, cronologia_ambito, oggetto, iscrizioni, corpo_scheda, storia_espositiva) VALUES (?,?, ?, ?, ?, ?, ?, ?);',
    UPDATE_SCHEDA: 'UPDATE schede SET id = ? ,autore = ?, titolo = ?, cronologia_ambito = ?, oggetto = ?, iscrizioni = ?, corpo_scheda = ?, storia_espositiva = ? WHERE id = ?',
    DELETE_SCHEDA: 'DELETE FROM schede WHERE id = ?'
};
