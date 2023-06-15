"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_AUTORI: 'SELECT * FROM autori',
    SELECT_AUTORE: 'SELECT * FROM autori WHERE id = ?',
    CREATE_AUTORE: 'INSERT INTO autori(id, formula_precedente, formula_successiva, categoria, nome) VALUES (?, ?, ?, ?, ?);',
    UPDATE_AUTORE: 'UPDATE autori SET id = ?, formula_precedente = ?, formula_successiva = ?, categoria = ?, nome = ? WHERE id = ?',
    DELETE_AUTORE: 'DELETE FROM autori WHERE id = ?'
};
