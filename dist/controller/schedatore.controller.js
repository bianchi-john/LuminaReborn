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
exports.withdrawScheda = exports.schedaToAdmin = exports.deleteSchedaForSchedatore = exports.getSchedeForSchedatore = void 0;
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
        const inApprovazione = req.query.inApprovazione;
        const userData = yield (0, authHelpers_1.getUserData)(req, res);
        if (userData !== false) {
            const pool = yield (0, mysql_config_1.connection)();
            let query;
            let params;
            if (inApprovazione === 'ok') {
                query = schedatore_query_1.QUERY.SELECT_SCHEDE_PER_SCHEDATORE_IN_APPROVAZIONE;
                params = [userData.username];
            }
            else {
                query = schedatore_query_1.QUERY.SELECT_SCHEDE_PER_SCHEDATORE;
                params = [userData.username];
            }
            const result = yield pool.query(query, params);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Ottenute le schede ' + userData.username + ' retrieved', result[0]));
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
        const schedaId = req.query.schedaId;
        const result = yield pool.query(schedatore_query_1.QUERY.DELETE_SCHEDE_PER_SCHEDATORE, [schedaId]);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Eliminata la scheda' + schedaId, result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.deleteSchedaForSchedatore = deleteSchedaForSchedatore;
const schedaToAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const schedaId = req.query.schedaId;
        const result = yield pool.query(schedatore_query_1.QUERY.SEND_SCHEDE_TO_SCHEDATORE, [schedaId]);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Inviata in approvazione la scheda' + schedaId, result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.schedaToAdmin = schedaToAdmin;
const withdrawScheda = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const schedaId = req.query.schedaId;
        const result = yield pool.query(schedatore_query_1.QUERY.WITHDRAW_SCHEDA, [schedaId]);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Ritirata la scheda:' + schedaId, result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.withdrawScheda = withdrawScheda;
