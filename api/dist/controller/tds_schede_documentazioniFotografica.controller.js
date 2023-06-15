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
exports.deleteTds_schede_documentazioniFotografica = exports.updateTds_schede_documentazioniFotografica = exports.createTds_schede_documentazioniFotografica = exports.getTds_schede_documentazioniFotografica = exports.getTds_schede_documentazioniFotografiche = void 0;
const mysql_config_1 = require("../config/mysql.config");
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const tds_schede_documentazioniFotografica_1 = require("../query/tds_schede_documentazioniFotografica");
const getTds_schede_documentazioniFotografiche = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICHE);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_documentazioniFotografiche retrieved', result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getTds_schede_documentazioniFotografiche = getTds_schede_documentazioniFotografiche;
const getTds_schede_documentazioniFotografica = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, [req.params.tds_schede_documentazioniFotograficaId]);
        if ((result[0]).length > 0) {
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_documentazioniFotografica retrieved', result[0]));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_documentazioniFotografica not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getTds_schede_documentazioniFotografica = getTds_schede_documentazioniFotografica;
const createTds_schede_documentazioniFotografica = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    let tds_schede_documentazioniFotografica = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.CREATE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, Object.values(tds_schede_documentazioniFotografica));
        tds_schede_documentazioniFotografica = Object.assign({ id: result[0].insertId }, req.body);
        return res.status(code_enum_1.Code.CREATED)
            .send(new response_1.HttpResponse(code_enum_1.Code.CREATED, status_enum_1.Status.CREATED, 'Tds_schede_documentazioniFotografica created', tds_schede_documentazioniFotografica));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.createTds_schede_documentazioniFotografica = createTds_schede_documentazioniFotografica;
const updateTds_schede_documentazioniFotografica = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    let tds_schede_documentazioniFotografica = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, [req.params.tds_schede_documentazioniFotograficaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.UPDATE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, [...Object.values(tds_schede_documentazioniFotografica), req.params.tds_schede_documentazioniFotograficaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_documentazioniFotografica updated', Object.assign(Object.assign({}, tds_schede_documentazioniFotografica), { id: req.params.tds_schede_documentazioniFotograficaId })));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_documentazioniFotografica not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.updateTds_schede_documentazioniFotografica = updateTds_schede_documentazioniFotografica;
const deleteTds_schede_documentazioniFotografica = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.SELECT_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, [req.params.tds_schede_documentazioniFotograficaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(tds_schede_documentazioniFotografica_1.QUERY.DELETE_TDS_SCHEDE_DOCUMENTAZIONIFOTOGRAFICA, [req.params.tds_schede_documentazioniFotograficaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_documentazioniFotografica deleted'));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_documentazioniFotografica not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.deleteTds_schede_documentazioniFotografica = deleteTds_schede_documentazioniFotografica;
