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
exports.advancedSearch = void 0;
const mysql_config_1 = require("../config/mysql.config");
const response_1 = require("../domain/response");
const code_enum_1 = require("../enum/code.enum");
const status_enum_1 = require("../enum/status.enum");
const search_query_1 = require("../query/search.query");
const validator = require('validator');
const sqlstring = require('sqlstring');
const advancedSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const searchCriteria = {
            queryGenerica: validator.escape(req.query.queryGenerica),
            titoloOpera: validator.escape(req.query.titoloOpera),
            corpoScheda: validator.escape(req.query.corpoScheda),
            iscrizioni: validator.escape(req.query.iscrizioni),
            descrizioneSintetica: validator.escape(req.query.descrizioneSintetica),
            storiaEspositiva: validator.escape(req.query.storiaEspositiva),
            classificazione: validator.escape(req.query.classificazione),
            formulaPrecedente: validator.escape(req.query.formulaPrecedente),
            formulaSuccessiva: validator.escape(req.query.formulaSuccessiva),
            categoria: validator.escape(req.query.categoria),
            nomeAutore: validator.escape(req.query.nomeAutore),
            ambitoStorico: validator.escape(req.query.ambitoStorico),
            dataDadataA: validator.escape(req.query.dataDadataA),
            nomeMateriale: validator.escape(req.query.nomeMateriale),
            descrizioneMateriale: validator.escape(req.query.descrizioneMateriale),
            nomeTecnica: validator.escape(req.query.nomeTecnica),
            descrizioneTecnica: validator.escape(req.query.descrizioneTecnica),
            ubicazione: validator.escape(req.query.ubicazione),
            descrizioneUbicazione: validator.escape(req.query.descrizioneUbicazione),
            nomeInventario: validator.escape(req.query.nomeInventario),
            nomeProvenienza: validator.escape(req.query.nomeProvenienza),
            descrizioneProvenienza: validator.escape(req.query.descrizioneProvenienza),
            curatore: validator.escape(req.query.curatore),
            titoloMostra: validator.escape(req.query.titoloMostra),
            dataInizioMostradataFineMostra: validator.escape(req.query.dataInizioMostradataFineMostra),
            luogoMostra: validator.escape(req.query.luogoMostra),
            descrizioneMostra: validator.escape(req.query.descrizioneMostra),
            riferimentoBibliografico: validator.escape(req.query.riferimentoBibliografico),
            altroRiferimentoBibliografico: validator.escape(req.query.altroRiferimentoBibliografico),
            documentazioniFotografiche: validator.escape(req.query.documentazioniFotografiche),
        };
        let responses = [];
        for (const key in searchCriteria) {
            if (searchCriteria.hasOwnProperty(key)) {
                const value = searchCriteria[key];
                if (value !== undefined && value !== '' && value !== ' ') {
                    const dynamicQuery = (0, search_query_1.buildDynamicQuery)(key, String(value));
                    if (dynamicQuery === undefined) {
                        continue;
                    }
                    const pool = yield (0, mysql_config_1.connection)();
                    const result = yield pool.query(dynamicQuery);
                    responses.push(result[0]);
                    pool.end();
                }
            }
        }
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Schede retrieved', responses));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.advancedSearch = advancedSearch;
