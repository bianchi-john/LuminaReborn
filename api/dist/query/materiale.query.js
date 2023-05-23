"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = void 0;
exports.QUERY = {
    SELECT_MATERIALI: 'SELECT * FROM materiali',
    SELECT_MATERIALE: 'SELECT * FROM materiali WHERE id = ?',
    CREATE_MATERIALE: 'INSERT INTO materiali(id, nome_materiale, descrizione) VALUES (?, ?, ?);',
    UPDATE_MATERIALE: 'UPDATE materiali SET id = ?, nome_materiale = ?, descrizione = ? WHERE id = ?',
    DELETE_MATERIALE: 'DELETE FROM materiali WHERE id = ?'
};
