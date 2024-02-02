"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAutori = exports.insertSchedaAndAutori = void 0;
const scheda_query_1 = require("../query/scheda.query");
const mysql_config_1 = require("../config/mysql.config");
function insertSchedaAndAutori(scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield (0, mysql_config_1.connection)();
        // Inserisci la scheda
        const resultScheda = yield pool.query(scheda_query_1.QUERY.CREATE_SCHEDA, [
            scheda.titolo_opera,
            scheda.corpo_scheda,
            scheda.iscrizioni,
            scheda.descrizione_sintetica,
            scheda.storia_espositiva,
            scheda.classificazione,
        ]);
        return resultScheda[0].insertId;
    });
}
exports.insertSchedaAndAutori = insertSchedaAndAutori;
function insertAutori(pool, schedaId, scheda) {
    return __awaiter(this, void 0, void 0, function* () {
        const autoriPromises = [];
        for (let i = 1; i <= 3; i++) { // Considerando un massimo di 3 autori, adatta il valore massimo se necessario
            if (scheda[`NomeAutore${i}`]) {
                const resultAutore = yield pool.query(scheda_query_1.QUERY.INSERT_AUTORE, [
                    scheda[`Formula_precedente${i}`],
                    scheda[`Formula_successiva${i}`],
                    scheda[`Categoria${i}`],
                    scheda[`NomeAutore${i}`],
                ]);
                const autoreId = resultAutore[0].insertId;
                // Collega l'autore alla scheda nella tabella tds_schede_autori
                autoriPromises.push(pool.query(scheda_query_1.QUERY.INSERT_TDS_SCHEDA_AUTORI, [schedaId, autoreId]));
            }
        }
        yield Promise.all(autoriPromises);
    });
}
exports.insertAutori = insertAutori;
