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
const advancedSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const searchCriteria = {
            titoloOpera: req.query.titoloOpera,
            corpoScheda: req.query.corpoScheda,
            iscrizioni: req.query.iscrizioni,
            descrizioneSintetica: req.query.descrizioneSintetica,
            storiaEspositiva: req.query.storiaEspositiva,
            classificazione: req.query.classificazione,
            formulaPrecedente: req.query.formulaPrecedente,
            formulaSuccessiva: req.query.formulaSuccessiva,
            categoria: req.query.categoria,
            nomeAutore: req.query.nomeAutore,
            ambitoStorico: req.query.ambitoStorico,
            dataDadataA: req.query.dataDadataA,
            nomeMateriale: req.query.nomeMateriale,
            descrizioneMateriale: req.query.descrizioneMateriale,
            nomeTecnica: req.query.nomeTecnica,
            descrizioneTecnica: req.query.descrizioneTecnica,
            ubicazione: req.query.ubicazione,
            descrizioneUbicazione: req.query.descrizioneUbicazione,
            nomeInventario: req.query.nomeInventario,
            nomeProvenienza: req.query.nomeProvenienza,
            descrizioneProvenienza: req.query.descrizioneProvenienza,
            curatore: req.query.curatore,
            titoloMostra: req.query.titoloMostra,
            dataInizioMostradataFineMostra: req.query.dataInizioMostradataFineMostra,
            luogoMostra: req.query.luogoMostra,
            descrizioneMostra: req.query.descrizioneMostra,
            riferimentoBibliografico: req.query.riferimentoBibliografico,
            altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico,
            documentazioniFotografiche: req.query.documentazioniFotografiche,
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
                    responses.push(result[0]); // Appendi il risultato a responses
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
