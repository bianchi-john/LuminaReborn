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
exports.schedaToAdmin = exports.deleteSchedaForSchedatore = exports.getSchedeForSchedatore = void 0;
const schedatore_query_1 = require("../query/schedatore.query");
const mysql_config_1 = require("../config/mysql.config");
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const authHelpers_1 = require("../helpers/authHelpers"); // Importa le funzioni dal modulo
const validator = require('validator');
const getSchedeForSchedatore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const userData = yield (0, authHelpers_1.getUseData)(req, res);
        if (userData !== false) {
            const pool = yield (0, mysql_config_1.connection)();
            const result = yield pool.query(schedatore_query_1.QUERY.SELECT_SCHEDE_PER_SCHEDATORE, [userData.username]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Schede for schedatore ' + userData.username + ' retrieved', result[0]));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
    return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
        .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Problema identificazione utente. Il problema riguarda il token jwt'));
});
exports.getSchedeForSchedatore = getSchedeForSchedatore;
const deleteSchedaForSchedatore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const schedaIdString = req.query.id; // Ottieni il valore dalla query string
        const schedaId = parseInt(schedaIdString, 10); // Converti in numero intero
        console.log(req.originalUrl);
        if (schedaId) {
            console.log(req.params.id);
            const result = yield pool.query(schedatore_query_1.QUERY.DELETE_SCHEDE_PER_SCHEDATORE, [schedaId]);
            pool.end();
            return res.status(200).json({
                code: 200,
                status: 'OK',
                message: `Scheda ${schedaId} eliminata con successo `,
                data: result[0]
            });
        }
        return res.status(500).json({
            code: 500,
            status: 'INTERNAL_SERVER_ERROR',
            message: 'Id non arrivato al server'
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            status: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred'
        });
    }
});
exports.deleteSchedaForSchedatore = deleteSchedaForSchedatore;
const schedaToAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const userData = yield (0, authHelpers_1.getUseData)(req, res);
        if (userData !== false) {
            const pool = yield (0, mysql_config_1.connection)();
            const result = yield pool.query(schedatore_query_1.QUERY.SELECT_SCHEDE_PER_SCHEDATORE, [userData.username]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Schede for schedatore ' + userData.username + ' retrieved', result[0]));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
    return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
        .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'Problema identificazione utente. Il problema riguarda il token jwt'));
});
exports.schedaToAdmin = schedaToAdmin;
