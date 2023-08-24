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
            queryGenerica: req.query.queryGenerica ? validator.escape(req.query.queryGenerica) : '',
            titoloOpera: req.query.titoloOpera ? validator.escape(req.query.titoloOpera) : '',
            corpoScheda: req.query.corpoScheda ? validator.escape(req.query.corpoScheda) : '',
            iscrizioni: req.query.iscrizioni ? validator.escape(req.query.iscrizioni) : '',
            descrizioneSintetica: req.query.descrizioneSintetica ? validator.escape(req.query.descrizioneSintetica) : '',
            storiaEspositiva: req.query.storiaEspositiva ? validator.escape(req.query.storiaEspositiva) : '',
            classificazione: req.query.classificazione ? validator.escape(req.query.classificazione) : '',
            categoria: req.query.categoria ? validator.escape(req.query.categoria) : '',
            nomeAutore: req.query.nomeAutore ? validator.escape(req.query.nomeAutore) : '',
            ambitoStorico: req.query.ambitoStorico ? validator.escape(req.query.ambitoStorico) : '',
            dataDadataA: req.query.dataDadataA ? validator.escape(req.query.dataDadataA) : '',
            nomeMateriale: req.query.nomeMateriale ? validator.escape(req.query.nomeMateriale) : '',
            nomeTecnica: req.query.nomeTecnica ? validator.escape(req.query.nomeTecnica) : '',
            ubicazione: req.query.ubicazione ? validator.escape(req.query.ubicazione) : '',
            nomeInventario: req.query.nomeInventario ? validator.escape(req.query.nomeInventario) : '',
            nomeProvenienza: req.query.nomeProvenienza ? validator.escape(req.query.nomeProvenienza) : '',
            curatore: req.query.curatore ? validator.escape(req.query.curatore) : '',
            titoloMostra: req.query.titoloMostra ? validator.escape(req.query.titoloMostra) : '',
            dataInizioMostradataFineMostra: req.query.dataInizioMostradataFineMostra ? validator.escape(req.query.dataInizioMostradataFineMostra) : '',
            luogoMostra: req.query.luogoMostra ? validator.escape(req.query.luogoMostra) : '',
            riferimentoBibliografico: req.query.riferimentoBibliografico ? validator.escape(req.query.riferimentoBibliografico) : '',
            altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico ? validator.escape(req.query.altroRiferimentoBibliografico) : '',
            documentazioniFotografiche: req.query.documentazioniFotografiche ? validator.escape(req.query.documentazioniFotografiche) : '',
        };
        let ok = false;
        let responses = [];
        for (const key in searchCriteria) {
            if (searchCriteria.hasOwnProperty(key)) {
                const value = searchCriteria[key];
                if (value !== undefined && value !== '' && value !== ' ') {
                    ok = true;
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
        if (ok == false) {
            return res.status(code_enum_1.Code.OK);
        }
        let responseCount = {};
        for (let response of responses[0]) {
            let responseString = JSON.stringify(response);
            responseCount[responseString] = (responseCount[responseString] || 0) + 1;
        }
        let uniqueResponses = [];
        let seenItems = {};
        for (let response of responses[0]) {
            let responseString = JSON.stringify(response);
            if (!seenItems[responseString]) {
                if (responseCount[responseString] > 1) {
                    uniqueResponses.unshift(response);
                }
                else {
                    uniqueResponses.push(response);
                }
                seenItems[responseString] = true;
            }
        }
        let uniqueResponsesWithInformation = [];
        for (let i = 0; i < uniqueResponses.length; i++) {
            let pool = yield (0, mysql_config_1.connection)();
            let finalResult = yield pool.query(`SELECT s.*, a.*, u.*, p.*, c.*, t.*, m.*, i.*, imm.*
        FROM schede s
        LEFT JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda
        LEFT JOIN autori a ON tsa.id_autore = a.id
        LEFT JOIN tds_schede_ubicazioni tsu ON s.id = tsu.id_scheda
        LEFT JOIN ubicazioni u ON tsu.id_ubicazione = u.id
        LEFT JOIN tds_schede_provenienze tsp ON s.id = tsp.id_scheda
        LEFT JOIN provenienze p ON tsp.id_provenienza = p.id
        LEFT JOIN tds_schede_cronologie tsc ON s.id = tsc.id_scheda
        LEFT JOIN cronologie c ON tsc.id_cronologia = c.id
        LEFT JOIN tds_schede_tecniche tst ON s.id = tst.id_scheda
        LEFT JOIN tecniche t ON tst.id_tecnica = t.id
        LEFT JOIN tds_schede_materiali tsn ON s.id = tsn.id_scheda
        LEFT JOIN materiali m ON tsn.id_materiale = m.id
        LEFT JOIN tds_schede_inventari tsi ON s.id = tsi.id_scheda
        LEFT JOIN inventari i ON tsi.id_inventario = i.id
        LEFT JOIN tds_schede_immagini tsim ON s.id = tsim.id_scheda
        LEFT JOIN immagini imm ON tsim.id_immagine = imm.id
        WHERE s.id = ` + uniqueResponses[i].id + `;`);
            uniqueResponsesWithInformation.push(finalResult[0], uniqueResponses[i].id);
        }
        return res.status(code_enum_1.Code.OK)
            .send(new response_1.HttpResponse(code_enum_1.Code.OK, status_enum_1.Status.OK, 'Schede retrieved', uniqueResponsesWithInformation));
    }
    catch (error) {
        console.error(error);
        return res.status(code_enum_1.Code.INTERNAL_SERVER_ERROR)
            .send(new response_1.HttpResponse(code_enum_1.Code.INTERNAL_SERVER_ERROR, status_enum_1.Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
});
exports.advancedSearch = advancedSearch;
