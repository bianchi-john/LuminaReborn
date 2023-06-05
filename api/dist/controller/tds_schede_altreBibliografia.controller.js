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
exports.deleteTds_schede_altreBibliografia = exports.updateTds_schede_altreBibliografia = exports.createTds_schede_altreBibliografia = exports.getTds_schede_altreBibliografia = exports.getTds_schede_altreBibliografie = void 0;
const mysql_config_1 = require("../config/mysql.config");
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const tds_schede_altreBibliografia_query_1 = require("../query/tds_schede_altreBibliografia.query");
const getTds_schede_altreBibliografie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIE);
        pool.end();
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_altreBibliografie retrieved', result[0]));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getTds_schede_altreBibliografie = getTds_schede_altreBibliografie;
const getTds_schede_altreBibliografia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
        if ((result[0]).length > 0) {
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_altreBibliografia retrieved', result[0]));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.getTds_schede_altreBibliografia = getTds_schede_altreBibliografia;
const createTds_schede_altreBibliografia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    let tds_schede_altreBibliografia = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.CREATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, Object.values(tds_schede_altreBibliografia));
        tds_schede_altreBibliografia = Object.assign({ id: result[0].insertId }, req.body);
        return res.status(code_enum_1.Code.CREATED)
            .send(new response_1.HttpResponse(code_enum_1.Code.CREATED, status_enum_1.Status.CREATED, 'Tds_schede_altreBibliografia created', tds_schede_altreBibliografia));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.createTds_schede_altreBibliografia = createTds_schede_altreBibliografia;
const updateTds_schede_altreBibliografia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    let tds_schede_altreBibliografia = Object.assign({}, req.body);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.UPDATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [...Object.values(tds_schede_altreBibliografia), req.params.tds_schede_altreBibliografiaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_altreBibliografia updated', Object.assign(Object.assign({}, tds_schede_altreBibliografia), { id: req.params.tds_schede_altreBibliografiaId })));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.updateTds_schede_altreBibliografia = updateTds_schede_altreBibliografia;
const deleteTds_schede_altreBibliografia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = yield (0, mysql_config_1.connection)();
        const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
        if ((result[0]).length > 0) {
            const result = yield pool.query(tds_schede_altreBibliografia_query_1.QUERY.DELETE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
            pool.end();
            return res.status(code_enum_1.Code.OK)
                .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Tds_schede_altreBibliografia deleted'));
        }
        else {
            return res.status(code_enum_1.Code.NOT_FOUND)
                .send(new response_1.HttpResponse(code_enum_1.Code.NOT_FOUND, status_enum_1.Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.deleteTds_schede_altreBibliografia = deleteTds_schede_altreBibliografia;
