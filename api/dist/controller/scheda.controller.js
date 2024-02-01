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
exports.deleteScheda = exports.updateScheda = exports.createScheda = exports.getScheda = exports.getSchede = void 0;
const mysql_config_1 = require("../config/mysql.config");
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const scheda_query_1 = require("../query/scheda.query");
const getSchede = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(scheda_query_1.QUERY.SELECT_SCHEDE);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Schede retrieved', result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getSchede = getSchede;
const getScheda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const schedaId = req.params.schedaId;
        const querySelectScheda = scheda_query_1.QUERY.SELECT_SCHEDA;
        const querySelectAutori = scheda_query_1.QUERY.SELECT_AUTORI;
        const querySelectCronologie = scheda_query_1.QUERY.SELECT_CRONOLOGIE;
        const querySelectMateriali = scheda_query_1.QUERY.SELECT_MATERIALI;
        const querySelectTecniche = scheda_query_1.QUERY.SELECT_TECNICHE;
        const querySelectUbicazioni = scheda_query_1.QUERY.SELECT_UBICAZIONI;
        const querySelectInventari = scheda_query_1.QUERY.SELECT_INVENTARI;
        const querySelectProvenienze = scheda_query_1.QUERY.SELECT_PROVENIENZE;
        const querySelectMostre = scheda_query_1.QUERY.SELECT_MOSTRE;
        const querySelectBibliografie = scheda_query_1.QUERY.SELECT_BIBLIOGRAFIE;
        const querySelectAltreBibliografie = scheda_query_1.QUERY.SELECT_ALTREBIBLIOGRAFIE;
        const querySelectSchedatori = scheda_query_1.QUERY.SELECT_SCHEDATORI;
        const querySelectImmagini = scheda_query_1.QUERY.SELECT_IMMAGINI;
        const querySelectDocumentazioniFotografiche = scheda_query_1.QUERY.SELECT_DOCUMENTAZIONIFOTOGRAFICHE;
        const querySelectMisure = scheda_query_1.QUERY.SELECT_MISURE;
        const resultScheda = yield pool.query(querySelectScheda, [schedaId]);
        const resultAutori = yield pool.query(querySelectAutori, [schedaId]);
        const resultCronologie = yield pool.query(querySelectCronologie, [schedaId]);
        const resultMateriali = yield pool.query(querySelectMateriali, [schedaId]);
        const resultTecniche = yield pool.query(querySelectTecniche, [schedaId]);
        const resultUbicazioni = yield pool.query(querySelectUbicazioni, [schedaId]);
        const resultInventari = yield pool.query(querySelectInventari, [schedaId]);
        const resultProvenienze = yield pool.query(querySelectProvenienze, [schedaId]);
        const resultMostre = yield pool.query(querySelectMostre, [schedaId]);
        const resultBibliografie = yield pool.query(querySelectBibliografie, [schedaId]);
        const resultAltreBibliografie = yield pool.query(querySelectAltreBibliografie, [schedaId]);
        const resultSchedatori = yield pool.query(querySelectSchedatori, [schedaId]);
        const resultImmagini = yield pool.query(querySelectImmagini, [schedaId]);
        const resultDocumentazioniFotografiche = yield pool.query(querySelectDocumentazioniFotografiche, [schedaId]);
        const resultMisure = yield pool.query(querySelectMisure, [schedaId]);
        if (resultScheda.length > 0) {
            pool.end();
            return res.status(code_enum_1.Code.OK).send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Scheda retrieved', {
                scheda: resultScheda[0],
                autori: resultAutori[0],
                cronologie: resultCronologie[0],
                materiali: resultMateriali[0],
                tecniche: resultTecniche[0],
                ubicazioni: resultUbicazioni[0],
                inventari: resultInventari[0],
                provenienze: resultProvenienze[0],
                mostre: resultMostre[0],
                bibliografie: resultBibliografie[0],
                altreBibliografie: resultAltreBibliografie[0],
                immagini: resultImmagini[0],
                documentazioniFotografiche: resultDocumentazioniFotografiche[0],
                misure: resultMisure[0],
                schedatori: resultSchedatori[0],
            }));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Scheda not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getScheda = getScheda;
const createScheda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    // Estrai i dati dalla richiesta
    let schedaData = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        // Inserisci la scheda nella tabella principale
        const { query, values } = scheda_query_1.QUERY.CREATE_SCHEDA(schedaData);
        const resultScheda = yield pool.query(query, values);
        // Estrai l'id della scheda appena inserita
        const schedaId = resultScheda[0].insertId;
        // Inserisci gli altri dati nelle tabelle di collegamento
        yield Promise.all([
            ...schedaData.autori.map((autoreData) => __awaiter(void 0, void 0, void 0, function* () {
                const autoreQuery = scheda_query_1.QUERY.CREATE_SCHEDA_AUTORI(schedaId, autoreData);
                yield pool.query(autoreQuery.query, autoreQuery.values);
            })),
            // Inserisci materiali
            ...schedaData.materiali.map((materialeId) => __awaiter(void 0, void 0, void 0, function* () {
                yield pool.query(scheda_query_1.QUERY.CREATE_SCHEDA_MATERIALE, [schedaId, schedaData]);
            })),
            // Inserisci tecniche
            ...schedaData.tecniche.map((tecnicaId) => __awaiter(void 0, void 0, void 0, function* () {
                yield pool.query(scheda_query_1.QUERY.CREATE_SCHEDA_TECNICA, [schedaId, schedaData]);
            })),
            // ... Aggiungi altre tabelle di collegamento se necessario
        ]);
        // Costruisci la scheda risultante
        const scheda = Object.assign({ id: schedaId }, schedaData);
        return res.status(code_enum_1.Code.CREATED)
            .send(new response_1.HttpResponse(code_enum_1.Code.CREATED, status_enum_1.Status.CREATED, 'Scheda created', scheda));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.createScheda = createScheda;
const updateScheda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    let scheda = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(scheda_query_1.QUERY.SELECT_SCHEDA, [req.params.schedaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(scheda_query_1.QUERY.UPDATE_SCHEDA, [...Object.values(scheda), req.params.schedaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Scheda updated', Object.assign(Object.assign({}, scheda), { id: req.params.schedaId })));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Scheda not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.updateScheda = updateScheda;
const deleteScheda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(scheda_query_1.QUERY.SELECT_SCHEDA, [req.params.schedaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(scheda_query_1.QUERY.DELETE_SCHEDA, [req.params.schedaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Scheda deleted'));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Scheda not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.deleteScheda = deleteScheda;
